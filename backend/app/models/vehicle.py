from __future__ import annotations
import enum
from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, DateTime, func, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class FuelType(str, enum.Enum):
    ai92 = "ai92"
    ai95 = "ai95"
    ai98 = "ai98"
    diesel = "diesel"
    electric = "electric"


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    make: Mapped[str] = mapped_column(String(100), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    color: Mapped[str | None] = mapped_column(String(50), nullable=True)
    plate: Mapped[str | None] = mapped_column(String(20), nullable=True)
    vin: Mapped[str | None] = mapped_column(String(17), nullable=True)
    fuel_type: Mapped[FuelType] = mapped_column(Enum(FuelType), nullable=False, default=FuelType.ai95)
    current_odometer: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="vehicles")
    maintenance_records: Mapped[list["MaintenanceRecord"]] = relationship(
        "MaintenanceRecord", back_populates="vehicle", cascade="all, delete-orphan"
    )
    fuel_records: Mapped[list["FuelRecord"]] = relationship(
        "FuelRecord", back_populates="vehicle", cascade="all, delete-orphan"
    )
    planned_maintenance: Mapped[list["PlannedMaintenance"]] = relationship(
        "PlannedMaintenance", back_populates="vehicle", cascade="all, delete-orphan"
    )
