# GitHub Copilot Instructions

## Commit Message Guidelines

All commits in this repository must follow the Conventional Commits specification.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, missing semi-colons, etc.) that don't affect code meaning
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvements
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes to the build system or external dependencies (npm, pip, etc.)
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files

### Scope

The scope should indicate the area of the codebase affected:
- `backend`: Backend API changes
- `frontend`: Frontend application changes
- `db`: Database changes
- `api`: API endpoint changes

### Examples

```
feat(backend): add user authentication endpoint
fix(frontend): resolve infinite loop in item list rendering
docs: update API documentation with new endpoints
refactor(backend): simplify database connection logic
test(frontend): add unit tests for App component
build(backend): upgrade FastAPI to v0.110.0
ci: add GitHub Actions workflow for automated testing
```

### Rules

1. Use lowercase for type and scope
2. Keep the description concise (50 characters or less recommended)
3. Use imperative mood in the description ("add" not "added" or "adds")
4. Don't end the description with a period
5. Include a scope when changes are confined to a specific area
6. Add a body for complex changes that need explanation
7. Reference issues in the footer (e.g., "Closes #123")

### Breaking Changes

For breaking changes, add `!` after the type/scope or include `BREAKING CHANGE:` in the footer:

```
feat(api)!: change authentication response format

BREAKING CHANGE: The authentication endpoint now returns a different token structure
```
