import type { PlanFeature } from "../types";
import { apiFetch } from "./client";

interface PlanFeaturesRaw {
  plan: "free" | "pro" | "enterprise";
  monthly_price_usd: number;
  yearly_price_usd: number;
  ai_requests_per_month: number;
  document_limit: number;
  includes_rag: boolean;
  includes_memory: boolean;
  includes_all_agents: boolean;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
}

interface SubscriptionReadRaw {
  id: string;
  plan: "free" | "pro" | "enterprise";
  billing_cycle: "monthly" | "yearly" | "none";
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

function mapPlan(raw: PlanFeaturesRaw): PlanFeature {
  const features = [
    `${raw.ai_requests_per_month.toLocaleString()} AI tasks / month`,
    `${raw.document_limit.toLocaleString()} documents`,
    raw.includes_all_agents ? "All agents" : "Basic agents",
  ];
  if (raw.includes_rag) features.push("RAG");
  if (raw.includes_memory) features.push("Memory");
  if (raw.plan === "enterprise") features.push("Advanced security", "Priority processing", "Enterprise support");

  return {
    id: raw.plan,
    name: raw.plan.charAt(0).toUpperCase() + raw.plan.slice(1),
    // Enterprise pricing is negotiated, not self-serve — show "Custom" regardless of the backend's placeholder figures.
    monthlyPrice: raw.plan === "enterprise" ? null : raw.monthly_price_usd,
    yearlyPrice: raw.plan === "enterprise" ? null : raw.yearly_price_usd,
    features,
    highlighted: raw.plan === "pro",
    stripePriceIdMonthly: raw.stripe_price_id_monthly,
    stripePriceIdYearly: raw.stripe_price_id_yearly,
  };
}

// GET /api/v1/subscriptions/plans
export async function listPlans(): Promise<PlanFeature[]> {
  const raw = await apiFetch<PlanFeaturesRaw[]>("/subscriptions/plans");
  return raw.map(mapPlan);
}

// GET /api/v1/subscriptions/me
export async function getMySubscription(): Promise<{ plan: PlanFeature["id"]; status: string }> {
  const raw = await apiFetch<SubscriptionReadRaw>("/subscriptions/me");
  return { plan: raw.plan, status: raw.status };
}

// POST /api/v1/subscriptions/create-checkout
export async function createCheckoutSession(priceId: string): Promise<{ checkoutUrl: string }> {
  const raw = await apiFetch<{ checkout_url: string }>("/subscriptions/create-checkout", {
    method: "POST",
    body: JSON.stringify({ price_id: priceId }),
  });
  return { checkoutUrl: raw.checkout_url };
}
