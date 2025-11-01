import prisma from '@/config/database';

class AccountInsightRepository {
  async create(data: { accountId: string; payload: any; threadId?: string | null }) {
    return prisma.accountInsight.create({
      data: {
        accountId: data.accountId,
        threadId: data.threadId ?? null,
        payload: data.payload,
      },
    });
  }

  async getLatestByAccount(accountId: string) {
    return prisma.accountInsight.findFirst({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLatestByThread(threadId: string) {
    return prisma.accountInsight.findFirst({
      where: { threadId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default new AccountInsightRepository();

