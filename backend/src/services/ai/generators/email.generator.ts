import aiService from '../ai.service';
import receivedEmailRepository from '@/repositories/receivedEmail.repository';
import { SPAM_GENERATION_OPTIONS, SPAM_GENERATION_PROMPT } from '../prompts/spamCreate.prompt';
import { ChatOptions } from '../ai.interface';
import { ReceivedEmail } from '@/types/recievedEmail.type';
import { buildEmailPrompt, EMAIL_OPTIONS } from '../prompts/emailCreate.prompt';
import fakePersonRepository from '@/repositories/fakePerson.repository';

class EmailGenerator {
  async generateSpam(options?: ChatOptions) {
    try {
      const aiResponse = await aiService.chat(SPAM_GENERATION_PROMPT, {
        ...SPAM_GENERATION_OPTIONS,
        ...options,
      });

      const spamData = JSON.parse(aiResponse);
      const prismaData = this.mapToReceivedEmail(spamData);
      const savedEmail = await receivedEmailRepository.create(prismaData);

      return savedEmail;
    } catch (error) {
      console.error('[EmailGenerator] Failed to generate spam:', error);
      throw error;
    }
  }

  private parseNotesForContext(notes?: string | null) {
    if (!notes) return null;

    const projectMatches = notes.match(/Working on|Leading|Managing ([^.]+?)(?:\(|\.)/gi);
    const blockerMatches = notes.match(/(?:Waiting for|Blocked by|Needs) ([^.]+)/gi);

    return {
      projects: projectMatches?.map((p) => ({ name: p.trim() })) || [],
      blockers: blockerMatches?.map((b) => b.trim()) || [],
    };
  }

  private parseNotesForCommPrefs(notes?: string | null) {
    if (!notes) return null;

    const toneMatch = notes.match(/(Formal|Casual|Semi-formal) communicator/i);
    const channelMatch = notes.match(/prefers (email|calls|video|slack)/i);
    const responseMatch = notes.match(/responds (within|same-day|24-48h|slow)/i);

    return {
      tone: toneMatch?.[1]?.toLowerCase() || 'semi-formal',
      preferredChannel: channelMatch?.[1]?.toLowerCase() || 'email',
      responseTime: responseMatch?.[1] || 'same-day',
    };
  }

  private mapToReceivedEmail(spamData: any): ReceivedEmail {
    return {
      id: spamData.id,
      subject: spamData.subject,
      body: spamData.body,
      bodyPreview: spamData.bodyPreview,
      from_: spamData.from,
      sender: spamData.sender,
      toRecipients: spamData.toRecipients || [],
      ccRecipients: spamData.ccRecipients || [],
      bccRecipients: spamData.bccRecipients || [],
      replyTo: spamData.replyTo || [],
      sentDateTime: spamData.sentDateTime ? new Date(spamData.sentDateTime) : undefined,
      receivedDateTime: spamData.receivedDateTime ? new Date(spamData.receivedDateTime) : undefined,
      internetMessageId: spamData.internetMessageId,
      hasAttachments: spamData.hasAttachments ?? false,
      isRead: spamData.isRead ?? false,
      webLink: spamData.webLink,
      singleValueExtendedProperties: spamData.singleValueExtendedProperties || [],
      rawResponse: spamData,
    };
  }

  async generateFromContact(options?: {
    contactId?: string;
    includeHistory?: boolean;
    maxHistoryItems?: number;
  }) {
    try {
      let contact;

      if (options?.contactId) {
        contact = await fakePersonRepository.findById(options.contactId);
        if (!contact) throw new Error(`Contact with id ${options.contactId} not found`);
      } else {
        contact = await fakePersonRepository.findRandom();
        if (!contact) throw new Error('No contacts available in database');
      }

      let previousEmails: Array<{
        subject: string;
        bodyPreview?: string;
        sentDateTime?: Date;
      }> = [];
      if (options?.includeHistory !== false) {
        const emails = await receivedEmailRepository.findByContactEmail(
          contact.email,
          options?.maxHistoryItems || 5
        );
        previousEmails = emails.map((email) => ({
          subject: email.subject,
          bodyPreview: email.bodyPreview ?? undefined,
          sentDateTime: email.sentDateTime ?? undefined,
        }));
      }

      const parsedBusinessContext = this.parseNotesForContext(contact.notes);
      const parsedCommPrefs = this.parseNotesForCommPrefs(contact.notes);

      const prompt = buildEmailPrompt({
        contact: {
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          company: contact.company,
          companyDomain: contact.companyDomain ?? undefined,
          role: contact.role,
          industry: contact.industry,
          notes: contact.notes ?? undefined,
          personalNotes: contact.personalNotes ?? undefined,
          businessContext: parsedBusinessContext,
          communicationPreferences: parsedCommPrefs,
        },
        previousEmails,
      });

      const aiResponse = await aiService.chat(prompt, EMAIL_OPTIONS);

      const cleanedResponse = aiResponse
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      const emailData = JSON.parse(cleanedResponse);
      const prismaData = this.mapToReceivedEmail(emailData);

      prismaData.from_ = {
        emailAddress: {
          name: `${contact.firstName} ${contact.lastName}`,
          address: contact.email,
        },
      };
      prismaData.sender = prismaData.from_;

      const savedEmail = await receivedEmailRepository.create(prismaData);

      return savedEmail;
    } catch (error) {
      console.error('[EmailGenerator] Failed to generate email from contact:', error);
      throw error;
    }
  }
}

export default new EmailGenerator();
