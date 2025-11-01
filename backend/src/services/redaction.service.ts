import crypto from 'crypto';

import redactionAliasRepository from '@/repositories/redactionAlias.repository';
import { RedactionEntityType } from '@prisma/client';

interface AliasRecord {
  placeholder: string;
  value: string;
  entityType: RedactionEntityType;
  scope?: string | null;
}

interface RedactEntitiesOption {
  value: string;
  type: RedactionEntityType;
  caseInsensitive?: boolean;
}

interface RedactTextOptions {
  scope?: string;
  entities?: RedactEntitiesOption[];
}

interface RedactionSession {
  redactText: (text: string, entities?: RedactEntitiesOption[]) => Promise<string>;
  redactMessage: (
    message: {
      subject?: string;
      bodyPreview?: string;
      body?: string;
      from?: string;
      to?: string[];
      cc?: string[];
      bcc?: string[];
    },
    entities?: RedactEntitiesOption[]
  ) => Promise<{
    subject?: string;
    bodyPreview?: string;
    body?: string;
    from?: string;
    to?: string[];
    cc?: string[];
    bcc?: string[];
  }>;
  getAliases: () => AliasRecord[];
}

class RedactionService {
  private readonly emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

  private readonly prefixMap: Record<RedactionEntityType, string> = {
    [RedactionEntityType.EMAIL]: 'EMAIL',
    [RedactionEntityType.NAME]: 'PERSON',
    [RedactionEntityType.COMPANY]: 'COMPANY',
    [RedactionEntityType.PHONE]: 'PHONE',
    [RedactionEntityType.OTHER]: 'ALIAS',
  };

  createSession(options?: { scope?: string; entities?: RedactEntitiesOption[] }): RedactionSession {
    const cache = new Map<string, AliasRecord>();
    const aliases: AliasRecord[] = [];
    const baseEntities = options?.entities ?? [];
    const scope = options?.scope;

    const redactText = async (text: string, entities: RedactEntitiesOption[] = []) =>
      this.redactTextInternal(text, scope, cache, aliases, [...baseEntities, ...entities]);

    const redactMessage = async (
      message: {
        subject?: string;
        bodyPreview?: string;
        body?: string;
        from?: string;
        to?: string[];
        cc?: string[];
        bcc?: string[];
      },
      entities: RedactEntitiesOption[] = []
    ) =>
      this.redactMessageInternal(message, scope, cache, aliases, [...baseEntities, ...entities]);

    return {
      redactText,
      redactMessage,
      getAliases: () => [...aliases],
    } satisfies RedactionSession;
  }

  async redactText(text: string, options?: RedactTextOptions) {
    const session = this.createSession({ scope: options?.scope, entities: options?.entities });
    const redacted = await session.redactText(text);
    return { text: redacted, aliases: session.getAliases() };
  }

  async redactMessage(
    message: {
      subject?: string;
      bodyPreview?: string;
      body?: string;
      from?: string;
      to?: string[];
      cc?: string[];
      bcc?: string[];
    },
    options?: { scope?: string; names?: string[] }
  ) {
    const nameEntities = (options?.names || [])
      .filter(Boolean)
      .map((name) => ({ value: name, type: RedactionEntityType.NAME, caseInsensitive: true }));

    const session = this.createSession({ scope: options?.scope, entities: nameEntities });
    const redacted = await session.redactMessage(message);

    return { message: redacted, aliases: session.getAliases() };
  }

  async getOrCreateAlias(value: string, entityType: RedactionEntityType, scope?: string | null) {
    const normalized = value.trim();
    const hash = this.computeHash(normalized);

    const existing = await redactionAliasRepository.findByHash(hash, entityType, scope ?? null);
    if (existing) {
      return {
        placeholder: existing.placeholder,
        value: existing.realValue,
        entityType: existing.entityType,
        scope: existing.scope ?? undefined,
      } satisfies AliasRecord;
    }

    let placeholder = this.generatePlaceholder(entityType);

    while (await redactionAliasRepository.findByPlaceholder(placeholder)) {
      placeholder = this.generatePlaceholder(entityType);
    }

    const created = await redactionAliasRepository.create({
      placeholder,
      entityType,
      realValue: normalized,
      hash,
      scope: scope ?? null,
    });

    return {
      placeholder: created.placeholder,
      value: created.realValue,
      entityType: created.entityType,
      scope: created.scope ?? undefined,
    } satisfies AliasRecord;
  }

  private async redactTextInternal(
    input: string,
    scope: string | undefined,
    cache: Map<string, AliasRecord>,
    aliases: AliasRecord[],
    entities: RedactEntitiesOption[] = []
  ) {
    let text = input;
    if (!text) {
      return text;
    }

    text = await this.replaceEmails(text, scope, cache, aliases);

    for (const entity of entities) {
      text = await this.replaceEntity(text, entity, scope, cache, aliases);
    }

    return text;
  }

  private async redactMessageInternal(
    message: {
      subject?: string;
      bodyPreview?: string;
      body?: string;
      from?: string;
      to?: string[];
      cc?: string[];
      bcc?: string[];
    },
    scope: string | undefined,
    cache: Map<string, AliasRecord>,
    aliases: AliasRecord[],
    entities: RedactEntitiesOption[] = []
  ) {
    const redactField = async (value?: string) =>
      this.redactTextInternal(value ?? '', scope, cache, aliases, entities);

    const redactArray = async (values?: string[]) => {
      if (!values) return values;
      const result: string[] = [];
      for (const item of values) {
        result.push(await this.redactTextInternal(item ?? '', scope, cache, aliases, entities));
      }
      return result;
    };

    return {
      subject: await redactField(message.subject),
      bodyPreview: await redactField(message.bodyPreview),
      body: await redactField(message.body),
      from: await redactField(message.from),
      to: await redactArray(message.to),
      cc: await redactArray(message.cc),
      bcc: await redactArray(message.bcc),
    };
  }

  private async replaceEmails(
    text: string,
    scope: string | undefined,
    cache: Map<string, AliasRecord>,
    aliases: AliasRecord[]
  ) {
    const matches = Array.from(new Set(text.match(this.emailRegex) || []));
    let result = text;

    for (const email of matches) {
      const alias = await this.getAliasFromCache(email, RedactionEntityType.EMAIL, scope, cache, aliases);
      const regex = new RegExp(this.escapeRegExp(email), 'g');
      result = result.replace(regex, alias.placeholder);
    }

    return result;
  }

  private async replaceEntity(
    text: string,
    entity: RedactEntitiesOption,
    scope: string | undefined,
    cache: Map<string, AliasRecord>,
    aliases: AliasRecord[]
  ) {
    const value = entity.value?.trim();
    if (!value) {
      return text;
    }

    const alias = await this.getAliasFromCache(value, entity.type, scope, cache, aliases);
    const flags = entity.caseInsensitive ? 'gi' : 'g';
    const regex = new RegExp(this.escapeRegExp(value), flags);

    return text.replace(regex, alias.placeholder);
  }

  private async getAliasFromCache(
    value: string,
    entityType: RedactionEntityType,
    scope: string | undefined,
    cache: Map<string, AliasRecord>,
    aliases: AliasRecord[]
  ) {
    const key = `${entityType}:${scope ?? ''}:${value.toLowerCase()}`;

    let record = cache.get(key);
    if (!record) {
      const created = await this.getOrCreateAlias(value, entityType, scope);
      cache.set(key, created);
      if (!aliases.some((alias) => alias.placeholder === created.placeholder)) {
        aliases.push(created);
      }
      return created;
    }

    return record;
  }

  private generatePlaceholder(entityType: RedactionEntityType) {
    const prefix = this.prefixMap[entityType] || 'ALIAS';
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}_${random}`;
  }

  private computeHash(value: string) {
    return crypto.createHash('sha256').update(value.toLowerCase()).digest('hex');
  }

  private escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export default new RedactionService();
export type { AliasRecord, RedactionSession, RedactEntitiesOption };

