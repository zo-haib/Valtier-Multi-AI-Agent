"""Conversation management endpoints. Users may only access their own conversations."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.agent import ConversationCreate, ConversationDetailRead, ConversationRead, MessageCreate, MessageRead
from app.services import conversation_service

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.post("", response_model=ConversationRead, status_code=status.HTTP_201_CREATED)
def create_conversation(
    payload: ConversationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> ConversationRead:
    return conversation_service.create_conversation(db, current_user.id, payload)


@router.get("", response_model=list[ConversationRead])
def list_conversations(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[ConversationRead]:
    return conversation_service.list_conversations(db, current_user.id)


@router.get("/{conversation_id}", response_model=ConversationDetailRead)
def get_conversation(
    conversation_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> ConversationDetailRead:
    return conversation_service.get_conversation(db, current_user.id, conversation_id)


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conversation_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> None:
    conversation_service.delete_conversation(db, current_user.id, conversation_id)


@router.post("/{conversation_id}/messages", response_model=MessageRead, status_code=status.HTTP_201_CREATED)
def add_message(
    conversation_id: uuid.UUID,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageRead:
    return conversation_service.add_user_message(db, current_user.id, conversation_id, payload.content)
