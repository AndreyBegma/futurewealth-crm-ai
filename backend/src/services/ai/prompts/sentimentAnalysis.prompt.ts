import { SentimentPipelineInput } from '@/types/pipeline.types';

const sanitize = (value?: string) =>
  value ? value.replace(/\s+/g, ' ').trim() : undefined;

const redact = (value?: string) =>
  value
    ? value
        .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, 'EMAIL_REDACTED')
        .replace(/\b\d{3}-\d{2}-\d{4}\b/g, 'ID_REDACTED')
        .replace(/\b\d{10,}\b/g, 'NUMBER_REDACTED')
    : undefined;

export const buildSentimentPrompt = (input: SentimentPipelineInput) => {
  const messages = input.messages.map((message) => ({
    id: message.id,
    subject: redact(sanitize(message.subject)) ?? '',
    bodyPreview: redact(sanitize(message.bodyPreview)),
    body: redact(sanitize(message.body)),
    from: redact(sanitize(message.from)) ?? '',
    to: (message.to || []).map((item) => redact(sanitize(item)) ?? ''),
    cc: (message.cc || []).map((item) => redact(sanitize(item)) ?? ''),
    direction: message.direction,
    category: message.category,
    sentAt: message.sentAt,
    receivedAt: message.receivedAt,
  }));

  const payload = {
    account: input.account,
    messages,
  };

  const serialized = JSON.stringify(payload, null, 2);

  return `You are the SentimentOnly pipeline for a client relationship monitoring system.
Your task is to analyse the following redacted email exchanges and produce a JSON object with the structure:
{
  "account": string,
  "sentiment": {
    "overall": "positive" | "neutral" | "negative",
    "score": number between -1 and 1,
    "confidence": number between 0 and 1,
    "risk_tags": [{ "tag": string, "confidence": number }]
  },
  "notes": string
}

Guidelines:
- Respect the redactions already applied and do not attempt to infer masked data.
- Base the sentiment on tone, intent, and urgency of messages.
- "risk_tags" should highlight any compliance, churn, or service risks discovered.
- Keep notes concise (max 120 words).
- Respond with valid JSON only, no additional text.

Input:
${serialized}`;
};

