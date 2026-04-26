"""conversation_members last_read_at for unread state

Revision ID: 0007
Revises: 0006
Create Date: 2026-04-27
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0007"
down_revision: Union[str, None] = "0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "conversation_members",
        sa.Column("last_read_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(
        "ix_conversation_members_last_read_at",
        "conversation_members",
        ["last_read_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_conversation_members_last_read_at", table_name="conversation_members")
    op.drop_column("conversation_members", "last_read_at")
