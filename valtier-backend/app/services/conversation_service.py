"""Conversation CRUD service — users may only access their own conversations."""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import ForbiddenError, NotFoundError
from app.models.conversation import Conversation
from app.schemas.agent import ConversationCreate


def create_conversation(db: Session, user_id: uuid.UUID, payload: ConversationCreate) -> Conversation:
    conversation = Conversation(user_id=user_id, title=payload.title)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def list_conversations(db: Session, user_id: uuid.UUID) -> list[Conversation]:
    return list(
        db.scalars(
            select(Conversation).where(Conversation.user_id == user_id).order_by(Conversation.created_at.desc())
        )
    )


def get_conversation(db: Session, user_id: uuid.UUID, conversation_id: uuid.UUID) -> Conversation:
    conversation = db.scalar(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(Conversation.id == conversation_id)
    )
    if conversation is None:
        raise NotFoundError("Conversation not found")
    if conversation.user_id != user_id:
        raise ForbiddenError("You do not have access to this conversation")
    return conversation


def delete_conversation(db: Session, user_id: uuid.UUID, conversation_id: uuid.UUID) -> None:
    conversation = get_conversation(db, user_id, conversation_id)
    db.delete(conversation)
    db.commit()


def add_user_message(db: Session, user_id: uuid.UUID, conversation_id: uuid.UUID, content: str):
    from app.models.message import Message, MessageRole

    conversation = get_conversation(db, user_id, conversation_id)
    message = Message(conversation_id=conversation.id, role=MessageRole.USER, content=content)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
