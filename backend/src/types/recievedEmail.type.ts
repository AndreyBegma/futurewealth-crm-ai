import { Prisma } from '@prisma/client';

export interface EmailAddress {
  name: string;
  address: string;
}

export interface Recipient {
  emailAddress: EmailAddress;
}

export interface SingleValueExtendedProperty {
  id: string;
  value: string;
}

export interface ReceivedEmail {
  id: string;
  subject: string;
  body: Prisma.InputJsonValue;
  bodyPreview?: string;
  from_: Prisma.InputJsonValue;
  sender?: Prisma.InputJsonValue;
  toRecipients: Prisma.InputJsonValue;
  ccRecipients?: Prisma.InputJsonValue;
  bccRecipients?: Prisma.InputJsonValue;
  replyTo?: Prisma.InputJsonValue;
  sentDateTime?: Date;
  receivedDateTime?: Date;
  internetMessageId?: string;
  hasAttachments: boolean;
  isRead: boolean;
  webLink?: string;
  singleValueExtendedProperties?: Prisma.InputJsonValue;
  rawResponse?: Prisma.InputJsonValue;
  createdAt?: Date;
  updatedAt?: Date;
}