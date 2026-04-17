from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from datetime import date
from app.database import get_session
from app.dependencies import get_current_user
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.maintenance import MaintenanceRecord
from app.models.fuel import FuelRecord
from app.schemas.stats import MaintenanceStats, CategoryStat, FuelStats, FuelMonthStat

router = APIRouter(tags=["stats"])


async def check_vehicle_access(vehicle_id: int, user: User, session: AsyncSession) -> Vehicle:
    result = await session.execute(
        select(Vehicle).where(Vehicle.id == vehicle_id, Vehicle.user_id == user.id)
    )
    v = result.scalar_one_or_none()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return v


@router.get("/vehicles/{vehicle_id}/stats/maintenance", response_model=MaintenanceStats)
async def maintenance_stats(
    vehicle_id: int,
    year: Optional[int] = Query(None),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await check_vehicle_access(vehicle_id, user, session)

    q = select(
        MaintenanceRecord.category,
        func.sum(MaintenanceRecord.cost).label("total"),
        func.count(MaintenanceRecord.id).label("count"),
    ).where(MaintenanceRecord.vehicle_id == vehicle_id, MaintenanceRecord.cost.isnot(None))

    if year:
        q = q.where(extract("year", MaintenanceRecord.date) == year)

    q = q.group_by(MaintenanceRecord.category)
    result = await session.execute(q)
    rows = result.all()

    by_category = [CategoryStat(category=r.category, total=float(r.total), count=r.count) for r in rows]
    total = sum(c.total for c in by_category)
    total_records_result = await session.execute(
        select(func.count(MaintenanceRecord.id)).where(MaintenanceRecord.vehicle_id == vehicle_id)
    )
    total_records = total_records_result.scalar() or 0

    return MaintenanceStats(total_cost=total, total_records=total_records, by_category=by_category)


@router.get("/vehicles/{vehicle_id}/stats/fuel", response_model=FuelStats)
async def fuel_stats(
    vehicle_id: int,
    year: Optional[int] = Query(None),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await check_vehicle_access(vehicle_id, user, session)

    q = select(
        extract("year", FuelRecord.date).label("year"),
        extract("month", FuelRecord.date).label("month"),
        func.sum(FuelRecord.total_cost).label("total_cost"),
        func.sum(FuelRecord.liters).label("total_liters"),
        func.count(FuelRecord.id).label("records"),
    ).where(FuelRecord.vehicle_id == vehicle_id)

    if year:
        q = q.where(extract("year", FuelRecord.date) == year)

    q = q.group_by("year", "month").order_by("year", "month")
    result = await session.execute(q)
    rows = result.all()

    months = []
    for r in rows:
        liters = float(r.total_liters)
        cost = float(r.total_cost)
        months.append(FuelMonthStat(
            year=int(r.year),
            month=int(r.month),
            total_cost=cost,
            total_liters=liters,
            records=r.records,
            avg_price_per_liter=round(cost / liters, 2) if liters > 0 else 0,
        ))

    total_cost = sum(m.total_cost for m in months)
    total_liters = sum(m.total_liters for m in months)
    total_records = sum(m.records for m in months)
    num_months = len(months) or 1
    num_weeks = max(num_months * 4.33, 1)

    # avg price per liter overall
    all_records_q = await session.execute(
        select(func.sum(FuelRecord.total_cost), func.sum(FuelRecord.liters))
        .where(FuelRecord.vehicle_id == vehicle_id)
    )
    totals = all_records_q.one()
    all_cost = float(totals[0] or 0)
    all_liters = float(totals[1] or 0)

    return FuelStats(
        total_cost=total_cost,
        total_liters=total_liters,
        total_records=total_records,
        avg_cost_per_month=round(total_cost / num_months, 2),
        avg_cost_per_week=round(total_cost / num_weeks, 2),
        avg_price_per_liter=round(all_cost / all_liters, 2) if all_liters > 0 else 0,
        months=months,
    )
