from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ItemDTO(BaseModel):
    """DTO for Item responses"""

    id: int
    name: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ItemCreateDTO(BaseModel):
    """DTO for creating items"""

    name: str
    description: Optional[str] = None


class ItemUpdateDTO(BaseModel):
    """DTO for updating items"""

    name: Optional[str] = None
    description: Optional[str] = None
