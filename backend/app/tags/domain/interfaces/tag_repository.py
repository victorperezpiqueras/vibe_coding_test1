from abc import ABC, abstractmethod

from app.tags.domain.entities.tag import Tag


class TagRepositoryInterface(ABC):
    """Interface for Tag repository"""

    @abstractmethod
    async def create(self, tag: Tag) -> Tag:
        """Create a new tag"""
        pass

    @abstractmethod
    async def get_by_id(self, tag_id: int) -> Tag | None:
        """Get a tag by ID"""
        pass

    @abstractmethod
    async def get_all(self, skip: int = 0, limit: int = 100) -> list[Tag]:
        """Get all tags"""
        pass

    @abstractmethod
    async def get_by_name(self, name: str) -> Tag | None:
        """Get a tag by name"""
        pass

    @abstractmethod
    async def update(self, tag_id: int, tag: Tag) -> Tag | None:
        """Update a tag"""
        pass

    @abstractmethod
    async def delete(self, tag_id: int) -> bool:
        """Delete a tag"""
        pass

    @abstractmethod
    async def get_by_ids(self, tag_ids: list[int]) -> list[Tag]:
        """Get multiple tags by their IDs"""
        pass
