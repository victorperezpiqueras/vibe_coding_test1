## Project structure

- `backend/`: Contains the FastAPI backend application, organized using Hexagonal Architecture principles. Find the docs here: [backend/README.md](/backend/README.md) and architecture guidelines here: [backend-architecture.instructions.md](/.github/backend-architecture.instructions.md).
- `frontend/`: Contains the React frontend application, organized using a feature-based structure. Find the docs here: [frontend/README.md](/frontend/README.md).
- `.github/`: Contains GitHub-specific configuration files, including workflows and instructions.

## Development workflow

1. Plan each task into clear steps.
2. Implement code changes and any required tests for the step.
3. Run unit tests for the step.
4. Run e2e tests when the change affects user flows or UI behavior.
5. Commit each step using conventional commit messages.
6. Run `make precommit-run` to run pre-commit hooks. If errors appear, fix them. If errors are related to format or poetry lock, they usually do not appear again, so it is only required to do `git add .` and retry the commit again.

## Available skills

- [conventional-commits](skills/conventional-commits/SKILL.md)
- [playwright-cli](skills/playwright-cli/SKILL.md)
- [pull-request-definition](skills/pull-request-definition/SKILL.md)
- [create-github-issue](skills/create-github-issue/SKILL.md)
