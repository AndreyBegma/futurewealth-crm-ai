import { Prisma } from "@prisma/client";

export interface Account {
  id: string;
  email: string;
  name?: string;
  company?: string;

  totalEmails: number;
  threadCount: number;
  firstEmailAt?: Date;
  lastEmailAt?: Date;

  personal?: Prisma.InputJsonValue;
  business?: Prisma.InputJsonValue;
  sentimentTrend?: Prisma.InputJsonValue;
  hasAIProfile: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
