from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.shared.infrastructure import get_db

from ...application.dtos.item_dto import ItemCreateDTO, ItemDTO, ItemUpdateDTO
from ...application.use_cases.item_use_cases import (
    CreateItemUseCase,
    DeleteItemUseCase,
    GetAllItemsUseCase,
    GetItemUseCase,
    UpdateItemUseCase,
)
from ...infrastructure.database.item_repository_impl import ItemRepositoryImpl

router = APIRouter(prefix="/items", tags=["items"])


def get_item_repository(db: Session = Depends(get_db)) -> ItemRepositoryImpl:
    """Dependency injection for item repository"""
    return ItemRepositoryImpl(db)


@router.get("/", response_model=List[ItemDTO])
async def get_items(
    skip: int = 0,
    limit: int = 100,
    repository: ItemRepositoryImpl = Depends(get_item_repository),
):
    """Get all items with pagination"""
    use_case = GetAllItemsUseCase(repository)
    return await use_case.execute(skip=skip, limit=limit)


@router.get("/{item_id}", response_model=ItemDTO)
async def get_item(
    item_id: int,
    repository: ItemRepositoryImpl = Depends(get_item_repository),
):
    """Get a specific item by ID"""
    use_case = GetItemUseCase(repository)
    item = await use_case.execute(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.post("/", response_model=ItemDTO, status_code=201)
async def create_item(
    item: ItemCreateDTO,
    repository: ItemRepositoryImpl = Depends(get_item_repository),
):
    """Create a new item"""
    use_case = CreateItemUseCase(repository)
    return await use_case.execute(item)


@router.put("/{item_id}", response_model=ItemDTO)
async def update_item(
    item_id: int,
    item: ItemUpdateDTO,
    repository: ItemRepositoryImpl = Depends(get_item_repository),
):
    """Update an existing item"""
    use_case = UpdateItemUseCase(repository)
    updated_item = await use_case.execute(item_id, item)
    if updated_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated_item


@router.delete("/{item_id}", status_code=204)
async def delete_item(
    item_id: int,
    repository: ItemRepositoryImpl = Depends(get_item_repository),
):
    """Delete an item"""
    use_case = DeleteItemUseCase(repository)
    success = await use_case.execute(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return None
