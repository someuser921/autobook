from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_session
from app.dependencies import get_current_user
from app.models.user import User
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleOut

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


async def get_vehicle_or_404(vehicle_id: int, user: User, session: AsyncSession) -> Vehicle:
    result = await session.execute(
        select(Vehicle).where(Vehicle.id == vehicle_id, Vehicle.user_id == user.id)
    )
    v = result.scalar_one_or_none()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return v


@router.get("", response_model=list[VehicleOut])
async def list_vehicles(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(Vehicle).where(Vehicle.user_id == user.id).order_by(Vehicle.created_at))
    return result.scalars().all()


@router.post("", response_model=VehicleOut, status_code=201)
async def create_vehicle(
    data: VehicleCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    v = Vehicle(**data.model_dump(), user_id=user.id)
    session.add(v)
    await session.commit()
    await session.refresh(v)
    return v


@router.get("/{vehicle_id}", response_model=VehicleOut)
async def get_vehicle(
    vehicle_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await get_vehicle_or_404(vehicle_id, user, session)


@router.patch("/{vehicle_id}", response_model=VehicleOut)
async def update_vehicle(
    vehicle_id: int,
    data: VehicleUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    v = await get_vehicle_or_404(vehicle_id, user, session)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(v, field, value)
    await session.commit()
    await session.refresh(v)
    return v


@router.delete("/{vehicle_id}", status_code=204)
async def delete_vehicle(
    vehicle_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    v = await get_vehicle_or_404(vehicle_id, user, session)
    await session.delete(v)
    await session.commit()
