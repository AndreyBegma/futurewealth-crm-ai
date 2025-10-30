import { User } from '@prisma/client';
import prisma from '@/config/database';

class UserRepository {
  async existsByEmail(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return !!user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: {
    name?: string;
    email: string;
    password: string;
    passwordHash: string;
  }): Promise<User> {
    return await prisma.user.create({
      data: {
        name: data.name || null,
        email: data.email,
        password: data.passwordHash,
      },
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash },
    });
  }

  async delete(userId: string): Promise<User> {
    return await prisma.user.delete({
      where: { id: userId },
    });
  }
}

export default new UserRepository();
