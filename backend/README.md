# Backend - FastAPI with SQLAlchemy and SQLite

This is the backend service built with FastAPI, SQLAlchemy, and
SQLite following **Hexagonal Architecture** (Ports and Adapters
pattern).

## Features

- FastAPI framework for high-performance API
- SQLAlchemy ORM with SQLite database
- Hexagonal Architecture for clean separation of concerns
- CRUD operations for Items
- Automatic API documentation (Swagger UI and ReDoc)
- CORS enabled for frontend communication
- Dependency injection pattern for testability

## Architecture

This backend follows the **Hexagonal Architecture** pattern with three main layers:

### Domain Layer

- **Entities**: Core business models (pure business logic)
- **Interfaces**: Repository interfaces defining contracts

### Application Layer

- **Use Cases**: Application-specific business rules and orchestration
- **DTOs**: Data Transfer Objects for input/output

### Infrastructure Layer

- **API**: FastAPI routers and request/response models
- **ORM**: SQLAlchemy models and database mappings
- **Database**: Repository implementations and database connections

For detailed architecture guidelines, see [.github/backend-architecture.instructions.md](../.github/backend-architecture.instructions.md)

## Setup

### Prerequisites

- Python 3.13
- Poetry (install with: `pip install poetry`)
- Make (optional, for using Makefile commands)

### Installation

From the project root directory:

```bash
make install-backend
```

This installs all dependencies and required Poetry plugins.

### Running the Server

From the project root directory:

```bash
make backend
```

The API will be available at:
- API: <http://localhost:8000>
- Swagger UI: <http://localhost:8000/docs>
- ReDoc: <http://localhost:8000/redoc>

For manual setup without Make, see the commands in the [Makefile](../Makefile).

### Database

The SQLite database file (`app.db`) will be created automatically
in the backend directory when you first run the application.

## Development

### Linting

```bash
make lint-backend       # Lint with ruff
```

### Formatting

```bash
make format-backend     # Format with ruff
```

### Testing

The backend includes comprehensive unit tests for use cases and API endpoints.

```bash
make test-backend  # Run all backend tests
```

For more granular test runs, use pytest directly from the backend directory:

```bash
cd backend
pytest                    # Run all tests
pytest tests/items/       # Run only items tests
pytest tests/tags/        # Run only tags tests
pytest -v                 # Verbose output
pytest -k "test_create"   # Run tests matching pattern
```

#### Test Structure

The test suite follows the same hexagonal architecture structure as the application:

```
tests/
├── items/
│   ├── application/
│   │   ├── fixtures.py              # Reusable test fixtures for Items
│   │   └── use_cases/
│   │       └── test_item_use_cases.py
│   └── infrastructure/
│       └── api/
│           └── test_item_router.py
└── tags/
    ├── application/
    │   ├── fixtures.py              # Reusable test fixtures for Tags
    │   └── use_cases/
    │       └── test_tag_use_cases.py
    └── infrastructure/
        └── api/
            └── test_tag_router.py
```

#### Test Coverage

- **Use Case Tests**: Mock repositories to test business logic in isolation
- **API Tests**: Mock use cases to test HTTP endpoints and status codes
- **Total**: 45 tests covering all CRUD operations for Items and Tags


## API Endpoints

### Root

- `GET /` - Welcome message

### Health Check

- `GET /health` - Health check endpoint

### Items

- `GET /items/` - Get all items (with pagination)
- `GET /items/{item_id}` - Get a specific item
- `POST /items/` - Create a new item
- `PUT /items/{item_id}` - Update an item
- `DELETE /items/{item_id}` - Delete an item

## Project Structure

```txt
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── database/
│   │   ├── __init__.py
│   │   └── database.py      # Database configuration
│   ├── items/               # Items module (Hexagonal Architecture)
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── item.py
│   │   │   └── interfaces/
│   │   │       └── item_repository.py
│   │   ├── application/
│   │   │   ├── use_cases/
│   │   │   │   └── item_use_cases.py
│   │   │   └── dtos/
│   │   │       └── item_dto.py
│   │   └── infrastructure/
│   │       ├── api/
│   │       │   └── item_router.py
│   │       ├── orm/
│   │       │   └── item_orm.py
│   │       └── database/
│   │           └── item_repository_impl.py
│   ├── shared/              # Shared utilities
│   │   ├── domain/
│   │   └── infrastructure/
│   └── routers/             # Legacy routers (redirects to items module)
│       └── items.py
├── requirements.txt         # Python dependencies
└── .gitignore
```

## Adding New Features

To add a new feature following the Hexagonal Architecture:

1. Create a new module in `app/` (e.g., `app/users/`)
2. Define domain entities in `domain/entities/`
3. Define repository interfaces in `domain/interfaces/`
4. Implement use cases in `application/use_cases/`
5. Create DTOs in `application/dtos/`
6. Implement repository in `infrastructure/database/`
7. Create ORM models in `infrastructure/orm/`
8. Create API router in `infrastructure/api/`
