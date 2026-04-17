from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date
from app.database import get_session
from app.dependencies import get_current_user
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.fuel import FuelRecord
from app.schemas.fuel import FuelCreate, FuelUpdate, FuelOut

router = APIRouter(tags=["fuel"])


async def check_vehicle_access(vehicle_id: int, user: User, session: AsyncSession) -> Vehicle:
    result = await session.execute(
        select(Vehicle).where(Vehicle.id == vehicle_id, Vehicle.user_id == user.id)
    )
    v = result.scalar_one_or_none()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return v


@router.get("/vehicles/{vehicle_id}/fuel", response_model=list[FuelOut])
async def list_fuel(
    vehicle_id: int,
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await check_vehicle_access(vehicle_id, user, session)
    q = select(FuelRecord).where(FuelRecord.vehicle_id == vehicle_id)
    if date_from:
        q = q.where(FuelRecord.date >= date_from)
    if date_to:
        q = q.where(FuelRecord.date <= date_to)
    q = q.order_by(FuelRecord.date.desc())
    result = await session.execute(q)
    records = result.scalars().all()
    return [FuelOut.from_orm_with_price(r) for r in records]


@router.post("/vehicles/{vehicle_id}/fuel", response_model=FuelOut, status_code=201)
async def create_fuel(
    vehicle_id: int,
    data: FuelCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    v = await check_vehicle_access(vehicle_id, user, session)
    record = FuelRecord(**data.model_dump(), vehicle_id=vehicle_id)
    session.add(record)
    if data.odometer and data.odometer > v.current_odometer:
        v.current_odometer = data.odometer
    await session.commit()
    await session.refresh(record)
    return FuelOut.from_orm_with_price(record)


@router.patch("/fuel/{record_id}", response_model=FuelOut)
async def update_fuel(
    record_id: int,
    data: FuelUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(FuelRecord)
        .join(Vehicle)
        .where(FuelRecord.id == record_id, Vehicle.user_id == user.id)
    )
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Record not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(r, field, value)
    await session.commit()
    await session.refresh(r)
    return FuelOut.from_orm_with_price(r)


@router.delete("/fuel/{record_id}", status_code=204)
async def delete_fuel(
    record_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(FuelRecord)
        .join(Vehicle)
        .where(FuelRecord.id == record_id, Vehicle.user_id == user.id)
    )
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Record not found")
    await session.delete(r)
    await session.commit()
