from typing import Optional
from pydantic import BaseModel
from datetime import date, datetime
from app.models.maintenance import MaintenanceCategory
from app.schemas.photo import MaintenancePhotoOut

_Date = date  # alias to avoid Pydantic v2 name collision when field name == type name


class MaintenanceCreate(BaseModel):
    date: date
    odometer: Optional[int] = None
    category: MaintenanceCategory
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    cost: Optional[float] = None
    next_date: Optional[_Date] = None
    next_odometer: Optional[int] = None
    notes: Optional[str] = None


class MaintenanceUpdate(BaseModel):
    date: Optional[_Date] = None
    odometer: Optional[int] = None
    category: Optional[MaintenanceCategory] = None
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    cost: Optional[float] = None
    next_date: Optional[_Date] = None
    next_odometer: Optional[int] = None
    notes: Optional[str] = None


class MaintenanceOut(BaseModel):
    id: int
    vehicle_id: int
    date: date
    odometer: Optional[int]
    category: MaintenanceCategory
    title: str
    description: Optional[str]
    location: Optional[str]
    cost: Optional[float]
    next_date: Optional[_Date]
    next_odometer: Optional[int]
    notes: Optional[str]
    created_at: datetime
    photos: list[MaintenancePhotoOut] = []

    model_config = {"from_attributes": True}
