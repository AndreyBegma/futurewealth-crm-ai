import { ReceivedEmail } from '@/types/recievedEmail.type';
import prisma from '@/config/database';

class RecivedEmailRepository {
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
}

export default new RecivedEmailRepository();
