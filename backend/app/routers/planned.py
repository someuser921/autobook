from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_session
from app.dependencies import get_current_user
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.planned import PlannedMaintenance
from app.schemas.planned import PlannedCreate, PlannedUpdate, PlannedOut

router = APIRouter(tags=["planned"])


async def check_vehicle_access(vehicle_id: int, user: User, session: AsyncSession) -> Vehicle:
    result = await session.execute(
        select(Vehicle).where(Vehicle.id == vehicle_id, Vehicle.user_id == user.id)
    )
    v = result.scalar_one_or_none()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return v


@router.get("/vehicles/{vehicle_id}/planned", response_model=list[PlannedOut])
async def list_planned(
    vehicle_id: int,
    include_done: Optional[bool] = Query(False),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await check_vehicle_access(vehicle_id, user, session)
    q = select(PlannedMaintenance).where(PlannedMaintenance.vehicle_id == vehicle_id)
    if not include_done:
        q = q.where(PlannedMaintenance.is_done == False)
    q = q.order_by(PlannedMaintenance.due_date.asc().nulls_last(), PlannedMaintenance.created_at.asc())
    result = await session.execute(q)
    return result.scalars().all()


@router.post("/vehicles/{vehicle_id}/planned", response_model=PlannedOut, status_code=201)
async def create_planned(
    vehicle_id: int,
    data: PlannedCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await check_vehicle_access(vehicle_id, user, session)
    record = PlannedMaintenance(**data.model_dump(), vehicle_id=vehicle_id)
    session.add(record)
    await session.commit()
    await session.refresh(record)
    return record


@router.patch("/planned/{record_id}", response_model=PlannedOut)
async def update_planned(
    record_id: int,
    data: PlannedUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(PlannedMaintenance)
        .join(Vehicle)
        .where(PlannedMaintenance.id == record_id, Vehicle.user_id == user.id)
    )
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(r, field, value)
    await session.commit()
    await session.refresh(r)
    return r


@router.delete("/planned/{record_id}", status_code=204)
async def delete_planned(
    record_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(PlannedMaintenance)
        .join(Vehicle)
        .where(PlannedMaintenance.id == record_id, Vehicle.user_id == user.id)
    )
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    await session.delete(r)
    await session.commit()
