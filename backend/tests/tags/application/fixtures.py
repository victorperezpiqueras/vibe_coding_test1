"""Fixtures for tags application tests"""

from datetime import datetime

from app.tags.application.dtos.tag_dto import TagCreateDTO, TagDTO, TagUpdateDTO
from app.tags.domain.entities.tag import Tag


def create_tag_entity(
    id: int = 1,
    name: str = "Test Tag",
    color: str = "#FF5733",
    created_at: datetime | None = None,
    updated_at: datetime | None = None,
) -> Tag:
    """Create a test Tag entity"""
    return Tag(
        id=id,
        name=name,
        color=color,
        created_at=created_at or datetime(2024, 1, 1, 12, 0, 0),
        updated_at=updated_at,
    )


def create_tag_dto(
    id: int = 1,
    name: str = "Test Tag",
    color: str = "#FF5733",
    created_at: datetime | None = None,
    updated_at: datetime | None = None,
) -> TagDTO:
    """Create a test TagDTO"""
    return TagDTO(
        id=id,
        name=name,
        color=color,
        created_at=created_at or datetime(2024, 1, 1, 12, 0, 0),
        updated_at=updated_at,
    )


def create_tag_create_dto(
    name: str = "Test Tag",
    color: str = "#FF5733",
) -> TagCreateDTO:
    """Create a test TagCreateDTO"""
    return TagCreateDTO(
        name=name,
        color=color,
    )


def create_tag_update_dto(
    name: str | None = "Updated Tag",
    color: str | None = "#00FF00",
) -> TagUpdateDTO:
    """Create a test TagUpdateDTO"""
    return TagUpdateDTO(
        name=name,
        color=color,
    )
