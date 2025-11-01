import { Worker, Job } from 'bullmq';

import RedisConfig from '@/config/redis';
import { EmailAnalysisJobData, EmailAnalysisResult } from '../jobs/emailAnalysis.jobs';
import { bull } from '@/config/config';
import receivedEmailRepository from '@/repositories/receivedEmail.repository';

import { ProcessingStatus, RedactionEntityType, Account, RoutingAction } from '@prisma/client';
import { PipelineMessage } from '@/types/pipeline.types';
import threadService from '@/services/thread.service';
import accountService from '@/services/account.service';
import queueConfigService from '@/services/queueConfig.service';
import redactionService from '@/services/redaction.service';
import pipelineService from '@/services/pipeline.service';
import accountInsightRepository from '@/repositories/accountInsight.repository';
import sentimentFactRepository from '@/repositories/sentimentFact.repository';
import emailThreadRepository from '@/repositories/emailThread.repository';
import routingPolicyService from '@/services/routingPolicy.service';

export const createEmailAnalysisWorker = async () => {
  const config = await queueConfigService.getQueueConfig('email-analysis');
  const concurrency = config?.concurrency ?? bull.workerConcurrency;
  const maxJobsPerMin = config?.maxJobsPerMin ?? bull.maxJobsPerMinute;

  const worker = new Worker<EmailAnalysisJobData, EmailAnalysisResult>(
    'email-analysis',
    async (job: Job<EmailAnalysisJobData>) => {
      const { emailId } = job.data;
      const startTime = Date.now();

      try {
        console.log(`[EmailAnalysisWorker] Processing email ${emailId}...`);

        const email = await receivedEmailRepository.findById(emailId);
        if (!email) {
          throw new Error(`Email ${emailId} not found`);
        }

        if (email.processingStatus === ProcessingStatus.COMPLETED && email.hasAnalysis) {
          console.log(`[EmailAnalysisWorker] Email ${emailId} already processed, skipping`);
          return {
            success: true,
            message: 'Already processed',
            emailId,
            accountId: email.accountId || undefined,
            threadId: email.threadId || undefined,
          };
        }

        await receivedEmailRepository.updateProcessing(emailId, {
          processingStatus: ProcessingStatus.PROCESSING,
        });

        const account = await accountService.findOrCreate(email);
        console.log(`[EmailAnalysisWorker] Account: ${account.id} (${account.email})`);

        const thread = await threadService.findOrCreate(email, account);
        console.log(`[EmailAnalysisWorker] Thread: ${thread.id} (${thread.normalizedSubject})`);

        const baseEntities = [
          account.email
            ? { value: account.email, type: RedactionEntityType.EMAIL, caseInsensitive: false }
            : null,
          account.name
            ? { value: account.name, type: RedactionEntityType.NAME, caseInsensitive: true }
            : null,
          account.company
            ? { value: account.company, type: RedactionEntityType.COMPANY, caseInsensitive: true }
            : null,
        ].filter(Boolean) as {
          value: string;
          type: RedactionEntityType;
          caseInsensitive?: boolean;
        }[];

        const threadEmails = await receivedEmailRepository.findByThreadId(thread.id);
        const emailMap = new Map<string, any>();
        for (const item of threadEmails) {
          emailMap.set(item.id, item);
        }
        emailMap.set(email.id, email);

        const allEmails = Array.from(emailMap.values()).sort((a, b) => {
          const aDate = a.sentDateTime || a.receivedDateTime || a.createdAt;
          const bDate = b.sentDateTime || b.receivedDateTime || b.createdAt;
          return new Date(aDate ?? 0).getTime() - new Date(bDate ?? 0).getTime();
        });

        const participantNames = collectParticipantNames(allEmails);
        for (const name of participantNames) {
          baseEntities.push({
            value: name,
            type: RedactionEntityType.NAME,
            caseInsensitive: true,
          });
        }

        const redactionSession = redactionService.createSession({
          scope: account.id,
          entities: baseEntities,
        });

        const routingEvaluation = await routingPolicyService.resolveAction({
          accountName: account.name ?? undefined,
          accountEmail: account.email ?? undefined,
          messages: allEmails.map((item) => ({
            subject: item.subject ?? '',
            body: extractBody(item.body),
            from: formatEmailAddress(item.from_),
            to: extractRecipients(item.toRecipients),
            cc: extractRecipients(item.ccRecipients),
          })),
        });

        const routingAction = routingEvaluation.action;
        if (routingEvaluation.matchedRule) {
          console.log(
            `[EmailAnalysisWorker] Routing rule matched (${routingEvaluation.matchedRule.type}) -> ${routingAction}`
          );
        }

        const pipelineMessages: PipelineMessage[] = [];
        for (const item of allEmails) {
          const mapped = mapReceivedEmailToPipelineMessageLocal(item, account);

          const redacted = await redactionSession.redactMessage({
            subject: mapped.subject,
            bodyPreview: mapped.bodyPreview,
            body: mapped.body,
            from: mapped.from,
            to: mapped.to,
            cc: mapped.cc,
          });

          const sanitizedTo = redacted.to ?? mapped.to ?? [];
          const sanitizedCc = redacted.cc ?? mapped.cc ?? [];

          pipelineMessages.push({
            ...mapped,
            subject: redacted.subject ?? mapped.subject,
            bodyPreview: redacted.bodyPreview ?? mapped.bodyPreview,
            body: redacted.body ?? mapped.body,
            from: redacted.from ?? mapped.from,
            to: sanitizedTo,
            cc: sanitizedCc,
          });
        }

        const sentimentInput = {
          account: account.company || account.name || account.email || 'Unknown account',
          messages: pipelineMessages,
        };

        const sentimentResult = await pipelineService.runSentimentPipeline(sentimentInput);
        const sentimentData = sentimentResult?.sentiment ?? {};

        await sentimentFactRepository.create({
          accountId: account.id,
          threadId: thread.id,
          emailId,
          overall: sentimentData.overall || 'neutral',
          score: typeof sentimentData.score === 'number' ? sentimentData.score : 0,
          confidence:
            typeof sentimentData.confidence === 'number' ? sentimentData.confidence : 0,
          riskTags: sentimentData.risk_tags ?? sentimentData.riskTags ?? [],
          capturedAt: email.receivedDateTime ?? email.sentDateTime ?? new Date(),
        });

        let summariseResult: any = null;

        if (routingAction !== RoutingAction.SENTIMENT_ONLY) {
          const contactNames = (account.name || '').split(/\s+/).filter(Boolean);
          const contactFirstName = contactNames.shift();
          const contactLastName = contactNames.length ? contactNames.join(' ') : undefined;

          const contactProfile = account
            ? {
                firstName: contactFirstName
                  ? await redactionSession.redactText(contactFirstName)
                  : '',
                lastName: contactLastName
                  ? await redactionSession.redactText(contactLastName)
                  : '',
                email: account.email ? await redactionSession.redactText(account.email) : '',
                role: '',
                company: account.company
                  ? await redactionSession.redactText(account.company)
                  : '',
                personalNotes: '',
                businessNotes: '',
                tonePreference: '',
              }
            : undefined;

          const summariseInput = {
            account: sentimentInput.account,
            contact: contactProfile,
            messages: pipelineMessages,
            attachments: [] as any[],
          };

          summariseResult = await pipelineService.runSummarisePipeline(summariseInput);

          await accountInsightRepository.create({
            accountId: account.id,
            threadId: thread.id,
            payload: summariseResult,
          });

          if (summariseResult?.summary || summariseResult?.actions) {
            await emailThreadRepository.updateWithAI(thread.id, {
              summary: summariseResult.summary,
              actions: summariseResult.actions,
              topicTags: summariseResult.business,
            });
          }
        } else {
          console.log('[EmailAnalysisWorker] Routing action SENTIMENT_ONLY, skipping summarise');
        }

        await receivedEmailRepository.updateProcessing(emailId, {
          accountId: account.id,
          threadId: thread.id,
          hasAccount: true,
          hasThread: true,
          hasAnalysis: true,
          processingStatus: ProcessingStatus.COMPLETED,
          processedAt: new Date(),
          analyzedAt: new Date(),
        });

        const processingTime = Date.now() - startTime;
        console.log(
          `[EmailAnalysisWorker] Email ${emailId} processed successfully in ${processingTime}ms`
        );

        return {
          success: true,
          message: 'Email processed successfully',
          emailId,
          accountId: account.id,
          threadId: thread.id,
          processingTime,
        };
      } catch (error) {
        console.error('[EmailAnalysisWorker] Job failed:', error);

        await receivedEmailRepository.updateProcessing(emailId, {
          processingStatus: ProcessingStatus.FAILED,
        });

        throw error;
      }
    },
    {
      connection: RedisConfig.getClient(),
      prefix: bull.prefix,
      concurrency,
      limiter: {
        max: maxJobsPerMin,
        duration: 60000,
      },
    }
  );

  worker.on('completed', (job, result) => {
    console.log(`[EmailAnalysisWorker] Job ${job.id} completed`);
    console.log(`Result: ${result.message}`);
  });

  worker.on('failed', (job, error) => {
    console.log(`[EmailAnalysisWorker] Job ${job?.id} failed`);
    console.error(`Error: ${error.message}`);
  });

  worker.on('error', (error) => {
    console.error(`[EmailAnalysisWorker] Error: ${error}`);
  });

  worker.on('active', (job) => {
    console.log(`[EmailAnalysisWorker] Job ${job.id} is now active`);
  });

  const shutdown = async () => {
    console.log('[EmailAnalysisWorker] Shutting down gracefully...');
    await worker.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return worker;
};

const stripHtml = (value: string) =>
  value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getEmailAddress = (input: any) => {
  if (!input) {
    return { name: '', address: '' };
  }

  const data = input.emailAddress ?? input;
  const name = data?.name?.toString().trim();
  const address = data?.address?.toString().trim();

  return { name: name || '', address: address || '' };
};

const formatEmailAddress = (input: any) => {
  const { name, address } = getEmailAddress(input);

  if (name && address) {
    return `${name} <${address}>`;
  }

  return address || name || '';
};

const extractRecipients = (value: any) => {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value
    .map((recipient) => formatEmailAddress(recipient))
    .filter((item) => item.length > 0);
};

const extractBody = (body: any): string => {
  if (!body) {
    return '';
  }

  if (typeof body === 'string') {
    return body;
  }

  if (body.content) {
    const content = body.content.toString();
    if (body.contentType && body.contentType.toLowerCase() === 'html') {
      return stripHtml(content);
    }
    return content;
  }

  return '';
};

const normalizeEmail = (value: string | undefined) => value?.toLowerCase().trim() || '';

const extractRecipientNames = (value: any) => {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value
    .map((recipient) => getEmailAddress(recipient).name.trim())
    .filter((item) => item.length > 0);
};

const collectParticipantNames = (emails: any[]) => {
  const names = new Set<string>();

  for (const email of emails) {
    const fromName = getEmailAddress(email.from_).name.trim();
    if (fromName) {
      names.add(fromName);
    }

    extractRecipientNames(email.toRecipients).forEach((name) => names.add(name));
    extractRecipientNames(email.ccRecipients).forEach((name) => names.add(name));
  }

  return Array.from(names);
};

const mapReceivedEmailToPipelineMessageLocal = (
  emailRecord: any,
  account?: Account | null
): PipelineMessage => {
  const fromRaw = getEmailAddress(emailRecord.from_);
  const fromAddress = formatEmailAddress(emailRecord.from_);
  const accountEmail = normalizeEmail(account?.email);
  const direction: 'inbound' | 'outbound' =
    accountEmail && normalizeEmail(fromRaw.address) === accountEmail ? 'outbound' : 'inbound';

  return {
    id: emailRecord.id,
    subject: emailRecord.subject ?? '',
    bodyPreview: emailRecord.bodyPreview ?? '',
    body: extractBody(emailRecord.body),
    from: fromAddress,
    to: extractRecipients(emailRecord.toRecipients),
    cc: extractRecipients(emailRecord.ccRecipients),
    category: undefined,
    direction,
    sentAt: emailRecord.sentDateTime?.toISOString(),
    receivedAt: emailRecord.receivedDateTime?.toISOString(),
  };
};
