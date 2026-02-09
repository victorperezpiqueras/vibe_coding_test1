from typing import List, Optional

from sqlalchemy.orm import Session

from app.tags.domain.entities.tag import Tag
from app.tags.domain.interfaces.tag_repository import TagRepositoryInterface
from app.tags.infrastructure.orm.tag_orm import TagORM


class TagRepositoryImpl(TagRepositoryInterface):
    """SQLAlchemy implementation of Tag repository"""

    def __init__(self, db: Session):
        self.db = db

    def _to_entity(self, orm: TagORM) -> Tag:
        """Convert ORM model to domain entity"""
        return Tag(
            id=orm.id,
            name=orm.name,
            color=orm.color,
            created_at=orm.created_at,
            updated_at=orm.updated_at,
        )

    def _to_orm(self, tag: Tag) -> TagORM:
        """Convert domain entity to ORM model"""
        return TagORM(
            id=tag.id,
            name=tag.name,
            color=tag.color,
            created_at=tag.created_at,
            updated_at=tag.updated_at,
        )

    async def create(self, tag: Tag) -> Tag:
        """Create a new tag"""
        db_tag = TagORM(name=tag.name, color=tag.color)
        self.db.add(db_tag)
        self.db.commit()
        self.db.refresh(db_tag)
        return self._to_entity(db_tag)

    async def get_by_id(self, tag_id: int) -> Optional[Tag]:
        """Get a tag by ID"""
        db_tag = self.db.query(TagORM).filter(TagORM.id == tag_id).first()
        return self._to_entity(db_tag) if db_tag else None

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Tag]:
        """Get all tags"""
        db_tags = self.db.query(TagORM).offset(skip).limit(limit).all()
        return [self._to_entity(tag) for tag in db_tags]

    async def get_by_name(self, name: str) -> Optional[Tag]:
        """Get a tag by name"""
        db_tag = self.db.query(TagORM).filter(TagORM.name == name).first()
        return self._to_entity(db_tag) if db_tag else None

    async def update(self, tag_id: int, tag: Tag) -> Optional[Tag]:
        """Update a tag"""
        db_tag = self.db.query(TagORM).filter(TagORM.id == tag_id).first()
        if not db_tag:
            return None

        if tag.name is not None:
            db_tag.name = tag.name
        if tag.color is not None:
            db_tag.color = tag.color

        self.db.commit()
        self.db.refresh(db_tag)
        return self._to_entity(db_tag)

    async def delete(self, tag_id: int) -> bool:
        """Delete a tag"""
        db_tag = self.db.query(TagORM).filter(TagORM.id == tag_id).first()
        if not db_tag:
            return False

        self.db.delete(db_tag)
        self.db.commit()
        return True

    async def get_by_ids(self, tag_ids: List[int]) -> List[Tag]:
        """Get multiple tags by their IDs"""
        db_tags = self.db.query(TagORM).filter(TagORM.id.in_(tag_ids)).all()
        return [self._to_entity(tag) for tag in db_tags]
