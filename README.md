# Vibe Coding Test - Monorepo

[![CI](https://github.com/victorperezpiqueras/vibe_coding_test1/actions/workflows/ci.yml/badge.svg)](https://github.com/victorperezpiqueras/vibe_coding_test1/actions/workflows/ci.yml)

A monorepo containing a React frontend and FastAPI backend with SQLite database.

## Project Structure

```txt
vibe_coding_test1/
├── frontend/          # React + Vite frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── backend/           # FastAPI + SQLAlchemy backend
│   ├── app/
│   │   ├── main.py
│   │   ├── database/
│   │   ├── models/
│   │   └── routers/
│   ├── requirements.txt
│   └── README.md
└── README.md          # This file
```

## Tech Stack

### Frontend

- **React** - UI library
- **Vite** - Build tool and dev server
- **ESLint** - Code linting

### Backend

- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **SQLite** - Lightweight database
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **Poetry** - Python dependency management

## Getting Started

### Prerequisites

- Node.js 20 or higher (for frontend)
- Python 3.13 (required for backend)
- Poetry (for Python dependency management) - Install with: `pip install poetry`
- Make (for running Makefile commands)

### Quick Start

The easiest way to get started is using the Makefile commands:

1. Install all dependencies:

```bash
make install
```

2. Run both frontend and backend in development mode:

```bash
make dev
```

This will start:
- Frontend at <http://localhost:5173>
- Backend at <http://localhost:8000>
- API Documentation at <http://localhost:8000/docs>

### Alternative: Manual Setup

If you prefer to set up each component separately, see the sections below.

### Frontend Setup

#### Using Makefile (Recommended)

```bash
make install-frontend  # Install dependencies
make frontend          # Start dev server
```

#### Manual Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will be available at <http://localhost:5173>

### Backend Setup

For detailed backend setup instructions, see the [backend README](backend/README.md).

#### Quick Start (Using Makefile)

```bash
make install-backend  # Install dependencies
make backend          # Start dev server
```

The backend will be available at:
- API: <http://localhost:8000>
- API Documentation: <http://localhost:8000/docs>

## Features

### Frontend Features

- Modern React application with Vite for fast development
- Hot module replacement (HMR)
- Ready for API integration

### Backend Features

- RESTful API with automatic documentation
- CRUD operations for Items
- SQLite database with SQLAlchemy ORM
- CORS enabled for frontend communication
- Health check endpoint

## Development

### Running Both Services

#### Using Makefile (Recommended)

```bash
make dev
```

This will run both the frontend and backend in parallel.

#### Manual Setup

For development, you'll need to run both the frontend and backend in separate terminals:

**Terminal 1 - Backend:**

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

### Linting and Formatting

Run linting checks:

```bash
make lint              # Lint both frontend and backend
make lint-frontend     # Lint frontend only
make lint-backend      # Lint backend only (pylint)
make lint-backend-ruff # Lint backend with ruff
```

Format code:

```bash
make format            # Format both frontend and backend
make format-frontend   # Format frontend only
make format-backend    # Format backend only
```

### Testing

Run tests:

```bash
make test              # Run all tests
make test-frontend     # Run frontend tests only
make test-backend      # Run backend tests only
make test-e2e-ci       # Run E2E tests in CI mode (requires backend to be running)
```

**Note**: For E2E tests, ensure the backend is running on port 8000 before executing `make test-e2e-ci`.
To run the backend:
```bash
cd backend
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Building for Production

#### Using Makefile (Recommended)

```bash
make build             # Build both frontend and backend
make build-frontend    # Build frontend only
make build-backend     # Build backend only
```

#### Manual Build

**Frontend:**

```bash
cd frontend
npm run build
```

**Backend:**
The backend can be deployed using any ASGI server like Uvicorn or Gunicorn.

### Other Useful Commands

```bash
make help              # Display all available commands
make clean             # Clean all generated files and caches
make precommit-run     # Run pre-commit checks on all files
```

## API Endpoints

See the [backend README](backend/README.md) for detailed API documentation.

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test both frontend and backend
4. Submit a pull request

## License

MIT
