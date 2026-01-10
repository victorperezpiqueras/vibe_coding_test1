# Legacy routers module - routes are now in app.items.infrastructure.api
from app.items.infrastructure.api.item_router import router as items_router

__all__ = ["items_router"]
