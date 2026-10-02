"""add projects and tasks

Revision ID: 3c4d5e6f7g8h
Revises: 2b3c4d5e6f7g
Create Date: 2026-09-22 22:06:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '3c4d5e6f7g8h'
down_revision: Union[str, Sequence[str], None] = '2b3c4d5e6f7g'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('projects',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('status', sa.Enum('ON_TRACK', 'AT_RISK', 'COMPLETED', 'PAUSED', name='project_status'), nullable=False),
    sa.Column('deadline', sa.DateTime(timezone=True), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_projects_user_id'), 'projects', ['user_id'], unique=False)

    op.create_table('tasks',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('project_id', sa.UUID(), nullable=False),
    sa.Column('title', sa.String(length=500), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('status', sa.Enum('TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED', name='task_status'), nullable=False),
    sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
    sa.Column('assigned_agent_id', sa.String(length=100), nullable=True),
    sa.Column('milestone', sa.String(length=255), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tasks_project_id'), 'tasks', ['project_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_tasks_project_id'), table_name='tasks')
    op.drop_table('tasks')
    op.drop_index(op.f('ix_projects_user_id'), table_name='projects')
    op.drop_table('projects')
    # Enum types would need to be dropped manually if desired
