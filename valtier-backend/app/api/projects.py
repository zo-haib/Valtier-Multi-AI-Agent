from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status, Request
from starlette.responses import Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_client_ip, get_current_user
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectRead, TaskCreate, TaskUpdate, TaskRead
from app.services import project_service
from app.services.audit_service import record_audit_event

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectRead])
def list_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> list[ProjectRead]:
    return project_service.list_projects(db, current_user.id)


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    request: Request,
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectRead:
    project = project_service.create_project(db, current_user.id, payload)
    record_audit_event(
        db,
        action="project_created",
        user_id=current_user.id,
        resource_type="project",
        resource_id=str(project.id),
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    return project


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectRead:
    return project_service.get_project(db, current_user.id, project_id)


@router.patch("/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: uuid.UUID,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectRead:
    return project_service.update_project(db, current_user.id, project_id, payload)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_project(
    request: Request,
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    project_service.delete_project(db, current_user.id, project_id)
    record_audit_event(
        db,
        action="project_deleted",
        user_id=current_user.id,
        resource_type="project",
        resource_id=str(project_id),
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{project_id}/tasks", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    project_id: uuid.UUID,
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskRead:
    return project_service.create_task(db, current_user.id, project_id, payload)


@router.patch("/{project_id}/tasks/{task_id}", response_model=TaskRead)
def update_task(
    project_id: uuid.UUID,
    task_id: uuid.UUID,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskRead:
    return project_service.update_task(db, current_user.id, project_id, task_id, payload)


@router.delete("/{project_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_task(
    project_id: uuid.UUID,
    task_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    project_service.delete_task(db, current_user.id, project_id, task_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
