import type { AdminSubscription, AdminUser, AuditLogEntry } from "../types";
import { apiFetch } from "./client";

export interface AdminDashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  aiTasksToday: number;
  revenueCents: number;
}

interface DashboardStatsRaw {
  total_users: number;
  active_users: number;
  total_subscriptions: number;
  active_subscriptions: number;
  free_users: number;
  pro_users: number;
  enterprise_users: number;
  monthly_revenue_cents: number;
  ai_requests_this_month: number;
  document_count: number;
}

interface PaginatedRaw<T> {
  total: number;
  page: number;
  page_size: number;
  items: T[];
}

interface AdminUserRaw {
  id: string;
  email: string;
  full_name: string;
  role: "user" | "admin";
  plan: "free" | "pro" | "enterprise";
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

interface AdminSubscriptionRaw {
  id: string;
  user_id: string;
  user_email: string;
  user_full_name: string;
  plan: "free" | "pro" | "enterprise";
  billing_cycle: "monthly" | "yearly" | "none";
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

interface AuditLogRaw {
  id: string;
  user_id: string | null;
  user_full_name: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  ip_address: string | null;
  created_at: string;
}

function timeAgo(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function timeOfDay(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

// GET /api/v1/admin/dashboard
export async function getAdminDashboard(): Promise<AdminDashboardStats> {
  const raw = await apiFetch<DashboardStatsRaw>("/admin/dashboard");
  return {
    totalUsers: raw.total_users,
    activeSubscriptions: raw.active_subscriptions,
    aiTasksToday: raw.ai_requests_this_month,
    revenueCents: raw.monthly_revenue_cents,
  };
}

// GET /api/v1/admin/users
export async function listAdminUsers(): Promise<AdminUser[]> {
  const raw = await apiFetch<PaginatedRaw<AdminUserRaw>>("/admin/users?page=1&page_size=100");
  return raw.items.map((u) => ({
    id: u.id,
    name: u.full_name,
    email: u.email,
    role: u.role,
    plan: u.plan,
    status: u.is_active ? "active" : "suspended",
    joinedAgo: timeAgo(u.created_at),
  }));
}

// GET /api/v1/admin/subscriptions
export async function listAdminSubscriptions(): Promise<AdminSubscription[]> {
  const raw = await apiFetch<PaginatedRaw<AdminSubscriptionRaw>>("/admin/subscriptions?page=1&page_size=100");
  return raw.items.map((s) => ({
    id: s.id,
    customer: s.user_full_name || s.user_email,
    plan: s.plan,
    billing: s.billing_cycle,
    amount: 0,
    status: (["active", "cancelled", "past_due"].includes(s.status) ? s.status : "active") as AdminSubscription["status"],
    renewalDate: s.current_period_end ? timeAgo(s.current_period_end) : "—",
  }));
}

// GET /api/v1/admin/audit-logs
export async function listAuditLogs(): Promise<AuditLogEntry[]> {
  const raw = await apiFetch<PaginatedRaw<AuditLogRaw>>("/admin/audit-logs?page=1&page_size=100");
  return raw.items.map((log) => ({
    id: log.id,
    timestamp: timeOfDay(log.created_at),
    user: log.user_full_name ?? "System",
    action: log.action.replace(/_/g, " "),
    resource: log.resource_type ?? "—",
    ip: log.ip_address ?? "—",
    status: "success",
  }));
}
