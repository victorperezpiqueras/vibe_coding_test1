from datetime import datetime


class Tag:
    """Domain entity representing a Tag"""

    def __init__(
        self,
        name: str,
        color: str,
        id: int | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
    ):
        self.id = id
        self.name = name
        self.color = color
        self.created_at = created_at
        self.updated_at = updated_at
