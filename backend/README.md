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

- Python 3.8 or higher
- pip
- Make (optional, for using Makefile commands)

### Installation

#### Using Makefile (Recommended)

From the project root directory:

```bash
make install-backend
```

#### Manual Installation

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

### Running the Server

#### Using Makefile (Recommended)

From the project root directory:

```bash
make backend
```

#### Manual Start

Start the development server:

```bash
uvicorn app.main:app --reload
```

The API will be available at:

- API: <http://localhost:8000>
- Swagger UI: <http://localhost:8000/docs>
- ReDoc: <http://localhost:8000/redoc>

### Database

The SQLite database file (`app.db`) will be created automatically
in the backend directory when you first run the application.

## Development

### Linting

```bash
make lint-backend       # Lint with pylint
make lint-backend-ruff  # Lint with ruff
```

### Formatting

```bash
make format-backend        # Format with black
make format-backend-check  # Check formatting with ruff
```

### Testing

```bash
make test-backend  # Run backend tests
```

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
