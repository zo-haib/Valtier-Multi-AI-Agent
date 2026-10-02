from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel

from app.models.project import ProjectStatus
from app.models.task import TaskStatus


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[TaskStatus] = TaskStatus.TODO
    due_date: Optional[datetime] = None
    assigned_agent_id: Optional[str] = None
    milestone: Optional[str] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None
    assigned_agent_id: Optional[str] = None
    milestone: Optional[str] = None


class TaskRead(TaskBase):
    id: uuid.UUID
    project_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: Optional[ProjectStatus] = ProjectStatus.ON_TRACK
    deadline: Optional[datetime] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    deadline: Optional[datetime] = None


class ProjectRead(ProjectBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    tasks: List[TaskRead] = []
    
    class Config:
        from_attributes = True
