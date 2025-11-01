import prisma from '@/config/database';
import { EmailThread } from '@prisma/client';

class EmailThreadRepository {
  async findByAccount(accountId: string): Promise<EmailThread | null> {
    return await prisma.emailThread.findFirst({
      where: {
        accountId,
      },
      include: {
        account: true,
        messages: {
          orderBy: { sentDateTime: 'asc' },
          take: 100,
        },
      },
    });
  }

  async findById(id: string): Promise<EmailThread | null> {
    return await prisma.emailThread.findUnique({
      where: { id },
      include: {
        account: true,
        messages: {
          orderBy: { sentDateTime: 'asc' },
        },
      },
    });
  }

  async create(data: {
    accountId: string;
    normalizedSubject: string;
    conversationId?: string;
    firstMessageAt: Date;
    lastMessageAt: Date;
  }): Promise<EmailThread> {
    return await prisma.emailThread.create({
      data: {
        accountId: data.accountId,
        normalizedSubject: data.normalizedSubject,
        conversationId: data.conversationId,
        messageCount: 1,
        firstMessageAt: data.firstMessageAt,
        lastMessageAt: data.lastMessageAt,
        hasAISummary: false,
      },
    });
  }

  async incrementMessageCount(id: string, lastMessageAt: Date): Promise<EmailThread> {
    return await prisma.emailThread.update({
      where: { id },
      data: {
        messageCount: { increment: 1 },
        lastMessageAt,
      },
    });
  }

  async updateWithAI(
    id: string,
    data: {
      summary?: string;
      actions?: any;
      topicTags?: any;
    }
  ): Promise<EmailThread> {
    return await prisma.emailThread.update({
      where: { id },
      data: {
        ...data,
        hasAISummary: true,
      },
    });
  }
}

export default new EmailThreadRepository();
