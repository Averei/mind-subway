from pydantic import BaseModel
from typing import Optional

class Outlet(BaseModel):
    id: Optional[int] = None
    name: str
    address: str
    operating_hours: Optional[str] = None
    waze_link: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        from_attributes = True