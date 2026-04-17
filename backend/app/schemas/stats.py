from typing import Optional
from pydantic import BaseModel


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
