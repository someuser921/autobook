from typing import Optional
from pydantic import BaseModel, Field
from datetime import date, datetime
from app.models.maintenance import MaintenanceCategory
from app.schemas.photo import MaintenancePhotoOut

_Date = date  # alias to avoid Pydantic v2 name collision when field name == type name


class MaintenanceCreate(BaseModel):
    date: date
    odometer: Optional[int] = Field(None, ge=0, le=10_000_000)
    category: MaintenanceCategory
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    location: Optional[str] = Field(None, max_length=200)
    cost: Optional[float] = Field(None, ge=0, le=100_000_000)
    next_date: Optional[_Date] = None
    next_odometer: Optional[int] = Field(None, ge=0, le=10_000_000)
    notes: Optional[str] = Field(None, max_length=2000)


class MaintenanceUpdate(BaseModel):
    date: Optional[_Date] = None
    odometer: Optional[int] = Field(None, ge=0, le=10_000_000)
    category: Optional[MaintenanceCategory] = None
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    location: Optional[str] = Field(None, max_length=200)
    cost: Optional[float] = Field(None, ge=0, le=100_000_000)
    next_date: Optional[_Date] = None
    next_odometer: Optional[int] = Field(None, ge=0, le=10_000_000)
    notes: Optional[str] = Field(None, max_length=2000)


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
