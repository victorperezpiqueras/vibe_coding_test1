# Frontend - React + Vite

Modern React application built with Vite for fast development and optimized production builds.

## Features

- **React** - UI library for building user interfaces
- **Vite** - Fast build tool with instant HMR
- **ESLint** - Code linting for consistent code quality
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing

## Setup

### Prerequisites

- Node.js 20 or higher
- Make (optional, for using Makefile commands)

### Installation

From the project root directory:

```bash
make install-frontend
```

### Running the Development Server

From the project root directory:

```bash
make frontend
```

The frontend will be available at <http://localhost:5173>

For manual setup without Make, see the commands in the [Makefile](../Makefile).

## Development

### Linting

```bash
make lint-frontend     # Lint frontend code
```

### Formatting

```bash
make format-frontend   # Format frontend code with prettier
```

### Testing

```bash
make test-frontend           # Run unit tests
make test-frontend-coverage  # Run unit tests with coverage report
make test-e2e-ci             # Run E2E tests (requires backend running)
```

For more granular test runs, use npm scripts directly from the frontend directory:

```bash
cd frontend
npm run test              # Run unit tests
npm run test:coverage     # Run unit tests with coverage
npm run test:e2e          # Run E2E tests
```

#### Code Coverage

The project uses Vitest with V8 coverage provider to track code coverage. Coverage reports are generated in multiple formats:

- **Text**: Displayed in the terminal after running tests
- **HTML**: Interactive report in `frontend/coverage/index.html`
- **LCOV**: Machine-readable format for CI/CD integration (`frontend/coverage/lcov.info`)
- **JSON**: Raw coverage data in `frontend/coverage/coverage-final.json`

To view the HTML coverage report locally:

```bash
cd frontend
npm run test:coverage
# Open coverage/index.html in your browser
```

Coverage is automatically tracked in CI/CD and uploaded to Codecov for pull requests.

### Building for Production

```bash
make build-frontend    # Build frontend for production
```

The production build will be available in the `frontend/dist` directory.

## Project Structure

```txt
frontend/
├── src/
│   ├── components/    # React components
│   ├── App.jsx        # Main application component
│   └── main.jsx       # Application entry point
├── public/            # Static assets
├── e2e/               # End-to-end tests
├── package.json       # Dependencies and scripts
└── vite.config.js     # Vite configuration
```

## API Integration

The frontend is configured to communicate with the backend API running on <http://localhost:8000>. CORS is enabled on the backend to allow requests from the frontend development server.
