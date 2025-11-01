import accountRepository from '@/repositories/account.repository';
import { ReceivedEmail } from '@prisma/client';

class AccountService {
  private extractSenderEmail(email: ReceivedEmail): string {
    const from = email.from_ as any;
    return from?.emailAddress?.address || 'unknown@unknown.com';
  }

  private extractSenderName(email: ReceivedEmail): string | undefined {
    const from = email.from_ as any;
    return from?.emailAddress?.name;
  }

  private extractCompanyFromDomain(email: string): string | undefined {
    const domain = email.split('@')[1];
    if (!domain) return undefined;

    const companyName = domain.split('.')[0];

    return companyName.charAt(0).toUpperCase() + companyName.slice(1);
  }

  async findOrCreate(email: ReceivedEmail) {
    const senderEmail = this.extractSenderEmail(email);
    const senderName = this.extractSenderName(email);
    const company = this.extractCompanyFromDomain(senderEmail);
    const account = await accountRepository.upsert({
      email: senderEmail,
      name: senderName,
      company,
      incrementEmail: true,
      lastEmailAt: email.receivedDateTime || new Date(),
    });

    return account;
  }

  private normalizePipelineSentiment(sentiment: any) {
    if (!sentiment || typeof sentiment !== 'object') {
      return undefined;
    }

    const riskTags = Array.isArray(sentiment.risk_tags)
      ? sentiment.risk_tags
      : Array.isArray(sentiment.riskTags)
      ? sentiment.riskTags
      : [];

    const payload = {
      overall: sentiment.overall ?? null,
      score: typeof sentiment.score === 'number' ? sentiment.score : null,
      confidence: typeof sentiment.confidence === 'number' ? sentiment.confidence : null,
      riskTags,
    };

    return this.cleanJson(payload);
  }

  private normalizeSummariseSentiment(sentiment: any) {
    if (!sentiment || typeof sentiment !== 'object') {
      return undefined;
    }

    const riskTags = Array.isArray(sentiment.risk_tags)
      ? sentiment.risk_tags
      : Array.isArray(sentiment.riskTags)
      ? sentiment.riskTags
      : [];

    const payload = {
      sevenDayAverage: typeof sentiment['7d_avg'] === 'number' ? sentiment['7d_avg'] : null,
      thirtyDayTrend: typeof sentiment['30d_trend'] === 'string' ? sentiment['30d_trend'] : null,
      riskTags,
    };

    return this.cleanJson(payload);
  }

  private cleanJson<T>(value: T): T | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    const cleaned = JSON.parse(JSON.stringify(value));

    if (cleaned === null) {
      return undefined;
    }

    if (typeof cleaned === 'object' && !Array.isArray(cleaned) && Object.keys(cleaned).length === 0) {
      return undefined;
    }

    return cleaned;
  }

  async applyInsights(accountId: string, payload: {
    sentiment: any;
    summarise?: any;
    emailId: string;
    threadId: string;
  }) {
    const nowIso = new Date().toISOString();
    const updateData: any = {
      hasAIProfile: true,
    };

    if (payload.summarise) {
      const summarise = payload.summarise;

      const personalPayload = this.cleanJson({
        ...(summarise.personal ?? {}),
        summary: summarise.summary ?? '',
        actions: summarise.actions ?? [],
        supportingEmails: summarise.supporting_emails ?? [],
        updatedAt: nowIso,
        source: {
          emailId: payload.emailId,
          threadId: payload.threadId,
        },
      });

      const businessPayload = this.cleanJson({
        summary: summarise.summary ?? '',
        actions: summarise.actions ?? [],
        associates: summarise.business?.associates ?? [],
        projects: summarise.business?.projects ?? [],
        blockers: summarise.business?.blockers ?? [],
        supportingEmails: summarise.supporting_emails ?? [],
        updatedAt: nowIso,
        source: {
          emailId: payload.emailId,
          threadId: payload.threadId,
        },
      });

      if (personalPayload) {
        updateData.personal = personalPayload;
      }

      if (businessPayload) {
        updateData.business = businessPayload;
      }
    }

    const sentimentTrend: any = {
      updatedAt: nowIso,
      source: {
        emailId: payload.emailId,
        threadId: payload.threadId,
      },
    };

    const pipelineSentiment = this.normalizePipelineSentiment(payload.sentiment);
    if (pipelineSentiment) {
      sentimentTrend.pipeline = pipelineSentiment;
    }

    const summariseSentiment = this.normalizeSummariseSentiment(payload.summarise?.sentiment);
    if (summariseSentiment) {
      sentimentTrend.summarise = summariseSentiment;
    }

    const sentimentPayload = this.cleanJson(sentimentTrend);
    if (sentimentPayload) {
      updateData.sentimentTrend = sentimentPayload;
    }

    await accountRepository.updateWithAI(accountId, updateData);
  }
}

export default new AccountService()
