"""Integration tests for ItemRepositoryImpl"""

import pytest
from sqlalchemy.orm import Session

from app.items.domain.entities.item import Item
from app.items.infrastructure.database.item_repository_impl import ItemRepositoryImpl
from app.items.infrastructure.orm.item_orm import ItemORM
from app.tags.infrastructure.orm.tag_orm import TagORM


class TestItemRepositoryImplGetById:
    """Test get_by_id method"""

    @pytest.mark.asyncio
    async def test_get_by_id_returns_existing_item(self, db_session: Session):
        """Test getting an existing item by ID"""
        # Arrange: Create test data in database
        test_item = ItemORM(name="Test Item", description="Test Description")
        db_session.add(test_item)
        db_session.commit()
        db_session.refresh(test_item)
        item_id = test_item.id

        # Create repository instance
        repository = ItemRepositoryImpl(db_session)

        # Act: Call the repository method
        result = await repository.get_by_id(item_id)

        # Assert: Verify the result
        assert result is not None
        assert result.id == item_id
        assert result.name == "Test Item"
        assert result.description == "Test Description"
        assert result.created_at is not None

    @pytest.mark.asyncio
    async def test_get_by_id_returns_none_for_nonexistent_item(self, db_session: Session):
        """Test getting a non-existent item returns None"""
        # Arrange
        repository = ItemRepositoryImpl(db_session)

        # Act: Try to get an item with ID that doesn't exist
        result = await repository.get_by_id(999)

        # Assert
        assert result is None

    @pytest.mark.asyncio
    async def test_get_by_id_returns_item_with_tags(self, db_session: Session):
        """Test getting an item with associated tags"""
        # Arrange: Create tags
        tag1 = TagORM(name="Tag1", color="#FF0000")
        tag2 = TagORM(name="Tag2", color="#00FF00")
        db_session.add_all([tag1, tag2])
        db_session.commit()

        # Create item with tags
        test_item = ItemORM(name="Tagged Item", description="Item with tags")
        test_item.tags = [tag1, tag2]
        db_session.add(test_item)
        db_session.commit()
        db_session.refresh(test_item)
        item_id = test_item.id

        # Create repository
        repository = ItemRepositoryImpl(db_session)

        # Act
        result = await repository.get_by_id(item_id)

        # Assert
        assert result is not None
        assert result.id == item_id
        assert len(result.tags) == 2
        assert result.tags[0].name in ["Tag1", "Tag2"]
        assert result.tags[1].name in ["Tag1", "Tag2"]


class TestItemRepositoryImplGetAll:
    """Test get_all method"""

    @pytest.mark.asyncio
    async def test_get_all_returns_all_items(self, db_session: Session):
        """Test getting all items"""
        # Arrange: Create multiple test items
        item1 = ItemORM(name="Item 1", description="Description 1")
        item2 = ItemORM(name="Item 2", description="Description 2")
        item3 = ItemORM(name="Item 3", description="Description 3")
        db_session.add_all([item1, item2, item3])
        db_session.commit()

        # Create repository
        repository = ItemRepositoryImpl(db_session)

        # Act
        result = await repository.get_all()

        # Assert
        assert len(result) == 3
        assert all(isinstance(item, ItemORM) for item in result)

    @pytest.mark.asyncio
    async def test_get_all_returns_empty_list_when_no_items(self, db_session: Session):
        """Test getting all items when database is empty"""
        # Arrange
        repository = ItemRepositoryImpl(db_session)

        # Act
        result = await repository.get_all()

        # Assert
        assert result == []

    @pytest.mark.asyncio
    async def test_get_all_with_pagination(self, db_session: Session):
        """Test pagination with skip and limit parameters"""
        # Arrange: Create 5 items
        for i in range(5):
            item = ItemORM(name=f"Item {i}", description=f"Description {i}")
            db_session.add(item)
        db_session.commit()

        # Create repository
        repository = ItemRepositoryImpl(db_session)

        # Act: Get items with skip=1 and limit=2
        result = await repository.get_all(skip=1, limit=2)

        # Assert: Should get 2 items, skipping the first one
        assert len(result) == 2

    @pytest.mark.asyncio
    async def test_get_all_respects_limit(self, db_session: Session):
        """Test that limit parameter restricts the number of results"""
        # Arrange: Create 10 items
        for i in range(10):
            item = ItemORM(name=f"Item {i}", description=f"Description {i}")
            db_session.add(item)
        db_session.commit()

        # Create repository
        repository = ItemRepositoryImpl(db_session)

        # Act: Request only 5 items
        result = await repository.get_all(limit=5)

        # Assert
        assert len(result) == 5


class TestItemRepositoryImplCreate:
    """Test create method"""

    @pytest.mark.asyncio
    async def test_create_item_without_tags(self, db_session: Session):
        """Test creating an item without tags"""
        # Arrange
        repository = ItemRepositoryImpl(db_session)
        item = Item(name="New Item", description="New Description")

        # Act
        result = await repository.create(item)

        # Assert: Check returned item
        assert result is not None
        assert result.id is not None
        assert result.name == "New Item"
        assert result.description == "New Description"
        assert result.created_at is not None
        assert result.tags == []

        # Verify item exists in database
        db_item = db_session.query(ItemORM).filter(ItemORM.id == result.id).first()
        assert db_item is not None
        assert db_item.name == "New Item"

    @pytest.mark.asyncio
    async def test_create_item_with_tags(self, db_session: Session):
        """Test creating an item with associated tags"""
        # Arrange: Create tags first
        tag1 = TagORM(name="Tag1", color="#FF0000")
        tag2 = TagORM(name="Tag2", color="#00FF00")
        db_session.add_all([tag1, tag2])
        db_session.commit()
        tag_ids = [tag1.id, tag2.id]

        # Create item
        repository = ItemRepositoryImpl(db_session)
        item = Item(name="Tagged Item", description="Item with tags")

        # Act
        result = await repository.create(item, tag_ids=tag_ids)

        # Assert: Check returned item
        assert result is not None
        assert result.id is not None
        assert len(result.tags) == 2
        tag_names = {tag.name for tag in result.tags}
        assert tag_names == {"Tag1", "Tag2"}

        # Verify in database
        db_item = db_session.query(ItemORM).filter(ItemORM.id == result.id).first()
        assert len(db_item.tags) == 2

    @pytest.mark.asyncio
    async def test_create_item_with_empty_tag_list(self, db_session: Session):
        """Test creating an item with empty tag list"""
        # Arrange
        repository = ItemRepositoryImpl(db_session)
        item = Item(name="Item", description="Description")

        # Act
        result = await repository.create(item, tag_ids=[])

        # Assert
        assert result is not None
        assert result.tags == []

    @pytest.mark.asyncio
    async def test_create_item_with_nonexistent_tags(self, db_session: Session):
        """Test creating an item with non-existent tag IDs"""
        # Arrange
        repository = ItemRepositoryImpl(db_session)
        item = Item(name="Item", description="Description")

        # Act: Try to create with non-existent tag IDs
        result = await repository.create(item, tag_ids=[999, 1000])

        # Assert: Item is created but with no tags
        assert result is not None
        assert result.tags == []


class TestItemRepositoryImplUpdate:
    """Test update method"""

    @pytest.mark.asyncio
    async def test_update_item_without_tags(self, db_session: Session):
        """Test updating an item without modifying tags"""
        # Arrange: Create an existing item
        existing_item = ItemORM(name="Original Name", description="Original Description")
        db_session.add(existing_item)
        db_session.commit()
        item_id = existing_item.id

        # Create repository and updated item data
        repository = ItemRepositoryImpl(db_session)
        updated_item = Item(name="Updated Name", description="Updated Description")

        # Act
        result = await repository.update(item_id, updated_item)

        # Assert
        assert result is not None
        assert result.id == item_id
        assert result.name == "Updated Name"
        assert result.description == "Updated Description"

        # Verify in database
        db_item = db_session.query(ItemORM).filter(ItemORM.id == item_id).first()
        assert db_item.name == "Updated Name"
        assert db_item.description == "Updated Description"

    @pytest.mark.asyncio
    async def test_update_nonexistent_item(self, db_session: Session):
        """Test updating a non-existent item returns None"""
        # Arrange
        repository = ItemRepositoryImpl(db_session)
        item = Item(name="Name", description="Description")

        # Act
        result = await repository.update(999, item)

        # Assert
        assert result is None

    @pytest.mark.asyncio
    async def test_update_item_add_tags(self, db_session: Session):
        """Test updating an item to add tags"""
        # Arrange: Create item without tags
        existing_item = ItemORM(name="Item", description="Description")
        db_session.add(existing_item)
        db_session.commit()
        item_id = existing_item.id

        # Create tags
        tag1 = TagORM(name="NewTag1", color="#FF0000")
        tag2 = TagORM(name="NewTag2", color="#00FF00")
        db_session.add_all([tag1, tag2])
        db_session.commit()
        tag_ids = [tag1.id, tag2.id]

        # Create repository
        repository = ItemRepositoryImpl(db_session)
        updated_item = Item(name="Item", description="Description")

        # Act
        result = await repository.update(item_id, updated_item, tag_ids=tag_ids)

        # Assert
        assert result is not None
        assert len(result.tags) == 2
        tag_names = {tag.name for tag in result.tags}
        assert tag_names == {"NewTag1", "NewTag2"}

    @pytest.mark.asyncio
    async def test_update_item_replace_tags(self, db_session: Session):
        """Test updating an item to replace existing tags"""
        # Arrange: Create item with initial tags
        tag1 = TagORM(name="OldTag1", color="#FF0000")
        tag2 = TagORM(name="OldTag2", color="#00FF00")
        db_session.add_all([tag1, tag2])
        db_session.commit()

        existing_item = ItemORM(name="Item", description="Description")
        existing_item.tags = [tag1, tag2]
        db_session.add(existing_item)
        db_session.commit()
        item_id = existing_item.id

        # Create new tags
        tag3 = TagORM(name="NewTag", color="#0000FF")
        db_session.add(tag3)
        db_session.commit()

        # Create repository
        repository = ItemRepositoryImpl(db_session)
        updated_item = Item(name="Item", description="Description")

        # Act: Replace tags with new tag
        result = await repository.update(item_id, updated_item, tag_ids=[tag3.id])

        # Assert
        assert result is not None
        assert len(result.tags) == 1
        assert result.tags[0].name == "NewTag"

    @pytest.mark.asyncio
    async def test_update_item_remove_all_tags(self, db_session: Session):
        """Test updating an item to remove all tags"""
        # Arrange: Create item with tags
        tag1 = TagORM(name="Tag1", color="#FF0000")
        db_session.add(tag1)
        db_session.commit()

        existing_item = ItemORM(name="Item", description="Description")
        existing_item.tags = [tag1]
        db_session.add(existing_item)
        db_session.commit()
        item_id = existing_item.id

        # Create repository
        repository = ItemRepositoryImpl(db_session)
        updated_item = Item(name="Item", description="Description")

        # Act: Update with empty tag list
        result = await repository.update(item_id, updated_item, tag_ids=[])

        # Assert
        assert result is not None
        assert result.tags == []


class TestItemRepositoryImplDelete:
    """Test delete method"""

    @pytest.mark.asyncio
    async def test_delete_existing_item(self, db_session: Session):
        """Test deleting an existing item"""
        # Arrange: Create an item
        test_item = ItemORM(name="Item to Delete", description="Will be deleted")
        db_session.add(test_item)
        db_session.commit()
        item_id = test_item.id

        # Create repository
        repository = ItemRepositoryImpl(db_session)

        # Act
        result = await repository.delete(item_id)

        # Assert
        assert result is True

        # Verify item is deleted from database
        db_item = db_session.query(ItemORM).filter(ItemORM.id == item_id).first()
        assert db_item is None

    @pytest.mark.asyncio
    async def test_delete_nonexistent_item(self, db_session: Session):
        """Test deleting a non-existent item returns False"""
        # Arrange
        repository = ItemRepositoryImpl(db_session)

        # Act
        result = await repository.delete(999)

        # Assert
        assert result is False

    @pytest.mark.asyncio
    async def test_delete_item_with_tags(self, db_session: Session):
        """Test deleting an item with associated tags"""
        # Arrange: Create item with tags
        tag1 = TagORM(name="Tag1", color="#FF0000")
        db_session.add(tag1)
        db_session.commit()

        test_item = ItemORM(name="Item with Tags", description="Has tags")
        test_item.tags = [tag1]
        db_session.add(test_item)
        db_session.commit()
        item_id = test_item.id
        tag_id = tag1.id

        # Create repository
        repository = ItemRepositoryImpl(db_session)

        # Act
        result = await repository.delete(item_id)

        # Assert
        assert result is True

        # Verify item is deleted
        db_item = db_session.query(ItemORM).filter(ItemORM.id == item_id).first()
        assert db_item is None

        # Verify tag still exists (should not be deleted)
        db_tag = db_session.query(TagORM).filter(TagORM.id == tag_id).first()
        assert db_tag is not None
