import prisma from '@/config/database';

class SentimentFactRepository {
  async create(data: {
    accountId: string;
    overall: string;
    score: number;
    confidence: number;
    riskTags: any;
    threadId?: string | null;
    emailId?: string | null;
    capturedAt?: Date;
  }) {
    return prisma.sentimentFact.create({
      data: {
        accountId: data.accountId,
        threadId: data.threadId ?? null,
        emailId: data.emailId ?? null,
        overall: data.overall,
        score: data.score,
        confidence: data.confidence,
        riskTags: data.riskTags,
        capturedAt: data.capturedAt ?? new Date(),
      },
    });
  }

  async getRecentByAccount(accountId: string, limit = 30) {
    return prisma.sentimentFact.findMany({
      where: { accountId },
      orderBy: { capturedAt: 'desc' },
      take: limit,
    });
  }
}

export default new SentimentFactRepository();

