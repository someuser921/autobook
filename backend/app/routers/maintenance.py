from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date
from app.database import get_session
from app.dependencies import get_current_user
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.maintenance import MaintenanceRecord, MaintenanceCategory
from app.schemas.maintenance import MaintenanceCreate, MaintenanceUpdate, MaintenanceOut

router = APIRouter(tags=["maintenance"])


async def check_vehicle_access(vehicle_id: int, user: User, session: AsyncSession) -> Vehicle:
    result = await session.execute(
        select(Vehicle).where(Vehicle.id == vehicle_id, Vehicle.user_id == user.id)
    )
    v = result.scalar_one_or_none()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return v


@router.get("/vehicles/{vehicle_id}/maintenance", response_model=list[MaintenanceOut])
async def list_maintenance(
    vehicle_id: int,
    category: Optional[MaintenanceCategory] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    sort: str = Query("date_desc"),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await check_vehicle_access(vehicle_id, user, session)
    q = select(MaintenanceRecord).where(MaintenanceRecord.vehicle_id == vehicle_id)
    if category:
        q = q.where(MaintenanceRecord.category == category)
    if date_from:
        q = q.where(MaintenanceRecord.date >= date_from)
    if date_to:
        q = q.where(MaintenanceRecord.date <= date_to)
    if sort == "date_asc":
        q = q.order_by(MaintenanceRecord.date.asc())
    else:
        q = q.order_by(MaintenanceRecord.date.desc())
    result = await session.execute(q)
    return result.scalars().all()


@router.post("/vehicles/{vehicle_id}/maintenance", response_model=MaintenanceOut, status_code=201)
async def create_maintenance(
    vehicle_id: int,
    data: MaintenanceCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    v = await check_vehicle_access(vehicle_id, user, session)
    record = MaintenanceRecord(**data.model_dump(), vehicle_id=vehicle_id)
    session.add(record)
    # update vehicle odometer if provided and greater
    if data.odometer and data.odometer > v.current_odometer:
        v.current_odometer = data.odometer
    await session.commit()
    await session.refresh(record)
    return record


@router.get("/maintenance/{record_id}", response_model=MaintenanceOut)
async def get_maintenance(
    record_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(MaintenanceRecord)
        .join(Vehicle)
        .where(MaintenanceRecord.id == record_id, Vehicle.user_id == user.id)
    )
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Record not found")
    return r


@router.patch("/maintenance/{record_id}", response_model=MaintenanceOut)
async def update_maintenance(
    record_id: int,
    data: MaintenanceUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(MaintenanceRecord)
        .join(Vehicle)
        .where(MaintenanceRecord.id == record_id, Vehicle.user_id == user.id)
    )
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Record not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(r, field, value)
    await session.commit()
    await session.refresh(r)
    return r


@router.delete("/maintenance/{record_id}", status_code=204)
async def delete_maintenance(
    record_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(MaintenanceRecord)
        .join(Vehicle)
        .where(MaintenanceRecord.id == record_id, Vehicle.user_id == user.id)
    )
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Record not found")
    await session.delete(r)
    await session.commit()
