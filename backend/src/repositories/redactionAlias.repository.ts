import prisma from '@/config/database';
import { Prisma, RedactionAlias, RedactionEntityType } from '@prisma/client';

interface CreateAliasInput {
  placeholder: string;
  entityType: RedactionEntityType;
  realValue: string;
  hash?: string | null;
  scope?: string | null;
}

class RedactionAliasRepository {
  async findByPlaceholder(placeholder: string) {
    return prisma.redactionAlias.findUnique({
      where: { placeholder },
    });
  }

  async findByHash(hash: string, entityType: RedactionEntityType, scope?: string | null) {
    return prisma.redactionAlias.findFirst({
      where: {
        hash,
        entityType,
        scope: scope ?? null,
      },
    });
  }

  async create(data: CreateAliasInput): Promise<RedactionAlias> {
    return prisma.redactionAlias.create({
      data: {
        placeholder: data.placeholder,
        entityType: data.entityType,
        realValue: data.realValue,
        hash: data.hash ?? null,
        scope: data.scope ?? null,
      },
    });
  }

  async upsertByPlaceholder(placeholder: string, data: Omit<CreateAliasInput, 'placeholder'>) {
    const payload: Prisma.RedactionAliasUpdateInput = {
      entityType: data.entityType,
      realValue: data.realValue,
      hash: data.hash ?? null,
      scope: data.scope ?? null,
    };

    return prisma.redactionAlias.upsert({
      where: { placeholder },
      create: {
        placeholder,
        entityType: data.entityType,
        realValue: data.realValue,
        hash: data.hash ?? null,
        scope: data.scope ?? null,
      },
      update: payload,
    });
  }
}

export default new RedactionAliasRepository();

