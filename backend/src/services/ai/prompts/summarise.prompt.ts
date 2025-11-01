import { SummarisePipelineInput } from '@/types/pipeline.types';

const sanitize = (value?: string) =>
  value ? value.replace(/\s+/g, ' ').trim() : undefined;

const redact = (value?: string) =>
  value
    ? value
        .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, 'EMAIL_REDACTED')
        .replace(/\b\d{3}-\d{2}-\d{4}\b/g, 'ID_REDACTED')
    : undefined;

export const buildSummarisePrompt = (input: SummarisePipelineInput) => {
  const messages = input.messages.map((message) => ({
    id: message.id,
    subject: sanitize(message.subject) ?? '',
    bodyPreview: sanitize(message.bodyPreview) ?? '',
    body: sanitize(message.body) ?? '',
    from: sanitize(message.from) ?? '',
    to: (message.to || []).map((item) => sanitize(item) ?? ''),
    cc: (message.cc || []).map((item) => sanitize(item) ?? ''),
    category: message.category,
    direction: message.direction,
    sentAt: message.sentAt,
    receivedAt: message.receivedAt,
  }));

  const attachments = (input.attachments || []).map((attachment) => ({
    id: attachment.id,
    name: attachment.name,
    mimeType: attachment.mimeType,
    textContent: sanitize(attachment.textContent),
    source: attachment.source,
  }));

  const contact = input.contact
    ? {
        firstName: sanitize(input.contact.firstName),
        lastName: sanitize(input.contact.lastName),
        email: redact(sanitize(input.contact.email)),
        role: sanitize(input.contact.role),
        company: sanitize(input.contact.company),
        personalNotes: sanitize(input.contact.personalNotes),
        businessNotes: sanitize(input.contact.businessNotes),
        tonePreference: sanitize(input.contact.tonePreference),
      }
    : undefined;

  const payload = {
    account: input.account,
    contact,
    messages,
    attachments,
  };

  const serialized = JSON.stringify(payload, null, 2);

  return `You are the Summarise pipeline for a client relationship monitoring system.
Using the provided context, produce a JSON object that strictly conforms to this schema:
{
  "account": string,
  "summary": string,
  "actions": [{ "type": "callback"|"followup"|"meeting", "who": string, "when": string, "confidence": number }],
  "personal": {
    "birthday": string,
    "family": [{ "relation": "spouse"|"child"|"pet", "name": string }],
    "preferences": { "tone": string, "do_not_mention": string[] }
  },
  "business": {
    "associates": [{ "name": string, "role": string, "email": string }],
    "projects": [{ "topic": string, "status": string }],
    "blockers": string[]
  },
  "sentiment": {
    "7d_avg": number,
    "30d_trend": "up"|"flat"|"down",
    "risk_tags": [{ "tag": string, "confidence": number }]
  },
  "supporting_emails": [{ "id": string, "subject": string, "date": string }]
}

Guidelines:
- Use only details present in the input. Do not invent information.
- Prefer concise sentences in the summary and action cues.
- Populate arrays with empty arrays when no data is available.
- All fields are required; use empty string or [] where information is missing.
- Dates should be ISO 8601 if available; otherwise use empty string.
- Respond with valid JSON and no additional commentary.

Input:
${serialized}`;
};

