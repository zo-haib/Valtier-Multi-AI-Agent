"""
Static plan catalog: pricing metadata and usage limits per plan. Usage
limits are sourced from Settings so they stay configurable via env
vars without a code change.
"""
from __future__ import annotations

from app.core.config import settings
from app.models.subscription import PlanType
from app.schemas.subscription import PlanFeatures

PLAN_CATALOG: dict[PlanType, PlanFeatures] = {
    PlanType.FREE: PlanFeatures(
        plan=PlanType.FREE,
        monthly_price_usd=0,
        yearly_price_usd=0,
        ai_requests_per_month=settings.free_plan_requests_per_month,
        document_limit=settings.free_plan_document_limit,
        includes_rag=False,
        includes_memory=False,
        includes_all_agents=True,
    ),
    PlanType.PRO: PlanFeatures(
        plan=PlanType.PRO,
        monthly_price_usd=29,
        yearly_price_usd=290,
        ai_requests_per_month=settings.pro_plan_requests_per_month,
        document_limit=settings.pro_plan_document_limit,
        includes_rag=True,
        includes_memory=True,
        includes_all_agents=True,
        stripe_price_id_monthly=settings.stripe_pro_monthly_price_id or None,
        stripe_price_id_yearly=settings.stripe_pro_yearly_price_id or None,
    ),
    PlanType.ENTERPRISE: PlanFeatures(
        plan=PlanType.ENTERPRISE,
        monthly_price_usd=199,
        yearly_price_usd=1990,
        ai_requests_per_month=settings.enterprise_plan_requests_per_month,
        document_limit=settings.enterprise_plan_document_limit,
        includes_rag=True,
        includes_memory=True,
        includes_all_agents=True,
        stripe_price_id_monthly=settings.stripe_enterprise_monthly_price_id or None,
        stripe_price_id_yearly=settings.stripe_enterprise_yearly_price_id or None,
    ),
}


def price_id_to_plan(price_id: str) -> tuple[PlanType, str] | None:
    """Map a Stripe price ID to (plan, billing_cycle) using configured env price IDs."""
    mapping = {
        settings.stripe_pro_monthly_price_id: (PlanType.PRO, "monthly"),
        settings.stripe_pro_yearly_price_id: (PlanType.PRO, "yearly"),
        settings.stripe_enterprise_monthly_price_id: (PlanType.ENTERPRISE, "monthly"),
        settings.stripe_enterprise_yearly_price_id: (PlanType.ENTERPRISE, "yearly"),
    }
    return mapping.get(price_id) if price_id else None
