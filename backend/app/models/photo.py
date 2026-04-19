from __future__ import annotations
from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class MaintenancePhoto(Base):
    __tablename__ = "maintenance_photos"

    id: Mapped[int] = mapped_column(primary_key=True)
    maintenance_record_id: Mapped[int] = mapped_column(
        ForeignKey("maintenance_records.id", ondelete="CASCADE"), nullable=False, index=True
    )
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    record: Mapped["MaintenanceRecord"] = relationship("MaintenanceRecord", back_populates="photos")
