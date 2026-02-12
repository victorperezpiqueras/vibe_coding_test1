# Vibe Coding Test - Monorepo

[![CI](https://github.com/victorperezpiqueras/vibe_coding_test1/actions/workflows/ci.yml/badge.svg)](https://github.com/victorperezpiqueras/vibe_coding_test1/actions/workflows/ci.yml)
[![Backend Coverage](https://codecov.io/gh/victorperezpiqueras/vibe_coding_test1/branch/main/graph/badge.svg?flag=backend)](https://codecov.io/gh/victorperezpiqueras/vibe_coding_test1?flag=backend)
[![Frontend Coverage](https://codecov.io/gh/victorperezpiqueras/vibe_coding_test1/branch/main/graph/badge.svg?flag=frontend)](https://codecov.io/gh/victorperezpiqueras/vibe_coding_test1?flag=frontend)

A full-stack application with React frontend and FastAPI backend, using SQLite database and following Hexagonal Architecture principles.

## Overview

This monorepo contains:
- **Frontend**: React + Vite application with modern development tools
- **Backend**: FastAPI service with SQLAlchemy ORM, following Hexagonal Architecture
- **Database**: SQLite for lightweight data persistence

## Tech Stack

**Frontend**: React, Vite, ESLint  
**Backend**: FastAPI, SQLAlchemy, SQLite, Uvicorn, Pydantic, Poetry  
**Testing**: Pytest (backend), Vitest (frontend), Playwright (E2E)

## Getting Started

### Prerequisites

- **Node.js** 20 or higher
- **Python** 3.13
- **Poetry** (Python dependency management): `pip install poetry`
- **Make** (for running commands)

### Installation & Running

1. **Install all dependencies:**
   ```bash
   make install
   ```

2. **Start both frontend and backend:**
   ```bash
   make dev
   ```

This will start:
- Frontend at <http://localhost:5173>
- Backend at <http://localhost:8000>
- API docs at <http://localhost:8000/docs>

### Individual Components

To work with frontend or backend separately:

```bash
make install-frontend    # Install frontend dependencies
make install-backend     # Install backend dependencies
make frontend            # Run frontend dev server
make backend             # Run backend dev server
```

For detailed setup instructions, see:
- [Frontend README](frontend/README.md)
- [Backend README](backend/README.md)

## Features

**Frontend:**
- Modern React with Vite and HMR
- API integration ready

**Backend:**
- RESTful API with automatic documentation
- CRUD operations for Items and Tags
- Hexagonal Architecture for clean separation
- CORS enabled for frontend communication

## Development Commands

### Linting

```bash
make lint              # Lint both frontend and backend
make lint-frontend     # Lint frontend only
make lint-backend      # Lint backend only
```

### Formatting

```bash
make format            # Format both frontend and backend
make format-frontend   # Format frontend only
make format-backend    # Format backend only
```

### Testing

```bash
make test              # Run all tests
make test-frontend     # Run frontend tests
make test-backend      # Run backend tests
make test-e2e-ci       # Run E2E tests (requires backend running on port 8000)
```

### Building

```bash
make build             # Build both for production
make build-frontend    # Build frontend only
make build-backend     # Build backend only
```

### Other Commands

```bash
make help              # Display all available commands
make clean             # Clean generated files and caches
make precommit-run     # Run pre-commit checks on all files
make check             # Run all checks (lint + pre-commit)
```

## Documentation

- [Backend README](backend/README.md) - Architecture, API endpoints, and detailed backend documentation
- [Frontend README](frontend/README.md) - Frontend setup and configuration
- [Backend Architecture Guide](.github/backend-architecture.instructions.md) - Hexagonal architecture guidelines

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test both frontend and backend
4. Submit a pull request

## License

MIT
