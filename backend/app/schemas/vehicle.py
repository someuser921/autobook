from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from app.models.vehicle import FuelType


class VehicleCreate(BaseModel):
    make: str
    model: str
    year: Optional[int] = None
    color: Optional[str] = None
    plate: Optional[str] = None
    vin: Optional[str] = None
    fuel_type: FuelType = FuelType.ai95
    current_odometer: int = 0


class VehicleUpdate(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    color: Optional[str] = None
    plate: Optional[str] = None
    vin: Optional[str] = None
    fuel_type: Optional[FuelType] = None
    current_odometer: Optional[int] = None


class VehicleOut(BaseModel):
    id: int
    user_id: int
    make: str
    model: str
    year: Optional[int]
    color: Optional[str]
    plate: Optional[str]
    vin: Optional[str]
    fuel_type: FuelType
    current_odometer: int
    odometer_updated_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}
