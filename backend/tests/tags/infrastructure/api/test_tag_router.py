"""Unit tests for tag router"""

from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException

from app.tags.infrastructure.api.tag_router import (
    create_tag,
    delete_tag,
    get_tag,
    get_tags,
    update_tag,
)
from tests.tags.application.fixtures import (
    create_tag_create_dto,
    create_tag_dto,
    create_tag_update_dto,
)


class TestGetTagsEndpoint:
    """Test GET /tags/ endpoint"""

    @pytest.mark.asyncio
    async def test_get_tags_returns_all_tags(self, mocker):
        """Test getting all tags"""
        # Arrange
        mock_repo = AsyncMock()
        tags = [
            create_tag_dto(id=1, name="Tag 1"),
            create_tag_dto(id=2, name="Tag 2"),
        ]

        mock_use_case = AsyncMock()
        mock_use_case.execute = AsyncMock(return_value=tags)
        mock_use_case_class = mocker.patch(
            "app.tags.infrastructure.api.tag_router.GetAllTagsUseCase",
            return_value=mock_use_case,
        )

        # Act
        result = await get_tags(skip=0, limit=100, repository=mock_repo)

        # Assert
        assert len(result) == 2
        assert result[0].name == "Tag 1"
        assert result[1].name == "Tag 2"
        mock_use_case_class.assert_called_once_with(mock_repo)
        mock_use_case.execute.assert_called_once_with(skip=0, limit=100)

    @pytest.mark.asyncio
    async def test_get_tags_with_pagination(self, mocker):
        """Test getting tags with custom pagination"""
        # Arrange
        mock_repo = AsyncMock()

        mock_use_case = AsyncMock()
        mock_use_case.execute = AsyncMock(return_value=[])
        mocker.patch(
            "app.tags.infrastructure.api.tag_router.GetAllTagsUseCase",
            return_value=mock_use_case,
        )

        # Act
        await get_tags(skip=10, limit=50, repository=mock_repo)

        # Assert
        mock_use_case.execute.assert_called_once_with(skip=10, limit=50)


class TestGetTagEndpoint:
    """Test GET /tags/{tag_id} endpoint"""

    @pytest.mark.asyncio
    async def test_get_tag_returns_tag_when_found(self, mocker):
        """Test getting an existing tag"""
        # Arrange
        mock_repo = AsyncMock()
        tag = create_tag_dto(id=1, name="Test Tag")

        mock_use_case = AsyncMock()
        mock_use_case.execute = AsyncMock(return_value=tag)
        mock_use_case_class = mocker.patch(
            "app.tags.infrastructure.api.tag_router.GetTagUseCase",
            return_value=mock_use_case,
        )

        # Act
        result = await get_tag(tag_id=1, repository=mock_repo)

        # Assert
        assert result.id == 1
        assert result.name == "Test Tag"
        mock_use_case_class.assert_called_once_with(mock_repo)

    @pytest.mark.asyncio
    async def test_get_tag_raises_404_when_not_found(self, mocker):
        """Test getting a non-existent tag"""
        # Arrange
        mock_repo = AsyncMock()

        mock_use_case = AsyncMock()
        mock_use_case.execute = AsyncMock(return_value=None)
        mocker.patch(
            "app.tags.infrastructure.api.tag_router.GetTagUseCase",
            return_value=mock_use_case,
        )

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_tag(tag_id=999, repository=mock_repo)

        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "Tag not found"


class TestCreateTagEndpoint:
    """Test POST /tags/ endpoint"""

    @pytest.mark.asyncio
    async def test_create_tag_returns_created_tag(self, mocker):
        """Test creating a new tag"""
        # Arrange
        mock_repo = AsyncMock()
        dto = create_tag_create_dto(name="New Tag")
        created_tag = create_tag_dto(id=1, name="New Tag")

        mock_use_case = AsyncMock()
        mock_use_case.execute = AsyncMock(return_value=created_tag)
        mock_use_case_class = mocker.patch(
            "app.tags.infrastructure.api.tag_router.CreateTagUseCase",
            return_value=mock_use_case,
        )

        # Act
        result = await create_tag(tag=dto, repository=mock_repo)

        # Assert
        assert result.id == 1
        assert result.name == "New Tag"
        mock_use_case_class.assert_called_once_with(mock_repo)
        mock_use_case.execute.assert_called_once_with(dto)

    @pytest.mark.asyncio
    async def test_create_tag_raises_400_on_duplicate(self, mocker):
        """Test creating a tag with duplicate name"""
        # Arrange
        mock_repo = AsyncMock()
        dto = create_tag_create_dto(name="Duplicate Tag")

        mock_use_case = AsyncMock()
        mock_use_case.execute = AsyncMock(side_effect=ValueError("Tag already exists"))
        mocker.patch(
            "app.tags.infrastructure.api.tag_router.CreateTagUseCase",
            return_value=mock_use_case,
        )

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await create_tag(tag=dto, repository=mock_repo)

        assert exc_info.value.status_code == 400
        assert "already exists" in exc_info.value.detail


class TestUpdateTagEndpoint:
    """Test PUT /tags/{tag_id} endpoint"""

    @pytest.mark.asyncio
    async def test_update_tag_returns_updated_tag(self, mocker):
        """Test updating an existing tag"""
        # Arrange
        mock_repo = AsyncMock()
        dto = create_tag_update_dto(name="Updated Tag")
        updated_tag = create_tag_dto(id=1, name="Updated Tag")

        mock_use_case = AsyncMock()
        mock_use_case.execute = AsyncMock(return_value=updated_tag)
        mock_use_case_class = mocker.patch(
            "app.tags.infrastructure.api.tag_router.UpdateTagUseCase",
            return_value=mock_use_case,
        )

        # Act
        result = await update_tag(tag_id=1, tag=dto, repository=mock_repo)

        # Assert
        assert result.id == 1
        assert result.name == "Updated Tag"
        mock_use_case_class.assert_called_once_with(mock_repo)
        mock_use_case.execute.assert_called_once_with(1, dto)

    @pytest.mark.asyncio
    async def test_update_tag_raises_404_when_not_found(self, mocker):
        """Test updating a non-existent tag"""
        # Arrange
        mock_repo = AsyncMock()
        dto = create_tag_update_dto()

        mock_use_case = AsyncMock()
        mock_use_case.execute = AsyncMock(return_value=None)
        mocker.patch(
            "app.tags.infrastructure.api.tag_router.UpdateTagUseCase",
            return_value=mock_use_case,
        )

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await update_tag(tag_id=999, tag=dto, repository=mock_repo)

        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "Tag not found"

    @pytest.mark.asyncio
    async def test_update_tag_raises_400_on_name_conflict(self, mocker):
        """Test updating tag with conflicting name"""
        # Arrange
        mock_repo = AsyncMock()
        dto = create_tag_update_dto(name="Conflicting Name")

        mock_use_case = AsyncMock()
        mock_use_case.execute = AsyncMock(side_effect=ValueError("Tag already exists"))
        mocker.patch(
            "app.tags.infrastructure.api.tag_router.UpdateTagUseCase",
            return_value=mock_use_case,
        )

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await update_tag(tag_id=1, tag=dto, repository=mock_repo)

        assert exc_info.value.status_code == 400
        assert "already exists" in exc_info.value.detail


class TestDeleteTagEndpoint:
    """Test DELETE /tags/{tag_id} endpoint"""

    @pytest.mark.asyncio
    async def test_delete_tag_succeeds(self, mocker):
        """Test deleting an existing tag"""
        # Arrange
        mock_repo = AsyncMock()

        mock_use_case = AsyncMock()
        mock_use_case.execute = AsyncMock(return_value=True)
        mock_use_case_class = mocker.patch(
            "app.tags.infrastructure.api.tag_router.DeleteTagUseCase",
            return_value=mock_use_case,
        )

        # Act
        result = await delete_tag(tag_id=1, repository=mock_repo)

        # Assert
        assert result is None
        mock_use_case_class.assert_called_once_with(mock_repo)
        mock_use_case.execute.assert_called_once_with(1)

    @pytest.mark.asyncio
    async def test_delete_tag_raises_404_when_not_found(self, mocker):
        """Test deleting a non-existent tag"""
        # Arrange
        mock_repo = AsyncMock()

        mock_use_case = AsyncMock()
        mock_use_case.execute = AsyncMock(return_value=False)
        mocker.patch(
            "app.tags.infrastructure.api.tag_router.DeleteTagUseCase",
            return_value=mock_use_case,
        )

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await delete_tag(tag_id=999, repository=mock_repo)

        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "Tag not found"
