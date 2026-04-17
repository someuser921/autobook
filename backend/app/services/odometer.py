from datetime import datetime, timezone
from app.models.vehicle import Vehicle


def sync_odometer(vehicle: Vehicle, new_odometer: int | None) -> None:
    if new_odometer and new_odometer > vehicle.current_odometer:
        vehicle.current_odometer = new_odometer
        vehicle.odometer_updated_at = datetime.now(timezone.utc)
