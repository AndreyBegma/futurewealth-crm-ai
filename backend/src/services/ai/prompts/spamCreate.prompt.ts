import { ChatOptions } from '../ai.interface';

export const SPAM_GENERATION_SYSTEM_PROMPT = `You are an AI that generates realistic, professional-looking email messages.
Your goal is to create believable fictional emails that look like genuine business communication — NOT labeled as spam or test messages.
However, each message should subtly contain characteristics typical of marketing or spammy content (e.g., urgency, exaggerated promises, promotional tone).
All messages must be completely fictional and appear as if they were sent by a real person or company.

Always return valid JSON matching the Microsoft Graph Message schema. Do not include explanations, comments, or text outside JSON.`;

export const SPAM_GENERATION_OPTIONS: ChatOptions = {
  systemPrompt: SPAM_GENERATION_SYSTEM_PROMPT,
  format: 'json',
  temperature: 0.85,
  maxTokens: 800,
  retries: 3,
};

export const SPAM_GENERATION_PROMPT = `
Generate a fictional, realistic business email message that appears genuine but contains subtle spam-like elements.
Do NOT explicitly say that it's spam — the message must look natural and professional.

Return ONLY valid JSON in the following Microsoft Graph message format:
{
  "id": "unique GUID (e.g. 'e5a1c24a-bd12-4a7b-8f4e-9f7c7a9c6f43')",
  "subject": "subject line of the email",
  "body": {
    "contentType": "HTML | Text",
    "content": "email body text or HTML"
  },
  "bodyPreview": "short 1-2 sentence preview of the email body",
  "from": {
    "emailAddress": {
      "name": "sender name (fictional)",
      "address": "sender@example.test"
    }
  },
  "sender": {
    "emailAddress": {
      "name": "sender name (same as 'from')",
      "address": "sender@example.test"
    }
  },
  "toRecipients": [
    {
      "emailAddress": {
        "name": "recipient full name (fictional)",
        "address": "recipient@example.com"
      }
    }
  ],
  "ccRecipients": [],
  "bccRecipients": [],
  "replyTo": [],
  "sentDateTime": "ISO 8601 timestamp (UTC)",
  "receivedDateTime": "ISO 8601 timestamp (UTC)",
  "internetMessageId": "<unique-message-id@example.test>",
  "hasAttachments": false,
  "isRead": false,
  "webLink": "https://outlook.office365.com/mail/inbox/id/unique-message-id",
  "singleValueExtendedProperties": [
    {
      "id": "String {00020329-0000-0000-C000-000000000046} Name SpamHints",
      "value": "short comma-separated hints for why this email might look like spam (e.g. 'urgent CTA, promotional tone, too-good-to-be-true offer')"
    }
  ]
}

Requirements:
- The email must look like a genuine B2B or B2C message, not a test.
- Sender and recipient must be fictional.
- Tone should be natural but contain hidden spam-like patterns (e.g., strong CTA, exaggerated promises, urgency).
- Subject lines should sound professional and relevant to business but hint at marketing.
- Return ONLY valid JSON, no comments or Markdown.
`;
