from datetime import datetime

from pydantic import BaseModel


class TagInItemDTO(BaseModel):
    """Simplified Tag DTO for inclusion in Item responses"""

    id: int
    name: str
    color: str

    class Config:
        from_attributes = True


class ItemDTO(BaseModel):
    """DTO for Item responses"""

    id: int
    name: str
    description: str | None = None
    created_at: datetime
    updated_at: datetime | None = None
    tags: list[TagInItemDTO] = []

    class Config:
        from_attributes = True


class ItemCreateDTO(BaseModel):
    """DTO for creating items"""

    name: str
    description: str | None = None
    tag_ids: list[int] = []


class ItemUpdateDTO(BaseModel):
    """DTO for updating items"""

    name: str | None = None
    description: str | None = None
    tag_ids: list[int] | None = None
