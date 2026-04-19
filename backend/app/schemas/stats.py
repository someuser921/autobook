from typing import Optional
from pydantic import BaseModel
from app.schemas.photo import MaintenancePhotoOut


class CategoryStat(BaseModel):
    category: str
    total: float
    count: int


class MaintenanceStats(BaseModel):
    total_cost: float
    total_records: int
    by_category: list[CategoryStat]


class FuelMonthStat(BaseModel):
    year: int
    month: int
    total_cost: float
    total_liters: float
    records: int
    avg_price_per_liter: float


class FuelStats(BaseModel):
    total_cost: float
    total_liters: float
    total_records: int
    avg_cost_per_month: float
    avg_cost_per_week: float
    avg_price_per_liter: float
    months: list[FuelMonthStat]


class SearchResult(BaseModel):
    type: str
    id: int
    vehicle_id: int
    vehicle_name: str
    date: str
    title: str
    category: Optional[str]
    cost: Optional[float]
    # maintenance fields
    odometer: Optional[int] = None
    description: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    next_date: Optional[str] = None
    next_odometer: Optional[int] = None
    # fuel fields
    liters: Optional[float] = None
    price_per_liter: Optional[float] = None
    station_name: Optional[str] = None
    # photos (maintenance only)
    photos: list[MaintenancePhotoOut] = []
