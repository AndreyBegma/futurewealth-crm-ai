import { FakeContact } from '@/types/fakePerson.types';
import prisma from '@/config/database';
import { Prisma } from '@prisma/client';

class FakePersonRepository {
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private normalizeDomain(domain: string | undefined): string | undefined {
    if (!domain) return undefined;
    return domain
      .toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?/, '')
      .replace(/\/$/, '')
      .trim();
  }

  private validateRequiredFields(data: FakeContact): void {
    const requiredFields = ['firstName', 'lastName', 'email', 'company', 'role', 'industry'];

    for (const field of requiredFields) {
      const value = data[field as keyof FakeContact];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        throw new Error(`Field '${field}' is required and cannot be empty`);
      }
    }
  }

  async create(data: FakeContact) {
    this.validateRequiredFields(data);

    const trimmedData = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      company: data.company.trim(),
      role: data.role.trim(),
      industry: data.industry.trim(),
      fullName: data.fullName?.trim(),
      companyDomain: data.companyDomain?.trim(),
      notes: data.notes?.trim(),
      personalNotes: data.personalNotes?.trim(),
    };

    if (!this.validateEmail(trimmedData.email)) {
      throw new Error(`Invalid email format: ${trimmedData.email}`);
    }

    const normalizedDomain = this.normalizeDomain(trimmedData.companyDomain);

    try {
      return await prisma.fakePerson.create({
        data: {
          firstName: trimmedData.firstName,
          lastName: trimmedData.lastName,
          fullName: trimmedData.fullName || `${trimmedData.firstName} ${trimmedData.lastName}`,
          email: trimmedData.email,
          company: trimmedData.company,
          companyDomain: normalizedDomain,
          role: trimmedData.role,
          industry: trimmedData.industry,
          notes: trimmedData.notes,
          personalNotes: trimmedData.personalNotes,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error(`Email '${trimmedData.email}' already exists`);
      }
      throw error;
    }
  }

  async findByEmail(email: string) {
    return await prisma.fakePerson.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.fakePerson.count({
      where: { email: email.toLowerCase().trim() },
    });
    return count > 0;
  }

  async findById(id: string) {
    return await prisma.fakePerson.findUnique({
      where: { id },
    });
  }

  async findRandom() {
    const count = await prisma.fakePerson.count();
    if (count === 0) return null;

    const skip = Math.floor(Math.random() * count);
    return await prisma.fakePerson.findFirst({ skip });
  }
}

export default new FakePersonRepository();
