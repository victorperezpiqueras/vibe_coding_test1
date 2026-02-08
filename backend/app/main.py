from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.items.infrastructure.api.item_router import router as items_router

# Import ORM models to register them with Base (avoid circular imports)
from app.items.infrastructure.orm.item_orm import ItemORM  # noqa: F401
from app.shared.infrastructure.database.database import Base, engine
from app.tags.infrastructure.api.tag_router import router as tags_router
from app.tags.infrastructure.orm.tag_orm import TagORM  # noqa: F401

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Vibe Coding Test API",
    description="A FastAPI backend with SQLAlchemy and SQLite following Hexagonal Architecture",
    version="1.0.0",
)

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(items_router)
app.include_router(tags_router)


@app.get("/")
def read_root():
    """Root endpoint"""
    return {
        "message": "Welcome to Vibe Coding Test API",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
