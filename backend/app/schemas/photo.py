from pydantic import BaseModel
from datetime import datetime


class MaintenancePhotoOut(BaseModel):
    id: int
    maintenance_record_id: int
    filename: str
    created_at: datetime

    model_config = {"from_attributes": True}
