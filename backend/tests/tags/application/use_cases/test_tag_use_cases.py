"""Unit tests for tag use cases"""

from unittest.mock import AsyncMock

import pytest

from app.tags.application.use_cases.tag_use_cases import (
    CreateTagUseCase,
    DeleteTagUseCase,
    GetAllTagsUseCase,
    GetTagUseCase,
    UpdateTagUseCase,
)
from tests.tags.application.fixtures import (
    create_tag_create_dto,
    create_tag_entity,
    create_tag_update_dto,
)


class TestCreateTagUseCase:
    """Test CreateTagUseCase"""

    @pytest.mark.asyncio
    async def test_execute_creates_tag(self):
        """Test creating a tag"""
        # Arrange
        mock_repo = AsyncMock()
        dto = create_tag_create_dto(name="New Tag", color="#FF0000")
        created_entity = create_tag_entity(id=1, name="New Tag", color="#FF0000")
        mock_repo.get_by_name.return_value = None
        mock_repo.create.return_value = created_entity
        use_case = CreateTagUseCase(mock_repo)

        # Act
        result = await use_case.execute(dto)

        # Assert
        assert result.id == 1
        assert result.name == "New Tag"
        assert result.color == "#FF0000"
        mock_repo.get_by_name.assert_called_once_with("New Tag")
        mock_repo.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_execute_raises_error_when_duplicate_name(self):
        """Test creating a tag with duplicate name"""
        # Arrange
        mock_repo = AsyncMock()
        dto = create_tag_create_dto(name="Existing Tag")
        existing_tag = create_tag_entity(id=1, name="Existing Tag")
        mock_repo.get_by_name.return_value = existing_tag
        use_case = CreateTagUseCase(mock_repo)

        # Act & Assert
        with pytest.raises(ValueError) as exc_info:
            await use_case.execute(dto)

        assert "already exists" in str(exc_info.value)
        mock_repo.get_by_name.assert_called_once_with("Existing Tag")
        mock_repo.create.assert_not_called()


class TestGetTagUseCase:
    """Test GetTagUseCase"""

    @pytest.mark.asyncio
    async def test_execute_returns_tag_when_found(self):
        """Test getting a tag that exists"""
        # Arrange
        mock_repo = AsyncMock()
        tag_entity = create_tag_entity(id=1, name="Test Tag")
        mock_repo.get_by_id.return_value = tag_entity
        use_case = GetTagUseCase(mock_repo)

        # Act
        result = await use_case.execute(tag_id=1)

        # Assert
        assert result is not None
        assert result.id == 1
        assert result.name == "Test Tag"
        mock_repo.get_by_id.assert_called_once_with(1)

    @pytest.mark.asyncio
    async def test_execute_returns_none_when_not_found(self):
        """Test getting a tag that doesn't exist"""
        # Arrange
        mock_repo = AsyncMock()
        mock_repo.get_by_id.return_value = None
        use_case = GetTagUseCase(mock_repo)

        # Act
        result = await use_case.execute(tag_id=999)

        # Assert
        assert result is None
        mock_repo.get_by_id.assert_called_once_with(999)


class TestGetAllTagsUseCase:
    """Test GetAllTagsUseCase"""

    @pytest.mark.asyncio
    async def test_execute_returns_all_tags(self):
        """Test getting all tags"""
        # Arrange
        mock_repo = AsyncMock()
        tag_entities = [
            create_tag_entity(id=1, name="Tag 1"),
            create_tag_entity(id=2, name="Tag 2"),
        ]
        mock_repo.get_all.return_value = tag_entities
        use_case = GetAllTagsUseCase(mock_repo)

        # Act
        result = await use_case.execute()

        # Assert
        assert len(result) == 2
        assert result[0].name == "Tag 1"
        assert result[1].name == "Tag 2"
        mock_repo.get_all.assert_called_once_with(skip=0, limit=100)

    @pytest.mark.asyncio
    async def test_execute_with_pagination(self):
        """Test getting all tags with custom pagination"""
        # Arrange
        mock_repo = AsyncMock()
        mock_repo.get_all.return_value = []
        use_case = GetAllTagsUseCase(mock_repo)

        # Act
        await use_case.execute(skip=10, limit=50)

        # Assert
        mock_repo.get_all.assert_called_once_with(skip=10, limit=50)

    @pytest.mark.asyncio
    async def test_execute_returns_empty_list_when_no_tags(self):
        """Test getting all tags when none exist"""
        # Arrange
        mock_repo = AsyncMock()
        mock_repo.get_all.return_value = []
        use_case = GetAllTagsUseCase(mock_repo)

        # Act
        result = await use_case.execute()

        # Assert
        assert result == []
        mock_repo.get_all.assert_called_once()


class TestUpdateTagUseCase:
    """Test UpdateTagUseCase"""

    @pytest.mark.asyncio
    async def test_execute_updates_tag(self):
        """Test updating an existing tag"""
        # Arrange
        mock_repo = AsyncMock()
        current_tag = create_tag_entity(id=1, name="Old Name", color="#FF0000")
        updated_tag = create_tag_entity(id=1, name="New Name", color="#00FF00")
        mock_repo.get_by_id.return_value = current_tag
        mock_repo.get_by_name.return_value = None
        mock_repo.update.return_value = updated_tag
        dto = create_tag_update_dto(name="New Name", color="#00FF00")
        use_case = UpdateTagUseCase(mock_repo)

        # Act
        result = await use_case.execute(tag_id=1, tag_dto=dto)

        # Assert
        assert result is not None
        assert result.name == "New Name"
        assert result.color == "#00FF00"
        mock_repo.get_by_id.assert_called_once_with(1)
        mock_repo.update.assert_called_once()

    @pytest.mark.asyncio
    async def test_execute_returns_none_when_tag_not_found(self):
        """Test updating a non-existent tag"""
        # Arrange
        mock_repo = AsyncMock()
        mock_repo.get_by_id.return_value = None
        dto = create_tag_update_dto()
        use_case = UpdateTagUseCase(mock_repo)

        # Act
        result = await use_case.execute(tag_id=999, tag_dto=dto)

        # Assert
        assert result is None
        mock_repo.get_by_id.assert_called_once_with(999)
        mock_repo.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_execute_raises_error_when_name_conflicts(self):
        """Test updating tag with a name that already exists"""
        # Arrange
        mock_repo = AsyncMock()
        current_tag = create_tag_entity(id=1, name="Tag 1", color="#FF0000")
        conflicting_tag = create_tag_entity(id=2, name="Tag 2", color="#00FF00")
        mock_repo.get_by_id.return_value = current_tag
        mock_repo.get_by_name.return_value = conflicting_tag
        dto = create_tag_update_dto(name="Tag 2")
        use_case = UpdateTagUseCase(mock_repo)

        # Act & Assert
        with pytest.raises(ValueError) as exc_info:
            await use_case.execute(tag_id=1, tag_dto=dto)

        assert "already exists" in str(exc_info.value)
        mock_repo.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_execute_allows_same_name(self):
        """Test updating tag with the same name it already has"""
        # Arrange
        mock_repo = AsyncMock()
        current_tag = create_tag_entity(id=1, name="Same Name", color="#FF0000")
        updated_tag = create_tag_entity(id=1, name="Same Name", color="#00FF00")
        mock_repo.get_by_id.return_value = current_tag
        mock_repo.update.return_value = updated_tag
        dto = create_tag_update_dto(name="Same Name", color="#00FF00")
        use_case = UpdateTagUseCase(mock_repo)

        # Act
        result = await use_case.execute(tag_id=1, tag_dto=dto)

        # Assert
        assert result is not None
        mock_repo.get_by_id.assert_called_once_with(1)
        # Should not check for name conflict since name hasn't changed
        mock_repo.get_by_name.assert_not_called()
        mock_repo.update.assert_called_once()


class TestDeleteTagUseCase:
    """Test DeleteTagUseCase"""

    @pytest.mark.asyncio
    async def test_execute_deletes_tag(self):
        """Test deleting an existing tag"""
        # Arrange
        mock_repo = AsyncMock()
        mock_repo.delete.return_value = True
        use_case = DeleteTagUseCase(mock_repo)

        # Act
        result = await use_case.execute(tag_id=1)

        # Assert
        assert result is True
        mock_repo.delete.assert_called_once_with(1)

    @pytest.mark.asyncio
    async def test_execute_returns_false_when_tag_not_found(self):
        """Test deleting a non-existent tag"""
        # Arrange
        mock_repo = AsyncMock()
        mock_repo.delete.return_value = False
        use_case = DeleteTagUseCase(mock_repo)

        # Act
        result = await use_case.execute(tag_id=999)

        # Assert
        assert result is False
        mock_repo.delete.assert_called_once_with(999)
