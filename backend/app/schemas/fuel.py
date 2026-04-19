from typing import Optional
from pydantic import BaseModel, Field
from datetime import date, datetime
from app.models.vehicle import FuelType

_Date = date  # alias to avoid Pydantic v2 name collision when field name == type name


class FuelCreate(BaseModel):
    date: date
    liters: float = Field(gt=0, le=10_000)
    total_cost: float = Field(ge=0, le=10_000_000)
    fuel_type_override: Optional[FuelType] = None
    odometer: Optional[int] = Field(None, ge=0, le=10_000_000)
    station_name: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = Field(None, max_length=2000)


class FuelUpdate(BaseModel):
    date: Optional[_Date] = None
    liters: Optional[float] = Field(None, gt=0, le=10_000)
    total_cost: Optional[float] = Field(None, ge=0, le=10_000_000)
    fuel_type_override: Optional[FuelType] = None
    odometer: Optional[int] = Field(None, ge=0, le=10_000_000)
    station_name: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = Field(None, max_length=2000)


class FuelOut(BaseModel):
    id: int
    vehicle_id: int
    date: date
    liters: float
    total_cost: float
    price_per_liter: float
    fuel_type_override: Optional[FuelType]
    odometer: Optional[int]
    station_name: Optional[str]
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_with_price(cls, obj):
        data = {
            "id": obj.id,
            "vehicle_id": obj.vehicle_id,
            "date": obj.date,
            "liters": float(obj.liters),
            "total_cost": float(obj.total_cost),
            "price_per_liter": round(float(obj.total_cost) / float(obj.liters), 2) if float(obj.liters) > 0 else 0,
            "fuel_type_override": obj.fuel_type_override,
            "odometer": obj.odometer,
            "station_name": obj.station_name,
            "notes": obj.notes,
            "created_at": obj.created_at,
        }
        return cls(**data)
