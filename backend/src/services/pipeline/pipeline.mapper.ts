import { ReceivedEmail as PrismaReceivedEmail, Account } from '@prisma/client';

import { PipelineMessage } from '@/types/pipeline.types';

interface MapEmailOptions {
  account?: Account | null;
}

type ReceivedEmailLike = PrismaReceivedEmail & {
  account?: Account | null;
  thread?: unknown;
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

export const mapReceivedEmailToPipelineMessage = (
  email: ReceivedEmailLike,
  options?: MapEmailOptions
): PipelineMessage => {
  const fromRaw = getEmailAddress(email.from_);
  const fromAddress = formatEmailAddress(email.from_);
  const accountEmail = normalizeEmail(options?.account?.email);
  const direction = accountEmail && normalizeEmail(fromRaw.address) === accountEmail ? 'outbound' : 'inbound';

  return {
    id: email.id,
    subject: email.subject ?? '',
    bodyPreview: email.bodyPreview ?? '',
    body: extractBody(email.body),
    from: fromAddress,
    to: extractRecipients(email.toRecipients),
    cc: extractRecipients(email.ccRecipients),
    category: undefined,
    direction,
    sentAt: email.sentDateTime?.toISOString(),
    receivedAt: email.receivedDateTime?.toISOString(),
  };
};

