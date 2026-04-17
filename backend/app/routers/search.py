from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.database import get_session
from app.dependencies import get_current_user
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.maintenance import MaintenanceRecord
from app.models.fuel import FuelRecord
from app.schemas.stats import SearchResult

router = APIRouter(tags=["search"])


@router.get("/search", response_model=list[SearchResult])
async def search(
    q: str = Query(..., min_length=1),
    vehicle_id: Optional[int] = Query(None),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    pattern = f"%{q}%"
    results: list[SearchResult] = []

    # Get user's vehicle ids
    vq = select(Vehicle).where(Vehicle.user_id == user.id)
    if vehicle_id:
        vq = vq.where(Vehicle.id == vehicle_id)
    v_result = await session.execute(vq)
    vehicles = {v.id: f"{v.make} {v.model}" for v in v_result.scalars().all()}

    if not vehicles:
        return []

    vehicle_ids = list(vehicles.keys())

    # Search maintenance
    mq = select(MaintenanceRecord).where(
        MaintenanceRecord.vehicle_id.in_(vehicle_ids),
        or_(
            MaintenanceRecord.title.ilike(pattern),
            MaintenanceRecord.description.ilike(pattern),
            MaintenanceRecord.location.ilike(pattern),
            MaintenanceRecord.notes.ilike(pattern),
        ),
    ).order_by(MaintenanceRecord.date.desc()).limit(20)

    m_result = await session.execute(mq)
    for r in m_result.scalars().all():
        results.append(SearchResult(
            type="maintenance",
            id=r.id,
            vehicle_id=r.vehicle_id,
            vehicle_name=vehicles.get(r.vehicle_id, ""),
            date=r.date.isoformat(),
            title=r.title,
            category=r.category,
            cost=float(r.cost) if r.cost else None,
        ))

    # Search fuel by station name
    fq = select(FuelRecord).where(
        FuelRecord.vehicle_id.in_(vehicle_ids),
        or_(
            FuelRecord.station_name.ilike(pattern),
            FuelRecord.notes.ilike(pattern),
        ),
    ).order_by(FuelRecord.date.desc()).limit(10)

    f_result = await session.execute(fq)
    for r in f_result.scalars().all():
        results.append(SearchResult(
            type="fuel",
            id=r.id,
            vehicle_id=r.vehicle_id,
            vehicle_name=vehicles.get(r.vehicle_id, ""),
            date=r.date.isoformat(),
            title=r.station_name or "Заправка",
            category=None,
            cost=float(r.total_cost),
        ))

    # Sort all by date desc
    results.sort(key=lambda x: x.date, reverse=True)
    return results[:30]
