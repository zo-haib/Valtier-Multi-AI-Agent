from __future__ import annotations

import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.project import Project
from app.models.task import Task
from app.schemas.project import ProjectCreate, ProjectUpdate, TaskCreate, TaskUpdate

def list_projects(db: Session, user_id: uuid.UUID) -> list[Project]:
    return list(db.scalars(select(Project).where(Project.user_id == user_id)))

def create_project(db: Session, user_id: uuid.UUID, payload: ProjectCreate) -> Project:
    project = Project(
        user_id=user_id,
        name=payload.name,
        description=payload.description,
        status=payload.status,
        deadline=payload.deadline
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

def get_project(db: Session, user_id: uuid.UUID, project_id: uuid.UUID) -> Project:
    project = db.get(Project, project_id)
    if not project or project.user_id != user_id:
        raise NotFoundError("Project not found")
    return project

def update_project(db: Session, user_id: uuid.UUID, project_id: uuid.UUID, payload: ProjectUpdate) -> Project:
    project = get_project(db, user_id, project_id)
    if payload.name is not None:
        project.name = payload.name
    if payload.description is not None:
        project.description = payload.description
    if payload.status is not None:
        project.status = payload.status
    if payload.deadline is not None:
        project.deadline = payload.deadline
    db.commit()
    db.refresh(project)
    return project

def delete_project(db: Session, user_id: uuid.UUID, project_id: uuid.UUID) -> None:
    project = get_project(db, user_id, project_id)
    db.delete(project)
    db.commit()

def create_task(db: Session, user_id: uuid.UUID, project_id: uuid.UUID, payload: TaskCreate) -> Task:
    project = get_project(db, user_id, project_id)
    task = Task(
        project_id=project.id,
        title=payload.title,
        description=payload.description,
        status=payload.status,
        due_date=payload.due_date,
        assigned_agent_id=payload.assigned_agent_id,
        milestone=payload.milestone
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def update_task(db: Session, user_id: uuid.UUID, project_id: uuid.UUID, task_id: uuid.UUID, payload: TaskUpdate) -> Task:
    get_project(db, user_id, project_id)  # verify ownership
    task = db.get(Task, task_id)
    if not task or task.project_id != project_id:
        raise NotFoundError("Task not found")
        
    if payload.title is not None:
        task.title = payload.title
    if payload.description is not None:
        task.description = payload.description
    if payload.status is not None:
        task.status = payload.status
    if payload.due_date is not None:
        task.due_date = payload.due_date
    if payload.assigned_agent_id is not None:
        task.assigned_agent_id = payload.assigned_agent_id
    if payload.milestone is not None:
        task.milestone = payload.milestone
    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, user_id: uuid.UUID, project_id: uuid.UUID, task_id: uuid.UUID) -> None:
    get_project(db, user_id, project_id)  # verify ownership
    task = db.get(Task, task_id)
    if not task or task.project_id != project_id:
        raise NotFoundError("Task not found")
    db.delete(task)
    db.commit()
