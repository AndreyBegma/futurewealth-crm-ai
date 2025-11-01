import prisma from '@/config/database';
import { Prisma, RoutingAction, RoutingMatchMode, RoutingRuleType } from '@prisma/client';

export type CreateRoutingPolicyRuleInput = {
  type: RoutingRuleType;
  action: RoutingAction;
  value: string;
  matchMode?: RoutingMatchMode;
  enabled?: boolean;
  notes?: string;
  createdBy?: string;
};

export type UpdateRoutingPolicyRuleInput = {
  action?: RoutingAction;
  value?: string;
  matchMode?: RoutingMatchMode;
  enabled?: boolean;
  notes?: string | null;
  createdBy?: string | null;
};

class RoutingPolicyRepository {
  async findAll() {
    return prisma.routingPolicyRule.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findEnabled() {
    return prisma.routingPolicyRule.findMany({
      where: { enabled: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.routingPolicyRule.findUnique({
      where: { id },
    });
  }

  async create(data: CreateRoutingPolicyRuleInput) {
    return prisma.routingPolicyRule.create({
      data: {
        type: data.type,
        action: data.action,
        value: data.value,
        matchMode: data.matchMode ?? 'EXACT',
        enabled: data.enabled ?? true,
        notes: data.notes,
        createdBy: data.createdBy,
      },
    });
  }

  async update(id: string, data: UpdateRoutingPolicyRuleInput) {
    const payload: Prisma.RoutingPolicyRuleUpdateInput = {};

    if (typeof data.action !== 'undefined') {
      payload.action = data.action;
    }
    if (typeof data.value !== 'undefined') {
      payload.value = data.value;
    }
    if (typeof data.matchMode !== 'undefined') {
      payload.matchMode = data.matchMode;
    }
    if (typeof data.enabled !== 'undefined') {
      payload.enabled = data.enabled;
    }
    if (typeof data.notes !== 'undefined') {
      payload.notes = data.notes;
    }
    if (typeof data.createdBy !== 'undefined') {
      payload.createdBy = data.createdBy;
    }

    return prisma.routingPolicyRule.update({
      where: { id },
      data: payload,
    });
  }

  async delete(id: string) {
    return prisma.routingPolicyRule.delete({
      where: { id },
    });
  }
}

export default new RoutingPolicyRepository();

