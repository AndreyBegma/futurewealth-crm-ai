import { Request, Response } from 'express';
import { RoutingAction, RoutingMatchMode, RoutingRuleType } from '@prisma/client';

import routingPolicyService from '@/services/routingPolicy.service';
import type { UpdateRoutingPolicyRuleInput } from '@/repositories/routingPolicy.repository';

const isRoutingRuleType = (value: string): value is RoutingRuleType =>
  Object.values(RoutingRuleType).includes(value as RoutingRuleType);

const isRoutingAction = (value: string): value is RoutingAction =>
  Object.values(RoutingAction).includes(value as RoutingAction);

const isRoutingMatchMode = (value: string): value is RoutingMatchMode =>
  Object.values(RoutingMatchMode).includes(value as RoutingMatchMode);

class RoutingPolicyController {
  async list(req: Request, res: Response) {
    try {
      const rules = await routingPolicyService.getAll();
      return res.json(rules);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch routing rules' });
    }
  }

  async listEnabled(req: Request, res: Response) {
    try {
      const rules = await routingPolicyService.getEnabled();
      return res.json(rules);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch active routing rules' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const rule = await routingPolicyService.getById(id);

      if (!rule) {
        return res.status(404).json({ error: 'Rule not found' });
      }

      return res.json(rule);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch routing rule' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { type, action, value, matchMode, enabled, notes, createdBy } = req.body;

      if (!type || !isRoutingRuleType(type)) {
        return res.status(400).json({ error: 'Invalid type' });
      }

      if (!action || !isRoutingAction(action)) {
        return res.status(400).json({ error: 'Invalid action' });
      }

      if (!value || typeof value !== 'string') {
        return res.status(400).json({ error: 'Value is required' });
      }

      let resolvedMatchMode: RoutingMatchMode | undefined;
      if (typeof matchMode !== 'undefined') {
        if (!isRoutingMatchMode(matchMode)) {
          return res.status(400).json({ error: 'Invalid matchMode' });
        }
        resolvedMatchMode = matchMode;
      }

      const rule = await routingPolicyService.create({
        type,
        action,
        value,
        matchMode: resolvedMatchMode,
        enabled,
        notes,
        createdBy,
      });

      return res.status(201).json(rule);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create routing rule' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await routingPolicyService.getById(id);

      if (!existing) {
        return res.status(404).json({ error: 'Rule not found' });
      }

      const { action, value, matchMode, enabled, notes, createdBy } = req.body;

      const payload: UpdateRoutingPolicyRuleInput = {};

      if (typeof action !== 'undefined') {
        if (!isRoutingAction(action)) {
          return res.status(400).json({ error: 'Invalid action' });
        }
        payload.action = action;
      }

      if (typeof value !== 'undefined') {
        if (!value || typeof value !== 'string') {
          return res.status(400).json({ error: 'Invalid value' });
        }
        payload.value = value;
      }

      if (typeof matchMode !== 'undefined') {
        if (!isRoutingMatchMode(matchMode)) {
          return res.status(400).json({ error: 'Invalid matchMode' });
        }
        payload.matchMode = matchMode;
      }

      if (typeof enabled !== 'undefined') {
        payload.enabled = Boolean(enabled);
      }

      if (typeof notes !== 'undefined') {
        payload.notes = notes;
      }

      if (typeof createdBy !== 'undefined') {
        payload.createdBy = createdBy;
      }

      const rule = await routingPolicyService.update(id, payload);
      return res.json(rule);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update routing rule' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await routingPolicyService.getById(id);

      if (!existing) {
        return res.status(404).json({ error: 'Rule not found' });
      }

      await routingPolicyService.delete(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete routing rule' });
    }
  }
}

export default new RoutingPolicyController();

