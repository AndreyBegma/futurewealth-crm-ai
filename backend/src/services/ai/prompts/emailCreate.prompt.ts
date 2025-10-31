import { ChatOptions } from '../ai.interface';

export const EMAIL_GENERATION_SYSTEM_PROMPT = `You are generating realistic business emails from real contacts.
  Your goal:
  - Write natural, professional emails that reflect the sender's role and personality
  - Use provided business context (notes) to match communication style
  - Reference personal context (personalNotes) when relevant (e.g., "Sorry for delay, had family matter")
  - Continue previous conversations naturally OR start new topics
  - If previous emails mentioned meetings, you can reference them
  - Email should feel authentic and contextual

  IMPORTANT: Emails should NOT feel like cold spam. They should feel like:
  - Follow-ups to previous discussions (even if not in email history)
  - Responses to requests or inquiries
  - Updates on ongoing work or promised deliverables
  - Natural continuations of business relationships

  Always return valid JSON matching the Microsoft Graph Message schema.`;

export const EMAIL_OPTIONS: ChatOptions = {
  systemPrompt: EMAIL_GENERATION_SYSTEM_PROMPT,
  format: 'json',
  temperature: 0.9,
  maxTokens: 1000,
  retries: 3,
};

export const buildEmailPrompt = (context: {
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    companyDomain?: string;
    role: string;
    industry: string;
    notes?: string;
    personalNotes?: string;
  };
  previousEmails: Array<{
    subject: string;
    bodyPreview?: string;
    sentDateTime?: Date;
  }>;
}): string => {
  const { contact, previousEmails } = context;

  return `
  Generate a realistic business email from this contact:

  SENDER INFORMATION:
  - Name: ${contact.firstName} ${contact.lastName}
  - Email: ${contact.email}
  - Company: ${contact.company}${contact.companyDomain ? ` (${contact.companyDomain})` : ''}
  - Role: ${contact.role}
  - Industry: ${contact.industry}
  ${contact.notes ? `- Business characteristics: ${contact.notes}` : ''}
  ${contact.personalNotes ? `- Personal context: ${contact.personalNotes}` : ''}

  ${
    previousEmails.length > 0
      ? `
  PREVIOUS EMAIL HISTORY FROM THIS CONTACT:
  ${previousEmails
    .map(
      (email, i) => `
  ${i + 1}. Date: ${email.sentDateTime?.toISOString().split('T')[0] || 'Unknown'}
     Subject: ${email.subject}
     Preview: ${email.bodyPreview || 'N/A'}
  `
    )
    .join('\n')}

  INSTRUCTIONS:
  - You can continue conversation from previous emails
  - You can follow up on topics mentioned
  - You can start a completely new topic/conversation
  - You can reference personal context if relevant
  - If previous emails mentioned meetings, you can reference them naturally
  - Match the communication style from business characteristics
  `
      : `
  INSTRUCTIONS:
  This is the FIRST email in this email thread, BUT it should NOT feel like cold spam.

  Choose ONE of these natural scenarios (vary randomly to create diversity):

  WARM SCENARIOS (70% probability - choose one):
  1. "Follow-up after meeting/call" - Reference a recent meeting or phone conversation
     Example: "Great talking with you yesterday about..." or "Following up on our call last week..."

  2. "Sending promised materials" - You're delivering something that was requested or promised
     Example: "As promised, here are the reports/documents we discussed..." or "Attached is the analysis you requested..."

  3. "Continuation of offline discussion" - Reference LinkedIn, conference, or other channel interaction
     Example: "Thanks for connecting on LinkedIn. As we briefly discussed..." or "Great meeting you at [Conference Name]..."

  4. "Response to inquiry" - Acting as if recipient reached out (even if not in email history)
     Example: "Thank you for your inquiry about..." or "In response to your question about..."

  5. "Status update on ongoing work" - Providing updates on a project/collaboration
     Example: "Quick update on the project we're working on..." or "Wanted to share progress on..."

  6. "Checking in after delay" - Following up after some time gap
     Example: "Apologies for the delay in getting back to you..." or "I know it's been a while since we last spoke..."

  COLD SCENARIOS (30% probability - only if you must):
  7. "Soft introduction" - But make it feel personal and researched, NOT generic sales pitch
     Example: "I came across your work on [specific thing]..." NOT "We are a leading provider..."

  RULES FOR ALL SCENARIOS:
  - Match their role and industry in the context
  - Reflect communication style from business characteristics
  - Be specific with details (project names, dates, topics)
  - Avoid generic sales language like "leading provider", "innovative solutions", "explore opportunities"
  - Make it conversational and contextual
  `
  }

  RECIPIENT (you are writing TO this person):
  - Name: [Recipient Name]
  - Email: you@yourcompany.com

  Return ONLY valid JSON in this format:
  {
    "id": "unique-guid (e.g., 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')",
    "subject": "email subject line",
    "body": {
      "contentType": "HTML",
      "content": "full email body in HTML format"
    },
    "bodyPreview": "short 1-2 sentence preview of email content",
    "toRecipients": [
      {
        "emailAddress": {
          "name": "Recipient Name",
          "address": "you@yourcompany.com"
        }
      }
    ],
    "ccRecipients": [],
    "bccRecipients": [],
    "replyTo": [],
    "sentDateTime": "ISO 8601 timestamp (current or recent date)",
    "receivedDateTime": "ISO 8601 timestamp (same as sentDateTime or slightly after)",
    "internetMessageId": "<unique-message-id@${contact.companyDomain || 'example.com'}>",
    "hasAttachments": false,
    "isRead": false,
    "webLink": "https://outlook.office365.com/mail/inbox/id/AAMkAGI2TG93AAA=",
    "singleValueExtendedProperties": []
  }

  IMPORTANT: Return ONLY the JSON, no markdown, no explanations.
  `;
};
