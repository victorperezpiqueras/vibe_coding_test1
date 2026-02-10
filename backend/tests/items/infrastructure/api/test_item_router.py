"""Unit tests for item router"""

from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException

from app.items.infrastructure.api.item_router import (
    create_item,
    delete_item,
    get_item,
    get_items,
    update_item,
)
from tests.items.application.fixtures import (
    create_item_create_dto,
    create_item_dto,
    create_item_update_dto,
)


class TestGetItemsEndpoint:
    """Test GET /items/ endpoint"""

    @pytest.mark.asyncio
    async def test_get_items_returns_all_items(self, mocker):
        """Test getting all items"""
        # Arrange
        mock_repo = AsyncMock()
        items = [
            create_item_dto(id=1, name="Item 1"),
            create_item_dto(id=2, name="Item 2"),
        ]

        mock_use_case = AsyncMock()
        mock_use_case.execute = AsyncMock(return_value=items)
        mock_use_case_class = mocker.patch(
            "app.items.infrastructure.api.item_router.GetAllItemsUseCase",
            return_value=mock_use_case,
        )

        # Act
        result = await get_items(skip=0, limit=100, repository=mock_repo)

        # Assert
        assert len(result) == 2
        assert result[0].name == "Item 1"
        assert result[1].name == "Item 2"
        mock_use_case_class.assert_called_once_with(mock_repo)
        mock_use_case.execute.assert_called_once_with(skip=0, limit=100)

    @pytest.mark.asyncio
    async def test_get_items_with_pagination(self, mocker):
        """Test getting items with custom pagination"""
        # Arrange
        mock_repo = AsyncMock()

        mock_use_case = AsyncMock()
        mock_use_case.execute = AsyncMock(return_value=[])
        mocker.patch(
            "app.items.infrastructure.api.item_router.GetAllItemsUseCase",
            return_value=mock_use_case,
        )

        # Act
        await get_items(skip=10, limit=50, repository=mock_repo)

        # Assert
        mock_use_case.execute.assert_called_once_with(skip=10, limit=50)


class TestGetItemEndpoint:
    """Test GET /items/{item_id} endpoint"""

    @pytest.mark.asyncio
    async def test_get_item_returns_item_when_found(self, mocker):
        """Test getting an existing item"""
        # Arrange
        mock_repo = AsyncMock()
        item = create_item_dto(id=1, name="Test Item")

        mock_use_case = AsyncMock()
        mock_use_case.execute = AsyncMock(return_value=item)
        mock_use_case_class = mocker.patch(
            "app.items.infrastructure.api.item_router.GetItemUseCase",
            return_value=mock_use_case,
        )

        # Act
        result = await get_item(item_id=1, repository=mock_repo)

        # Assert
        assert result.id == 1
        assert result.name == "Test Item"
        mock_use_case_class.assert_called_once_with(mock_repo)

    @pytest.mark.asyncio
    async def test_get_item_raises_404_when_not_found(self, mocker):
        """Test getting a non-existent item"""
        # Arrange
        mock_repo = AsyncMock()

        mock_use_case = AsyncMock()
        mock_use_case.execute = AsyncMock(return_value=None)
        mocker.patch(
            "app.items.infrastructure.api.item_router.GetItemUseCase",
            return_value=mock_use_case,
        )

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_item(item_id=999, repository=mock_repo)

        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "Item not found"


class TestCreateItemEndpoint:
    """Test POST /items/ endpoint"""

    @pytest.mark.asyncio
    async def test_create_item_returns_created_item(self, mocker):
        """Test creating a new item"""
        # Arrange
        mock_repo = AsyncMock()
        dto = create_item_create_dto(name="New Item")
        created_item = create_item_dto(id=1, name="New Item")

        mock_use_case = AsyncMock()
        mock_use_case.execute = AsyncMock(return_value=created_item)
        mock_use_case_class = mocker.patch(
            "app.items.infrastructure.api.item_router.CreateItemUseCase",
            return_value=mock_use_case,
        )

        # Act
        result = await create_item(item=dto, repository=mock_repo)

        # Assert
        assert result.id == 1
        assert result.name == "New Item"
        mock_use_case_class.assert_called_once_with(mock_repo)
        mock_use_case.execute.assert_called_once_with(dto)


class TestUpdateItemEndpoint:
    """Test PUT /items/{item_id} endpoint"""

    @pytest.mark.asyncio
    async def test_update_item_returns_updated_item(self, mocker):
        """Test updating an existing item"""
        # Arrange
        mock_repo = AsyncMock()
        dto = create_item_update_dto(name="Updated Item")
        updated_item = create_item_dto(id=1, name="Updated Item")

        mock_use_case = AsyncMock()
        mock_use_case.execute = AsyncMock(return_value=updated_item)
        mock_use_case_class = mocker.patch(
            "app.items.infrastructure.api.item_router.UpdateItemUseCase",
            return_value=mock_use_case,
        )

        # Act
        result = await update_item(item_id=1, item=dto, repository=mock_repo)

        # Assert
        assert result.id == 1
        assert result.name == "Updated Item"
        mock_use_case_class.assert_called_once_with(mock_repo)
        mock_use_case.execute.assert_called_once_with(1, dto)

    @pytest.mark.asyncio
    async def test_update_item_raises_404_when_not_found(self, mocker):
        """Test updating a non-existent item"""
        # Arrange
        mock_repo = AsyncMock()
        dto = create_item_update_dto()

        mock_use_case = AsyncMock()
        mock_use_case.execute = AsyncMock(return_value=None)
        mocker.patch(
            "app.items.infrastructure.api.item_router.UpdateItemUseCase",
            return_value=mock_use_case,
        )

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await update_item(item_id=999, item=dto, repository=mock_repo)

        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "Item not found"


class TestDeleteItemEndpoint:
    """Test DELETE /items/{item_id} endpoint"""

    @pytest.mark.asyncio
    async def test_delete_item_succeeds(self, mocker):
        """Test deleting an existing item"""
        # Arrange
        mock_repo = AsyncMock()

        mock_use_case = AsyncMock()
        mock_use_case.execute = AsyncMock(return_value=True)
        mock_use_case_class = mocker.patch(
            "app.items.infrastructure.api.item_router.DeleteItemUseCase",
            return_value=mock_use_case,
        )

        # Act
        result = await delete_item(item_id=1, repository=mock_repo)

        # Assert
        assert result is None
        mock_use_case_class.assert_called_once_with(mock_repo)
        mock_use_case.execute.assert_called_once_with(1)

    @pytest.mark.asyncio
    async def test_delete_item_raises_404_when_not_found(self, mocker):
        """Test deleting a non-existent item"""
        # Arrange
        mock_repo = AsyncMock()

        mock_use_case = AsyncMock()
        mock_use_case.execute = AsyncMock(return_value=False)
        mocker.patch(
            "app.items.infrastructure.api.item_router.DeleteItemUseCase",
            return_value=mock_use_case,
        )

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await delete_item(item_id=999, repository=mock_repo)

        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "Item not found"
