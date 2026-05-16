"""Add AI classification fields to tickets

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-05-15

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, Sequence[str], None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("tickets", sa.Column("ai_category", sa.String(length=128), nullable=True))
    op.add_column("tickets", sa.Column("ai_confidence", sa.Float(), nullable=True))
    op.add_column(
        "tickets",
        sa.Column("ai_classified_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("tickets", "ai_classified_at")
    op.drop_column("tickets", "ai_confidence")
    op.drop_column("tickets", "ai_category")
