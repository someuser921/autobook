from typing import Optional
from pydantic import BaseModel
from datetime import date, datetime


class PlannedCreate(BaseModel):
    title: str
    notes: Optional[str] = None
    estimated_cost: Optional[float] = None
    due_date: Optional[date] = None


class PlannedUpdate(BaseModel):
    title: Optional[str] = None
    notes: Optional[str] = None
    estimated_cost: Optional[float] = None
    due_date: Optional[date] = None
    is_done: Optional[bool] = None


class PlannedOut(BaseModel):
    id: int
    vehicle_id: int
    title: str
    notes: Optional[str]
    estimated_cost: Optional[float]
    due_date: Optional[date]
    is_done: bool
    created_at: datetime

    model_config = {"from_attributes": True}
