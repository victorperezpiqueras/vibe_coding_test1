from abc import ABC, abstractmethod
from typing import List, Optional

from app.tags.domain.entities.tag import Tag


class TagRepositoryInterface(ABC):
    """Interface for Tag repository"""

    @abstractmethod
    async def create(self, tag: Tag) -> Tag:
        """Create a new tag"""
        pass

    @abstractmethod
    async def get_by_id(self, tag_id: int) -> Optional[Tag]:
        """Get a tag by ID"""
        pass

    @abstractmethod
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Tag]:
        """Get all tags"""
        pass

    @abstractmethod
    async def get_by_name(self, name: str) -> Optional[Tag]:
        """Get a tag by name"""
        pass

    @abstractmethod
    async def update(self, tag_id: int, tag: Tag) -> Optional[Tag]:
        """Update a tag"""
        pass

    @abstractmethod
    async def delete(self, tag_id: int) -> bool:
        """Delete a tag"""
        pass

    @abstractmethod
    async def get_by_ids(self, tag_ids: List[int]) -> List[Tag]:
        """Get multiple tags by their IDs"""
        pass
