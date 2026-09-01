"""Admin dashboard service: platform statistics and listing helpers for admin-only endpoints."""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.document import Document
from app.models.payment import Payment, PaymentStatus
from app.models.subscription import PlanType, Subscription, SubscriptionStatus
from app.models.usage import UsageRecord
from app.models.user import User
from app.schemas.admin import DashboardStats


def get_dashboard_stats(db: Session) -> DashboardStats:
    total_users = db.scalar(select(func.count()).select_from(User)) or 0
    active_users = db.scalar(select(func.count()).select_from(User).where(User.is_active.is_(True))) or 0

    total_subscriptions = db.scalar(select(func.count()).select_from(Subscription)) or 0
    active_subscriptions = (
        db.scalar(
            select(func.count()).select_from(Subscription).where(Subscription.status == SubscriptionStatus.ACTIVE)
        )
        or 0
    )

    free_users = (
        db.scalar(select(func.count()).select_from(Subscription).where(Subscription.plan == PlanType.FREE)) or 0
    )
    pro_users = (
        db.scalar(select(func.count()).select_from(Subscription).where(Subscription.plan == PlanType.PRO)) or 0
    )
    enterprise_users = (
        db.scalar(select(func.count()).select_from(Subscription).where(Subscription.plan == PlanType.ENTERPRISE))
        or 0
    )

    current_month = datetime.now(timezone.utc).strftime("%Y-%m")
    monthly_revenue_cents = (
        db.scalar(
            select(func.coalesce(func.sum(Payment.amount_cents), 0)).where(
                Payment.status == PaymentStatus.SUCCEEDED,
                func.to_char(Payment.created_at, "YYYY-MM") == current_month,
            )
        )
        or 0
    )

    ai_requests_this_month = (
        db.scalar(
            select(func.coalesce(func.sum(UsageRecord.ai_requests_used), 0)).where(
                UsageRecord.period == current_month
            )
        )
        or 0
    )

    document_count = db.scalar(select(func.count()).select_from(Document)) or 0

    return DashboardStats(
        total_users=total_users,
        active_users=active_users,
        total_subscriptions=total_subscriptions,
        active_subscriptions=active_subscriptions,
        free_users=free_users,
        pro_users=pro_users,
        enterprise_users=enterprise_users,
        monthly_revenue_cents=int(monthly_revenue_cents),
        ai_requests_this_month=int(ai_requests_this_month),
        document_count=document_count,
    )


def list_subscriptions(db: Session, page: int, page_size: int):
    from app.utils.pagination import paginate_rows

    stmt = (
        select(Subscription, User)
        .join(User, Subscription.user_id == User.id)
        .order_by(Subscription.created_at.desc())
    )
    total, rows = paginate_rows(db, stmt, page, page_size)
    # `rows` here are (Subscription, User) tuples since the select joins two entities.
    items = [
        {
            "id": sub.id,
            "user_id": sub.user_id,
            "user_email": user.email,
            "user_full_name": user.full_name,
            "plan": sub.plan,
            "billing_cycle": sub.billing_cycle.value,
            "status": sub.status.value,
            "current_period_end": sub.current_period_end,
            "cancel_at_period_end": sub.cancel_at_period_end,
        }
        for sub, user in rows
    ]
    return total, items


def list_users_with_plan(db: Session, page: int, page_size: int):
    """Like user_service.list_users, but also resolves each user's current plan for the admin table."""
    from app.utils.pagination import paginate_rows

    stmt = (
        select(User, Subscription.plan)
        .outerjoin(Subscription, Subscription.user_id == User.id)
        .order_by(User.created_at.desc())
    )
    total, rows = paginate_rows(db, stmt, page, page_size)
    items = [
        {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "created_at": user.created_at,
            "plan": plan or PlanType.FREE,
        }
        for user, plan in rows
    ]
    return total, items


def list_audit_logs(db: Session, page: int, page_size: int):
    from app.utils.pagination import paginate_rows

    stmt = (
        select(AuditLog, User.full_name)
        .outerjoin(User, AuditLog.user_id == User.id)
        .order_by(AuditLog.created_at.desc())
    )
    total, rows = paginate_rows(db, stmt, page, page_size)
    items = [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "ip_address": log.ip_address,
            "user_agent": log.user_agent,
            "log_metadata": log.log_metadata,
            "created_at": log.created_at,
            "user_full_name": full_name,
        }
        for log, full_name in rows
    ]
    return total, items
