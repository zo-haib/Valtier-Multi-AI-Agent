"""add token blacklist

Revision ID: 1a2b3c4d5e6f
Revises: ee78ef84b238
Create Date: 2026-09-22 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1a2b3c4d5e6f'
down_revision: Union[str, Sequence[str], None] = 'ee78ef84b238'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('token_blacklists',
    sa.Column('jti', sa.String(length=64), nullable=False),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('jti')
    )


def downgrade() -> None:
    op.drop_table('token_blacklists')
