from typing import List, Optional
from ...domain.entities.item import Item
from ...domain.interfaces.item_repository import ItemRepository
from ..dtos.item_dto import ItemDTO, ItemCreateDTO, ItemUpdateDTO


class GetItemUseCase:
    """Use case to retrieve a specific item"""

    def __init__(self, repository: ItemRepository):
        self.repository = repository

    async def execute(self, item_id: int) -> Optional[ItemDTO]:
        """Get an item by ID"""
        item = await self.repository.get_by_id(item_id)
        if item is None:
            return None
        return ItemDTO(
            id=item.id,
            name=item.name,
            description=item.description,
            created_at=item.created_at,
            updated_at=item.updated_at,
        )


class GetAllItemsUseCase:
    """Use case to retrieve all items"""

    def __init__(self, repository: ItemRepository):
        self.repository = repository

    async def execute(self, skip: int = 0, limit: int = 100) -> List[ItemDTO]:
        """Get all items with pagination"""
        items = await self.repository.get_all(skip=skip, limit=limit)
        return [
            ItemDTO(
                id=item.id,
                name=item.name,
                description=item.description,
                created_at=item.created_at,
                updated_at=item.updated_at,
            )
            for item in items
        ]


class CreateItemUseCase:
    """Use case to create a new item"""

    def __init__(self, repository: ItemRepository):
        self.repository = repository

    async def execute(self, dto: ItemCreateDTO) -> ItemDTO:
        """Create a new item"""
        item = Item(name=dto.name, description=dto.description)
        created_item = await self.repository.create(item)
        return ItemDTO(
            id=created_item.id,
            name=created_item.name,
            description=created_item.description,
            created_at=created_item.created_at,
            updated_at=created_item.updated_at,
        )


class UpdateItemUseCase:
    """Use case to update an existing item"""

    def __init__(self, repository: ItemRepository):
        self.repository = repository

    async def execute(self, item_id: int, dto: ItemUpdateDTO) -> Optional[ItemDTO]:
        """Update an existing item"""
        # Get the current item
        current_item = await self.repository.get_by_id(item_id)
        if current_item is None:
            return None

        # Update fields if provided
        if dto.name is not None:
            current_item.name = dto.name
        if dto.description is not None:
            current_item.description = dto.description

        updated_item = await self.repository.update(item_id, current_item)
        return ItemDTO(
            id=updated_item.id,
            name=updated_item.name,
            description=updated_item.description,
            created_at=updated_item.created_at,
            updated_at=updated_item.updated_at,
        )


class DeleteItemUseCase:
    """Use case to delete an item"""

    def __init__(self, repository: ItemRepository):
        self.repository = repository

    async def execute(self, item_id: int) -> bool:
        """Delete an item"""
        return await self.repository.delete(item_id)
