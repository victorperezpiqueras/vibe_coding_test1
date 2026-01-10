from typing import Optional, List
from sqlalchemy.orm import Session
from ...domain.entities.item import Item
from ...domain.interfaces.item_repository import ItemRepository
from ..orm.item_orm import ItemORM


class ItemRepositoryImpl(ItemRepository):
    """Implementation of ItemRepository using SQLAlchemy"""

    def __init__(self, db: Session):
        self.db = db

    async def get_by_id(self, item_id: int) -> Optional[Item]:
        """Get an item by ID"""
        orm_item = self.db.query(ItemORM).filter(ItemORM.id == item_id).first()
        if orm_item is None:
            return None
        return self._orm_to_entity(orm_item)

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Item]:
        """Get all items with pagination"""
        orm_items = self.db.query(ItemORM).offset(skip).limit(limit).all()
        return [self._orm_to_entity(orm_item) for orm_item in orm_items]

    async def create(self, item: Item) -> Item:
        """Create a new item"""
        orm_item = ItemORM(
            name=item.name,
            description=item.description,
        )
        self.db.add(orm_item)
        self.db.commit()
        self.db.refresh(orm_item)
        return self._orm_to_entity(orm_item)

    async def update(self, item_id: int, item: Item) -> Optional[Item]:
        """Update an existing item"""
        orm_item = self.db.query(ItemORM).filter(ItemORM.id == item_id).first()
        if orm_item is None:
            return None

        orm_item.name = item.name
        orm_item.description = item.description
        self.db.commit()
        self.db.refresh(orm_item)
        return self._orm_to_entity(orm_item)

    async def delete(self, item_id: int) -> bool:
        """Delete an item"""
        orm_item = self.db.query(ItemORM).filter(ItemORM.id == item_id).first()
        if orm_item is None:
            return False

        self.db.delete(orm_item)
        self.db.commit()
        return True

    @staticmethod
    def _orm_to_entity(orm_item: ItemORM) -> Item:
        """Convert ORM model to domain entity"""
        return Item(
            id=orm_item.id,
            name=orm_item.name,
            description=orm_item.description,
            created_at=orm_item.created_at,
            updated_at=orm_item.updated_at,
        )
