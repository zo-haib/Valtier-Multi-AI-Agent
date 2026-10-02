/**
 * Derives Security Center, Requirements Workspace, and Sales Intelligence
 * data from real conversation history, instead of the old mock.ts fixtures.
 *
 * There are no dedicated backend tables for security risks, requirements,
 * or leads — each agent's structured output (SecurityReport,
 * RequirementsSpec, SalesStrategy; see backend app/agents/schemas.py) is
 * already persisted per-message as `agent_result_data` and now exposed via
 * GET /conversations/{id}. This scans every conversation's messages and
 * flattens that structured output into the shapes the UI needs.
 *
 * This mirrors the same pattern agentApi.ts already uses to derive
 * dashboard "workflows" from conversations rather than a fake table.
 */
import type { RequirementItem, SalesStrategyEntry, SecurityRisk } from "../types";
import { listConversations } from "./conversationApi";

interface SecurityFindingRaw {
  id: string;
  title: string;
  severity: string;
  category: string;
  description: string;
  recommendation: string;
}

interface RequirementRaw {
  id: string;
  text: string;
  type: string;
  priority: string;
}

function isSecurityReport(data: Record<string, unknown>): data is { security_report: { findings: SecurityFindingRaw[] } } {
  return "security_report" in data;
}

function isRequirementsSpec(
  data: Record<string, unknown>
): data is {
  requirements_spec: { functional_requirements: RequirementRaw[]; non_functional_requirements: RequirementRaw[] };
} {
  return "requirements_spec" in data;
}

function isSalesStrategy(
  data: Record<string, unknown>
): data is { sales_strategy: { summary: string; prioritized_actions: string[]; draft_email: string | null } } {
  return "sales_strategy" in data;
}

export async function listSecurityRisks(): Promise<SecurityRisk[]> {
  const conversations = await listConversations();
  const risks: SecurityRisk[] = [];

  for (const conversation of conversations) {
    for (const message of conversation.messages) {
      for (const result of message.agentResults ?? []) {
        if (!isSecurityReport(result.data)) continue;
        for (const finding of result.data.security_report.findings) {
          risks.push({
            id: finding.id,
            title: finding.title,
            severity: finding.severity,
            category: finding.category,
            agent: "Security",
            status: "open",
            sourceConversationId: conversation.id,
            sourceConversationTitle: conversation.title,
          });
        }
      }
    }
  }

  return risks;
}

export async function listRequirementItems(): Promise<RequirementItem[]> {
  const conversations = await listConversations();
  const items: RequirementItem[] = [];

  for (const conversation of conversations) {
    for (const message of conversation.messages) {
      for (const result of message.agentResults ?? []) {
        if (!isRequirementsSpec(result.data)) continue;
        const spec = result.data.requirements_spec;
        const all = [
          ...spec.functional_requirements.map((r) => ({ ...r, type: "functional" as const })),
          ...spec.non_functional_requirements.map((r) => ({ ...r, type: "non-functional" as const })),
        ];
        for (const req of all) {
          items.push({
            id: req.id,
            text: req.text,
            priority: req.priority,
            type: req.type,
            sourceConversationId: conversation.id,
            sourceConversationTitle: conversation.title,
          });
        }
      }
    }
  }

  return items;
}

export async function listSalesStrategies(): Promise<SalesStrategyEntry[]> {
  const conversations = await listConversations();
  const entries: SalesStrategyEntry[] = [];

  for (const conversation of conversations) {
    for (const message of conversation.messages) {
      for (const result of message.agentResults ?? []) {
        if (!isSalesStrategy(result.data)) continue;
        const strategy = result.data.sales_strategy;
        entries.push({
          id: message.id,
          summary: strategy.summary,
          prioritizedActions: strategy.prioritized_actions,
          draftEmail: strategy.draft_email,
          sourceConversationId: conversation.id,
          sourceConversationTitle: conversation.title,
          updatedAgo: message.timestamp,
        });
      }
    }
  }

  return entries;
}
