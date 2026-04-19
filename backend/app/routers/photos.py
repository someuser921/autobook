import uuid
import io
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_session
from app.dependencies import get_current_user
from app.services.auth import decode_token
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.maintenance import MaintenanceRecord
from app.models.photo import MaintenancePhoto
from app.schemas.photo import MaintenancePhotoOut
from app.config import settings

router = APIRouter(tags=["photos"])

MAX_PHOTOS = 5
MAX_DIMENSION = 1920


@router.post("/maintenance/{record_id}/photos", response_model=MaintenancePhotoOut, status_code=201)
async def upload_photo(
    record_id: int,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(MaintenanceRecord).join(Vehicle)
        .where(MaintenanceRecord.id == record_id, Vehicle.user_id == user.id)
    )
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Record not found")

    if len(r.photos) >= MAX_PHOTOS:
        raise HTTPException(status_code=400, detail=f"Max {MAX_PHOTOS} photos per record")

    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only images allowed")

    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 20MB)")

    try:
        from PIL import Image
        img = Image.open(io.BytesIO(content))
        img = img.convert("RGB")
        if img.width > MAX_DIMENSION or img.height > MAX_DIMENSION:
            img.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)
    except Exception:
        raise HTTPException(status_code=400, detail="Cannot process image")

    filename = f"{uuid.uuid4()}.jpg"
    uploads_dir = Path(settings.uploads_dir)
    uploads_dir.mkdir(parents=True, exist_ok=True)

    out_buf = io.BytesIO()
    img.save(out_buf, "JPEG", quality=82, optimize=True)
    (uploads_dir / filename).write_bytes(out_buf.getvalue())

    photo = MaintenancePhoto(maintenance_record_id=record_id, filename=filename)
    session.add(photo)
    await session.commit()
    await session.refresh(photo)
    return photo


@router.delete("/photos/{photo_id}", status_code=204)
async def delete_photo(
    photo_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(MaintenancePhoto).join(MaintenanceRecord).join(Vehicle)
        .where(MaintenancePhoto.id == photo_id, Vehicle.user_id == user.id)
    )
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Photo not found")

    path = Path(settings.uploads_dir) / p.filename
    if path.exists():
        path.unlink()

    await session.delete(p)
    await session.commit()


@router.get("/photos/{filename}")
async def serve_photo(
    filename: str,
    token: str = Query(...),
    session: AsyncSession = Depends(get_session),
):
    user_id = decode_token(token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    result = await session.execute(
        select(MaintenancePhoto).join(MaintenanceRecord).join(Vehicle)
        .where(MaintenancePhoto.filename == filename, Vehicle.user_id == user_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Not found")

    path = Path(settings.uploads_dir) / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(path, media_type="image/jpeg", headers={"Cache-Control": "private, max-age=3600"})
