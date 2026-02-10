from abc import ABC, abstractmethod

from app.items.domain.entities.item import Item


class ItemRepository(ABC):
    """Repository interface for Item persistence"""

    @abstractmethod
    async def get_by_id(self, item_id: int) -> Item | None:
        """Get an item by ID"""
        pass

    @abstractmethod
    async def get_all(self, skip: int = 0, limit: int = 100) -> list[Item]:
        """Get all items with pagination"""
        pass

    @abstractmethod
    async def create(self, item: Item) -> Item:
        """Create a new item"""
        pass

    @abstractmethod
    async def update(self, item_id: int, item: Item) -> Item | None:
        """Update an existing item"""
        pass

    @abstractmethod
    async def delete(self, item_id: int) -> bool:
        """Delete an item"""
        pass
