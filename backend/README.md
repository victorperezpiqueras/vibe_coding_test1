# Backend - FastAPI with SQLAlchemy and SQLite

This is the backend service built with FastAPI, SQLAlchemy, and SQLite.

## Features

- FastAPI framework for high-performance API
- SQLAlchemy ORM with SQLite database
- CRUD operations for Items
- Automatic API documentation (Swagger UI and ReDoc)
- CORS enabled for frontend communication

## Setup

### Prerequisites

- Python 3.8 or higher
- pip

### Installation

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

Start the development server:
```bash
uvicorn app.main:app --reload
```

The API will be available at:
- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Database

The SQLite database file (`app.db`) will be created automatically in the backend directory when you first run the application.

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

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── schemas.py           # Pydantic models
│   ├── database/
│   │   ├── __init__.py
│   │   └── database.py      # Database configuration
│   ├── models/
│   │   ├── __init__.py
│   │   └── item.py          # SQLAlchemy models
│   └── routers/
│       ├── __init__.py
│       └── items.py         # API routes
├── requirements.txt         # Python dependencies
└── .gitignore
```
