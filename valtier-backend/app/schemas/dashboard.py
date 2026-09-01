"""Pydantic schemas for the authenticated dashboard summary endpoint."""
from __future__ import annotations

from pydantic import BaseModel


class DashboardUser(BaseModel):
    id: str
    name: str
    email: str
    plan: str


class DashboardStats(BaseModel):
    tasks: int
    agents: int
    knowledge_sources: int
    hours_saved: float


class DashboardResponse(BaseModel):
    user: DashboardUser
    stats: DashboardStats
    greeting_name: str
