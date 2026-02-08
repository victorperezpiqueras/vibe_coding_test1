from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.shared.infrastructure import get_db

from ...application.dtos.tag_dto import TagCreateDTO, TagDTO, TagUpdateDTO
from ...application.use_cases.tag_use_cases import (
    CreateTagUseCase,
    DeleteTagUseCase,
    GetAllTagsUseCase,
    GetTagUseCase,
    UpdateTagUseCase,
)
from ...infrastructure.database.tag_repository_impl import TagRepositoryImpl

router = APIRouter(prefix="/tags", tags=["tags"])


def get_tag_repository(db: Session = Depends(get_db)) -> TagRepositoryImpl:
    """Dependency injection for tag repository"""
    return TagRepositoryImpl(db)


@router.get("/", response_model=List[TagDTO])
async def get_tags(
    skip: int = 0,
    limit: int = 100,
    repository: TagRepositoryImpl = Depends(get_tag_repository),
):
    """Get all tags with pagination"""
    use_case = GetAllTagsUseCase(repository)
    return await use_case.execute(skip=skip, limit=limit)


@router.get("/{tag_id}", response_model=TagDTO)
async def get_tag(
    tag_id: int,
    repository: TagRepositoryImpl = Depends(get_tag_repository),
):
    """Get a specific tag by ID"""
    use_case = GetTagUseCase(repository)
    tag = await use_case.execute(tag_id)
    if tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.post("/", response_model=TagDTO, status_code=201)
async def create_tag(
    tag: TagCreateDTO,
    repository: TagRepositoryImpl = Depends(get_tag_repository),
):
    """Create a new tag"""
    use_case = CreateTagUseCase(repository)
    try:
        return await use_case.execute(tag)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.put("/{tag_id}", response_model=TagDTO)
async def update_tag(
    tag_id: int,
    tag: TagUpdateDTO,
    repository: TagRepositoryImpl = Depends(get_tag_repository),
):
    """Update an existing tag"""
    use_case = UpdateTagUseCase(repository)
    try:
        updated_tag = await use_case.execute(tag_id, tag)
        if updated_tag is None:
            raise HTTPException(status_code=404, detail="Tag not found")
        return updated_tag
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.delete("/{tag_id}", status_code=204)
async def delete_tag(
    tag_id: int,
    repository: TagRepositoryImpl = Depends(get_tag_repository),
):
    """Delete a tag"""
    use_case = DeleteTagUseCase(repository)
    success = await use_case.execute(tag_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tag not found")
    return None
