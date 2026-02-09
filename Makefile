.PHONY: help install install-frontend install-backend dev frontend backend lint format test clean precommit

# Color output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help: ## Display this help message
	@echo "$(BLUE)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

install: install-backend install-frontend precommit-install ## Install all dependencies

install-backend: ## Install backend dependencies
	@echo "$(YELLOW)Installing backend dependencies...$(NC)"
	cd backend && pip install -r requirements.txt
	@echo "$(GREEN)Backend dependencies installed$(NC)"

install-frontend: ## Install frontend dependencies
	@echo "$(YELLOW)Installing frontend dependencies...$(NC)"
	cd frontend && npm install
	@echo "$(GREEN)Frontend dependencies installed$(NC)"

install-frontend-ci: ## Install frontend dependencies for CI (uses npm ci)
	@echo "$(YELLOW)Installing frontend dependencies (CI mode)...$(NC)"
	cd frontend && npm ci
	@echo "$(GREEN)Frontend dependencies installed$(NC)"

precommit-install: ## Install pre-commit hooks
	@echo "$(YELLOW)Installing pre-commit hooks...$(NC)"
	pre-commit install
	@echo "$(GREEN)Pre-commit hooks installed$(NC)"

dev: ## Run both frontend and backend in development mode
	@echo "$(BLUE)Starting development environment...$(NC)"
	@echo "$(YELLOW)Frontend running at http://localhost:5173$(NC)"
	@echo "$(YELLOW)Backend running at http://localhost:8000$(NC)"
	@echo "$(YELLOW)API docs at http://localhost:8000/docs$(NC)"
	@echo ""
	@make -j2 backend frontend

backend: ## Run backend server with auto-reload
	@echo "$(YELLOW)Starting backend server...$(NC)"
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend: ## Run frontend development server
	@echo "$(YELLOW)Starting frontend dev server...$(NC)"
	cd frontend && npm run dev

lint: ## Run linting checks on both frontend and backend
	@echo "$(YELLOW)Running linting checks...$(NC)"
	@make lint-backend lint-frontend

lint-backend: ## Lint backend code
	@echo "$(YELLOW)Linting backend code...$(NC)"
	cd backend && pylint app/ --disable=all --enable=E,F || true

lint-backend-ruff: ## Lint backend code with ruff
	@echo "$(YELLOW)Linting backend code with ruff...$(NC)"
	cd backend && ruff check app/

lint-frontend: ## Lint frontend code
	@echo "$(YELLOW)Linting frontend code...$(NC)"
	cd frontend && npm run lint

format: ## Format code in frontend and backend
	@echo "$(YELLOW)Formatting code...$(NC)"
	@make format-backend format-frontend

format-backend: ## Format backend code with black
	@echo "$(YELLOW)Formatting backend code...$(NC)"
	cd backend && black app/ || true

format-backend-check: ## Check backend code formatting with ruff
	@echo "$(YELLOW)Checking backend code formatting with ruff...$(NC)"
	cd backend && ruff format --check app/

format-frontend: ## Format frontend code with prettier
	@echo "$(YELLOW)Formatting frontend code...$(NC)"
	cd frontend && npm run format

test: ## Run tests for backend and frontend
	@echo "$(YELLOW)Running tests...$(NC)"
	@make test-backend test-frontend

test-backend: ## Run backend tests
	@echo "$(YELLOW)Running backend tests...$(NC)"
	cd backend && pytest . || true

test-frontend: ## Run frontend tests
	@echo "$(YELLOW)Running frontend tests...$(NC)"
	cd frontend && npm run test || true

test-e2e: ## Run E2E tests with Playwright
	@echo "$(YELLOW)Running E2E tests...$(NC)"
	cd frontend && npm run test:e2e

test-e2e-ui: ## Run E2E tests in UI mode
	@echo "$(YELLOW)Running E2E tests in UI mode...$(NC)"
	cd frontend && npm run test:e2e:ui

test-e2e-debug: ## Run E2E tests in debug mode
	@echo "$(YELLOW)Running E2E tests in debug mode...$(NC)"
	cd frontend && npm run test:e2e:debug

test-e2e-ci: ## Run E2E tests in CI mode (chromium only)
	@echo "$(YELLOW)Running E2E tests in CI mode...$(NC)"
	cd frontend && npm run test:e2e -- --project=chromium

precommit-run: ## Run pre-commit checks on all files
	@echo "$(YELLOW)Running pre-commit checks...$(NC)"
	pre-commit run --all-files

precommit-run-modified: ## Run pre-commit checks on modified files only
	@echo "$(YELLOW)Running pre-commit checks on modified files...$(NC)"
	pre-commit run

clean: ## Clean all generated files and caches
	@echo "$(YELLOW)Cleaning project...$(NC)"
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .egg-info -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name .DS_Store -delete
	cd frontend && rm -rf node_modules dist .vite 2>/dev/null || true
	cd backend && rm -rf dist build 2>/dev/null || true
	@echo "$(GREEN)Project cleaned$(NC)"

build-backend: ## Build backend for production
	@echo "$(YELLOW)Building backend...$(NC)"
	cd backend && pip install build && python -m build

build-frontend: ## Build frontend for production
	@echo "$(YELLOW)Building frontend...$(NC)"
	cd frontend && npm run build
	@echo "$(GREEN)Frontend built to frontend/dist$(NC)"

build: build-backend build-frontend ## Build both frontend and backend for production

check: lint precommit-run ## Run all checks (lint and pre-commit)

.SILENT: help
