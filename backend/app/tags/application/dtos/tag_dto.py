from datetime import datetime

from pydantic import BaseModel, Field


class TagDTO(BaseModel):
    """DTO for Tag responses"""

    id: int
    name: str
    color: str = Field(..., pattern="^#[0-9A-Fa-f]{6}$")
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class TagCreateDTO(BaseModel):
    """DTO for creating tags"""

    name: str = Field(..., min_length=1, max_length=50)
    color: str = Field(..., pattern="^#[0-9A-Fa-f]{6}$")


class TagUpdateDTO(BaseModel):
    """DTO for updating tags"""

    name: str | None = Field(None, min_length=1, max_length=50)
    color: str | None = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
