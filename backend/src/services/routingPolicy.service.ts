import routingPolicyRepository, {
  CreateRoutingPolicyRuleInput,
  UpdateRoutingPolicyRuleInput,
} from '@/repositories/routingPolicy.repository';
import {
  RoutingAction,
  RoutingMatchMode,
  RoutingPolicyRule,
  RoutingRuleType,
} from '@prisma/client';

interface EvaluationMessage {
  subject?: string;
  body?: string;
  from?: string;
  to?: string[];
  cc?: string[];
}

interface EvaluationContext {
  accountName?: string;
  accountEmail?: string;
  messages: EvaluationMessage[];
}

interface EvaluationResult {
  action: RoutingAction;
  matchedRule?: RoutingPolicyRule;
}

class RoutingPolicyService {
  async getAll() {
    return routingPolicyRepository.findAll();
  }

  async getEnabled() {
    return routingPolicyRepository.findEnabled();
  }

  async getById(id: string) {
    return routingPolicyRepository.findById(id);
  }

  async create(data: CreateRoutingPolicyRuleInput) {
    return routingPolicyRepository.create(data);
  }

  async update(id: string, data: UpdateRoutingPolicyRuleInput) {
    return routingPolicyRepository.update(id, data);
  }

  async delete(id: string) {
    return routingPolicyRepository.delete(id);
  }

  async resolveAction(context: EvaluationContext): Promise<EvaluationResult> {
    const rules = await routingPolicyRepository.findEnabled();

    for (const rule of rules) {
      if (this.matchesRule(rule, context)) {
        return { action: rule.action, matchedRule: rule };
      }
    }

    return { action: RoutingAction.SUMMARISE };
  }

  private matchesRule(rule: RoutingPolicyRule, context: EvaluationContext) {
    const value = rule.value?.trim();
    if (!value) {
      return false;
    }

    switch (rule.type) {
      case RoutingRuleType.EMAIL:
        return this.matchEmailRule(rule, context, value);
      case RoutingRuleType.FULL_NAME:
        return this.matchFullNameRule(rule, context, value);
      case RoutingRuleType.KEYWORD:
      default:
        return this.matchKeywordRule(rule, context, value);
    }
  }

  private matchKeywordRule(
    rule: RoutingPolicyRule,
    context: EvaluationContext,
    value: string
  ) {
    const haystack = context.messages
      .map((message) => `${message.subject ?? ''} ${message.body ?? ''}`)
      .join(' ')
      .toLowerCase();

    return this.evaluateMatch(rule.matchMode, haystack, value.toLowerCase());
  }

  private matchEmailRule(
    rule: RoutingPolicyRule,
    context: EvaluationContext,
    value: string
  ) {
    const target = value.toLowerCase();
    const emails = new Set<string>();

    if (context.accountEmail) {
      emails.add(context.accountEmail.toLowerCase());
    }

    for (const message of context.messages) {
      if (message.from) {
        emails.add(message.from.toLowerCase());
      }
      (message.to || []).forEach((addr) => emails.add(addr.toLowerCase()));
      (message.cc || []).forEach((addr) => emails.add(addr.toLowerCase()));
    }

    for (const email of emails) {
      if (this.evaluateMatch(rule.matchMode, email, target)) {
        return true;
      }
    }

    return false;
  }

  private matchFullNameRule(
    rule: RoutingPolicyRule,
    context: EvaluationContext,
    value: string
  ) {
    const normalizedValue = value.toLowerCase();
    const candidates: string[] = [];

    if (context.accountName) {
      candidates.push(context.accountName.toLowerCase());
    }

    for (const message of context.messages) {
      if (message.from) {
        candidates.push(message.from.toLowerCase());
      }
      (message.to || []).forEach((item) => candidates.push(item.toLowerCase()));
      (message.cc || []).forEach((item) => candidates.push(item.toLowerCase()));
    }

    for (const name of candidates) {
      if (this.evaluateMatch(rule.matchMode, name, normalizedValue)) {
        return true;
      }
    }

    return false;
  }

  private evaluateMatch(mode: RoutingMatchMode | null, haystack: string, needle: string) {
    const comparisonMode = mode ?? RoutingMatchMode.CONTAINS;

    switch (comparisonMode) {
      case RoutingMatchMode.EXACT:
        return haystack === needle;
      case RoutingMatchMode.REGEX:
        try {
          return new RegExp(needle, 'i').test(haystack);
        } catch (error) {
          console.error('[RoutingPolicyService] Invalid regex pattern:', needle, error);
          return false;
        }
      case RoutingMatchMode.CONTAINS:
      default:
        return haystack.includes(needle);
    }
  }
}

export default new RoutingPolicyService();
export type { EvaluationContext, EvaluationResult, EvaluationMessage };
