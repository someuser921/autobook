"""add maintenance_photos

Revision ID: b2f4a1c8d3e5
Revises: 4c3771da2eec
Create Date: 2026-04-19 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'b2f4a1c8d3e5'
down_revision: Union[str, None] = '57f6c99e3790'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'maintenance_photos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('maintenance_record_id', sa.Integer(), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['maintenance_record_id'], ['maintenance_records.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_maintenance_photos_maintenance_record_id'),
        'maintenance_photos', ['maintenance_record_id'], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f('ix_maintenance_photos_maintenance_record_id'), table_name='maintenance_photos')
    op.drop_table('maintenance_photos')
