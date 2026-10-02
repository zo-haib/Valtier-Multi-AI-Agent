"""add feature flags and agent configs

Revision ID: 4d5e6f7g8h9i
Revises: 3c4d5e6f7g8h
Create Date: 2026-09-22 22:07:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4d5e6f7g8h9i'
down_revision: Union[str, Sequence[str], None] = '3c4d5e6f7g8h'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('feature_flags',
    sa.Column('key', sa.String(length=100), nullable=False),
    sa.Column('enabled', sa.Boolean(), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('key')
    )

    op.create_table('agent_configs',
    sa.Column('agent_id', sa.String(length=100), nullable=False),
    sa.Column('model', sa.String(length=255), nullable=False),
    sa.Column('temperature', sa.Float(), nullable=False),
    sa.Column('token_limit', sa.Integer(), nullable=False),
    sa.Column('credit_cost', sa.Integer(), nullable=False),
    sa.Column('enabled', sa.Boolean(), nullable=False),
    sa.Column('status', sa.String(length=50), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('agent_id')
    )


def downgrade() -> None:
    op.drop_table('agent_configs')
    op.drop_table('feature_flags')
