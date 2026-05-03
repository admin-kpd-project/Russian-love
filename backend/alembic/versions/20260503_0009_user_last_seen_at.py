"""users.last_seen_at for presence / last seen

Revision ID: 0009
Revises: 0008
Create Date: 2026-05-03
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0009"
down_revision: Union[str, None] = "0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.execute("UPDATE users SET last_seen_at = created_at WHERE last_seen_at IS NULL")


def downgrade() -> None:
    op.drop_column("users", "last_seen_at")
