# Vibe Coding Test - Monorepo

A monorepo containing a React frontend and FastAPI backend with SQLite database.

## Project Structure

```
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

## Getting Started

### Frontend Setup

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

The frontend will be available at http://localhost:5173

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the backend server:
```bash
uvicorn app.main:app --reload
```

The backend will be available at:
- API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Features

### Frontend
- Modern React application with Vite for fast development
- Hot module replacement (HMR)
- Ready for API integration

### Backend
- RESTful API with automatic documentation
- CRUD operations for Items
- SQLite database with SQLAlchemy ORM
- CORS enabled for frontend communication
- Health check endpoint

## Development

### Running Both Services

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

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
The backend can be deployed using any ASGI server like Uvicorn or Gunicorn.

## API Endpoints

See the [backend README](backend/README.md) for detailed API documentation.

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test both frontend and backend
4. Submit a pull request

## License

MIT