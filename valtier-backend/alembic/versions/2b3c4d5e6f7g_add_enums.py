"""add enums business paused

Revision ID: 2b3c4d5e6f7g
Revises: 1a2b3c4d5e6f
Create Date: 2026-09-22 22:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2b3c4d5e6f7g'
down_revision: Union[str, Sequence[str], None] = '1a2b3c4d5e6f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Disable transaction to allow ALTER TYPE
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'business'")
        op.execute("ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'paused'")


def downgrade() -> None:
    # Downgrading enums in Postgres is complicated, usually left as-is
    pass
