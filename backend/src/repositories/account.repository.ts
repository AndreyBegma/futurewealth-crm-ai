import prisma from '@/config/database';
import { Account } from '@prisma/client';
class AccountRepository {
  async findByEmail(email: string): Promise<Account | null> {
    return await prisma.account.findUnique({
      where: { email },
      include: {
        threads: {
          orderBy: { lastMessageAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async findById(id: string): Promise<Account | null> {
    return await prisma.account.findUnique({
      where: { id },
      include: {
        threads: true,
        _count: {
          select: {
            emails: true,
            threads: true,
          },
        },
      },
    });
  }

  async create(data: {
    email: string;
    name?: string;
    company?: string;
    firstEmailAt: Date;
    lastEmailAt: Date;
  }): Promise<Account> {
    return await prisma.account.create({
      data: {
        email: data.email,
        name: data.name,
        company: data.company,
        totalEmails: 1,
        threadCount: 0,
        firstEmailAt: data.firstEmailAt,
        lastEmailAt: data.lastEmailAt,
        hasAIProfile: false,
      },
    });
  }
  async findAll(
    skip: number = 0,
    take: number = 50
  ): Promise<{ accounts: Account[]; total: number } | []> {
    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        skip,
        take,
        orderBy: { lastEmailAt: 'desc' },
        include: {
          _count: {
            select: {
              emails: true,
              threads: true,
            },
          },
        },
      }),
      prisma.account.count(),
    ]);

    return { accounts, total };
  }
  async upsert(data: {
    email: string;
    name?: string;
    company?: string;
    incrementEmail?: boolean;
    incrementThread?: boolean;
    lastEmailAt?: Date;
  }): Promise<Account> {
    const updateData: any = {};

    if (data.incrementEmail) {
      updateData.totalEmails = { increment: 1 };
    }
    if (data.incrementThread) {
      updateData.threadCount = { increment: 1 };
    }
    if (data.lastEmailAt) {
      updateData.lastEmailAt = data.lastEmailAt;
    }
    if (data.name) {
      updateData.name = data.name;
    }
    if (data.company) {
      updateData.company = data.company;
    }

    return await prisma.account.upsert({
      where: { email: data.email },
      create: {
        email: data.email,
        name: data.name,
        company: data.company,
        totalEmails: 1,
        threadCount: 0,
        firstEmailAt: data.lastEmailAt || new Date(),
        lastEmailAt: data.lastEmailAt || new Date(),
        hasAIProfile: false,
      },
      update: updateData,
    });
  }

  async updateWithAI(
    id: string,
    data: {
      name?: string;
      company?: string;
      totalEmails?: { increment: number };
      threadCount?: { increment: number };
      lastEmailAt?: Date;
      personal?: any;
      business?: any;
      sentimentTrend?: any;
      hasAIProfile?: boolean;
    }
  ): Promise<Account> {
    return await prisma.account.update({
      where: { id },
      data,
    });
  }
}

export default new AccountRepository();
