---
applyTo: "**/*.py"
---

# Python 3.13 Coding Guidelines

This project uses **Python 3.13**. All Python code should follow these guidelines.

## Type Annotations

### Modern Union Syntax

Use the pipe `|` operator for union types (PEP 604), available in Python 3.10+:

```python
# ✅ Correct - Modern union syntax
def get_item(item_id: int) -> Item | None:
    pass

def process_data(value: str | int | float) -> dict[str, Any]:
    pass

# ❌ Avoid - Old Union syntax
from typing import Union, Optional

def get_item(item_id: int) -> Optional[Item]:  # Use | None instead
    pass

def process_data(value: Union[str, int, float]) -> dict:  # Use | instead
    pass
```

### Built-in Generic Types

Use built-in generic types directly (PEP 585), available in Python 3.9+:

```python
# ✅ Correct - Built-in generics
def get_items() -> list[Item]:
    pass

def get_mapping() -> dict[str, int]:
    pass

def get_unique_ids() -> set[int]:
    pass

# ❌ Avoid - typing module generics
from typing import List, Dict, Set

def get_items() -> List[Item]:  # Use list[Item] instead
    pass

def get_mapping() -> Dict[str, int]:  # Use dict[str, int] instead
    pass
```

### Type Aliases

Use the `type` keyword for type aliases (PEP 695):

```python
# ✅ Correct - Modern type alias
type UserId = int
type UserData = dict[str, str | int]

# ❌ Avoid - Old style type alias
from typing import TypeAlias

UserId: TypeAlias = int  # Use type keyword instead
```

### Common Patterns

```python
# Optional values - use | None
def find_user(user_id: int) -> User | None:
    pass

# Multiple types - use | operator
def format_value(value: str | int | float) -> str:
    pass

# Collections with types
def get_user_names() -> list[str]:
    pass

def get_user_map() -> dict[int, User]:
    pass

# Async functions
async def fetch_data(url: str) -> dict[str, Any]:
    pass

# Class methods with proper typing
class ItemRepository:
    async def get_by_id(self, item_id: int) -> Item | None:
        pass
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> list[Item]:
        pass
```

## Import Guidelines

### Typing Imports

Minimize imports from the `typing` module. Use built-in types when possible:

```python
# ✅ Correct - Minimal typing imports
from typing import Any  # Only when needed
from collections.abc import Callable, Iterable

# ❌ Avoid - Unnecessary typing imports
from typing import List, Dict, Optional, Union  # Use built-ins instead
```

### Import Order

Follow isort conventions (configured in pyproject.toml):

1. Standard library imports
2. Third-party imports
3. Local application imports

```python
# Standard library
from datetime import datetime
from collections.abc import Callable

# Third-party
from fastapi import APIRouter, Depends
from pydantic import BaseModel

# Local application
from app.items.domain.entities.item import Item
from app.items.domain.interfaces.item_repository import ItemRepository
```

## Code Style

### General Rules

- **Line length**: Maximum 100 characters (configured in pyproject.toml)
- **Indentation**: 4 spaces
- **Quotes**: Use double quotes for strings
- **Trailing commas**: Use in multi-line structures

### Docstrings

Use concise docstrings for classes and complex functions:

```python
class ItemRepository:
    """Repository interface for Item entities"""
    
    async def get_by_id(self, item_id: int) -> Item | None:
        """Get an item by ID"""
        pass
```

### Function Definitions

```python
# Simple function
def calculate_total(items: list[Item]) -> float:
    return sum(item.price for item in items)

# Function with default arguments
def get_items(
    skip: int = 0,
    limit: int = 100,
    filter_tags: list[str] | None = None,
) -> list[Item]:
    pass
```

### Class Definitions

```python
class Item:
    """Domain entity representing an Item"""
    
    def __init__(
        self,
        name: str,
        description: str | None = None,
        id: int | None = None,
    ):
        self.id = id
        self.name = name
        self.description = description
```

## Async/Await Patterns

Use async/await for I/O operations:

```python
# Repository methods
class ItemRepository:
    async def get_all(self, skip: int = 0, limit: int = 100) -> list[Item]:
        # Database query
        pass
    
    async def create(self, item: Item) -> Item:
        # Database insert
        pass

# Use cases
class GetItemUseCase:
    async def execute(self, item_id: int) -> Item | None:
        return await self.repository.get_by_id(item_id)
```

## Error Handling

Prefer specific exceptions and type-safe error handling:

```python
# ✅ Correct
async def get_item(item_id: int) -> Item | None:
    try:
        return await repository.get_by_id(item_id)
    except ItemNotFoundError:
        return None
    except DatabaseError as e:
        logger.error(f"Database error: {e}")
        raise

# ❌ Avoid - Bare except
async def get_item(item_id: int) -> Item | None:
    try:
        return await repository.get_by_id(item_id)
    except:  # Don't use bare except
        return None
```

## FastAPI Specific

### Route Definitions

```python
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter()

@router.get("/items/{item_id}")
async def get_item(
    item_id: int,
    use_case: GetItemUseCase = Depends(),
) -> ItemDTO:
    item = await use_case.execute(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item
```

### Pydantic Models

```python
from pydantic import BaseModel, Field

class ItemCreateDTO(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = None
    tag_ids: list[int] = []

class ItemDTO(BaseModel):
    id: int
    name: str
    description: str | None
    created_at: datetime
    updated_at: datetime
```

## Tools and Linting

This project uses:

- **Ruff**: Fast Python linter and formatter (replaces Black, isort, flake8)
- **Configuration**: See `pyproject.toml` for ruff settings

Run linting:

```bash
make lint-backend-ruff      # Lint with ruff
make format-backend-check   # Check formatting
make format-backend         # Auto-format code
```
