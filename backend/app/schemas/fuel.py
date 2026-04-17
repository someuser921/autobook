from typing import Optional
from pydantic import BaseModel
from datetime import date, datetime
from app.models.vehicle import FuelType


class FuelCreate(BaseModel):
    date: date
    liters: float
    total_cost: float
    fuel_type_override: Optional[FuelType] = None
    odometer: Optional[int] = None
    station_name: Optional[str] = None
    notes: Optional[str] = None


class FuelUpdate(BaseModel):
    date: Optional[date] = None
    liters: Optional[float] = None
    total_cost: Optional[float] = None
    fuel_type_override: Optional[FuelType] = None
    odometer: Optional[int] = None
    station_name: Optional[str] = None
    notes: Optional[str] = None


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
