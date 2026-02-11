# E2E Tests

This directory contains end-to-end (E2E) tests for the frontend application using **Playwright**.

## Test Structure

```
tests/
└── e2e/
    └── example.spec.js          # E2E test template (commented)
```

## Prerequisites

Before running E2E tests, ensure:

1. **Backend is running** on `http://localhost:8000`
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Playwright browsers are installed**
   ```bash
   cd frontend
   npx playwright install
   ```

## Running Tests

### Run E2E tests in CI mode (using Make)
```bash
# From the repository root
make test-e2e-ci
```
This command runs E2E tests using Chromium only, which is the configuration used in CI/CD pipelines.

### Run all E2E tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test tests/e2e/basic-task-creation.spec.js
```

### Run tests on specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### View test report
```bash
npm run test:e2e:report
```

## Test Coverage

### E2E Tests

- **basic-task-creation.spec.js**: Tests the core functionality of creating a task with a label in a column. This test verifies:
  - Creating a new task with name and description
  - Creating a new tag/label
  - Associating the tag with the task
  - Verifying the task appears in the To Do column
  - Verifying the tag is displayed on the task

## Test Configuration

Tests are configured in `playwright.config.js`:

- **Base URL**: `http://localhost:5173`
- **Browsers**: Chromium, Firefox, WebKit
- **Retries**: 2 on CI, 0 locally
- **Workers**: 1 on CI, unlimited locally
- **Screenshots**: On failure
- **Videos**: On first retry
- **Traces**: On first retry

## CI/CD Integration

The Playwright tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm ci

- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Start backend
  run: |
    cd backend
    uvicorn app.main:app --host 0.0.0.0 --port 8000 &

- name: Run Playwright tests
  run: npm run test:e2e

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## Test Data Management

- Tests create and clean up their own data
- Each test is independent and can run in parallel
- LocalStorage is used for task status persistence
- Backend API provides data persistence

## Debugging Tests

### Visual debugging
```bash
npm run test:e2e:ui
```

### Step-through debugging
```bash
npm run test:e2e:debug
```

### Run headed (see browser)
```bash
npx playwright test --headed
```

### Slow down execution
```bash
npx playwright test --slow-mo=1000
```

## Common Issues

### Backend not running
Ensure the backend is running on port 8000 before running tests.

### Port conflicts
If port 5173 is in use, stop other Vite dev servers or change the port in `playwright.config.js`.

### Browser installation issues
Run `npx playwright install --with-deps` to install all required browsers and dependencies.

### Test timeouts
Increase timeout in individual tests if needed:
```javascript
test('slow test', async ({ page }) => {
  test.setTimeout(60000) // 60 seconds
  // ... test code
})
```

## Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Wait for elements** before interacting with them
3. **Clean up test data** after each test if possible
4. **Keep tests independent** - don't rely on execution order
5. **Use descriptive test names** that explain what is being tested
6. **Handle timing issues** with proper waits, not fixed timeouts

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
- [CI/CD Setup](https://playwright.dev/docs/ci)
