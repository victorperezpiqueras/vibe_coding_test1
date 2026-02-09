from typing import List, Optional

from app.tags.application.dtos.tag_dto import TagCreateDTO, TagDTO, TagUpdateDTO
from app.tags.domain.entities.tag import Tag
from app.tags.domain.interfaces.tag_repository import TagRepositoryInterface


class CreateTagUseCase:
    """Use case for creating a tag"""

    def __init__(self, repository: TagRepositoryInterface):
        self.repository = repository

    async def execute(self, tag_dto: TagCreateDTO) -> TagDTO:
        """Execute the create tag use case"""
        # Check if tag with same name already exists
        existing = await self.repository.get_by_name(tag_dto.name)
        if existing:
            raise ValueError(f"Tag with name '{tag_dto.name}' already exists")

        tag = Tag(name=tag_dto.name, color=tag_dto.color)
        created_tag = await self.repository.create(tag)
        return TagDTO.model_validate(created_tag)


class GetTagUseCase:
    """Use case for getting a tag by ID"""

    def __init__(self, repository: TagRepositoryInterface):
        self.repository = repository

    async def execute(self, tag_id: int) -> Optional[TagDTO]:
        """Execute the get tag use case"""
        tag = await self.repository.get_by_id(tag_id)
        return TagDTO.model_validate(tag) if tag else None


class GetAllTagsUseCase:
    """Use case for getting all tags"""

    def __init__(self, repository: TagRepositoryInterface):
        self.repository = repository

    async def execute(self, skip: int = 0, limit: int = 100) -> List[TagDTO]:
        """Execute the get all tags use case"""
        tags = await self.repository.get_all(skip=skip, limit=limit)
        return [TagDTO.model_validate(tag) for tag in tags]


class UpdateTagUseCase:
    """Use case for updating a tag"""

    def __init__(self, repository: TagRepositoryInterface):
        self.repository = repository

    async def execute(self, tag_id: int, tag_dto: TagUpdateDTO) -> Optional[TagDTO]:
        """Execute the update tag use case"""
        # Check if tag exists
        existing_tag = await self.repository.get_by_id(tag_id)
        if not existing_tag:
            return None

        # If name is being updated, check it doesn't conflict
        if tag_dto.name and tag_dto.name != existing_tag.name:
            name_conflict = await self.repository.get_by_name(tag_dto.name)
            if name_conflict:
                raise ValueError(f"Tag with name '{tag_dto.name}' already exists")

        # Create updated tag entity
        updated_tag = Tag(
            id=tag_id,
            name=tag_dto.name if tag_dto.name else existing_tag.name,
            color=tag_dto.color if tag_dto.color else existing_tag.color,
        )

        result = await self.repository.update(tag_id, updated_tag)
        return TagDTO.model_validate(result) if result else None


class DeleteTagUseCase:
    """Use case for deleting a tag"""

    def __init__(self, repository: TagRepositoryInterface):
        self.repository = repository

    async def execute(self, tag_id: int) -> bool:
        """Execute the delete tag use case"""
        return await self.repository.delete(tag_id)
