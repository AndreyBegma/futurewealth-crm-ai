import { ReceivedEmail } from '@/types/recievedEmail.type';
import prisma from '@/config/database';
import { ProcessingStatus } from '@prisma/client';

class RecivedEmailRepository {
  async findById(id: string) {
    return await prisma.receivedEmail.findUnique({
      where: { id },
      include: {
        account: true,
        thread: true,
      },
    });
  }

  async findByStatus(status: ProcessingStatus, limit = 100) {
    return await prisma.receivedEmail.findMany({
      where: { processingStatus: status },
      orderBy: { receivedDateTime: 'asc' },
      take: limit,
    });
  }

  async create(data: ReceivedEmail) {
    try {
      return await prisma.receivedEmail.create({ data });
    } catch (error) {
      throw error;
    }
  }

  async findByContactEmail(email: string, limit: number = 5) {
    return await prisma.receivedEmail.findMany({
      where: {
        from_: {
          path: ['emailAddress', 'address'],
          equals: email,
        },
      },
      orderBy: { sentDateTime: 'desc' },
      take: limit,
    });
  }

  async updateProcessing(
    id: string,
    data: {
      processingStatus?: ProcessingStatus;
      accountId?: string;
      threadId?: string;
      hasAccount?: boolean;
      hasThread?: boolean;
      hasAnalysis?: boolean;
      processedAt?: Date;
      analyzedAt?: Date;
    }
  ) {
    return await prisma.receivedEmail.update({
      where: { id },
      data,
    });
  }

  async findByThreadId(threadId: string) {
    return await prisma.receivedEmail.findMany({
      where: { threadId },
      orderBy: { sentDateTime: 'asc' },
    });
  }
  async findByAccountId(accountId: string, limit = 50) {
    return await prisma.receivedEmail.findMany({
      where: { accountId },
      orderBy: { receivedDateTime: 'desc' },
      take: limit,
    });
  }
}

export default new RecivedEmailRepository();
