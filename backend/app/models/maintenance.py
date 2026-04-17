from __future__ import annotations
import enum
from datetime import date, datetime
from sqlalchemy import String, Integer, ForeignKey, DateTime, Date, Numeric, Text, func, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class MaintenanceCategory(str, enum.Enum):
    oil_fluids = "oil_fluids"
    tires = "tires"
    brakes = "brakes"
    filters = "filters"
    suspension = "suspension"
    electrical = "electrical"
    body_interior = "body_interior"
    documents = "documents"
    scheduled = "scheduled"
    other = "other"


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    odometer: Mapped[int | None] = mapped_column(Integer, nullable=True)
    category: Mapped[MaintenanceCategory] = mapped_column(Enum(MaintenanceCategory), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    cost: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    next_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    next_odometer: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    vehicle: Mapped["Vehicle"] = relationship("Vehicle", back_populates="maintenance_records")
