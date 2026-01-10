from datetime import datetime
from typing import Optional


class Item:
    """Domain entity representing an Item"""

    def __init__(
        self,
        name: str,
        description: Optional[str] = None,
        id: Optional[int] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        self.id = id
        self.name = name
        self.description = description
        self.created_at = created_at
        self.updated_at = updated_at
