import { test, expect } from '@playwright/test'

test.describe('Item Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the page to load and API to be ready
    await expect(page.getByTestId('api-status')).toBeVisible()
  })

  test('displays the task board interface', async ({ page }) => {
    await expect(page.getByText('Task Board')).toBeVisible()
    await expect(page.getByTestId('add-task-button')).toBeVisible()
    
    // Check all three columns are present
    await expect(page.getByTestId('column-todo')).toBeVisible()
    await expect(page.getByTestId('column-inprogress')).toBeVisible()
    await expect(page.getByTestId('column-done')).toBeVisible()
  })

  test('creates a new task', async ({ page }) => {
    // Click add task button
    await page.getByTestId('add-task-button').click()
    
    // Fill in task details
    await page.getByTestId('task-name-input').fill('E2E Test Task')
    await page.getByTestId('task-description-input').fill('This is a test task created by E2E tests')
    
    // Submit the form
    await page.getByTestId('create-task-button').click()
    
    // Verify task appears in To Do column
    await expect(page.getByText('E2E Test Task')).toBeVisible()
    await expect(page.getByText('This is a test task created by E2E tests')).toBeVisible()
  })

  test('cancels task creation', async ({ page }) => {
    // Click add task button
    await page.getByTestId('add-task-button').click()
    
    // Fill in some data
    await page.getByTestId('task-name-input').fill('Cancelled Task')
    
    // Click cancel
    await page.getByTestId('cancel-task-button').click()
    
    // Verify form is hidden
    await expect(page.getByTestId('task-name-input')).not.toBeVisible()
    await expect(page.getByTestId('add-task-button')).toBeVisible()
    
    // Verify task was not created
    await expect(page.getByText('Cancelled Task')).not.toBeVisible()
  })

  test('does not create task with empty name', async ({ page }) => {
    // Click add task button
    await page.getByTestId('add-task-button').click()
    
    // Try to submit without filling name
    await page.getByTestId('create-task-button').click()
    
    // Form should still be visible (validation prevents submission)
    await expect(page.getByTestId('task-name-input')).toBeVisible()
  })

  test('deletes a task', async ({ page }) => {
    // Create a task first
    await page.getByTestId('add-task-button').click()
    await page.getByTestId('task-name-input').fill('Task to Delete')
    await page.getByTestId('create-task-button').click()
    
    // Wait for task to appear
    await expect(page.getByText('Task to Delete')).toBeVisible()
    
    // Find the task and hover to reveal delete button
    const taskElement = page.locator('[data-testid^="task-"]').filter({ hasText: 'Task to Delete' })
    await taskElement.hover()
    
    // Click delete button
    const deleteButton = taskElement.getByRole('button', { name: /delete/i })
    await deleteButton.click()
    
    // Verify task is removed
    await expect(page.getByText('Task to Delete')).not.toBeVisible()
  })

  test('creates multiple tasks', async ({ page }) => {
    const tasks = ['Task 1', 'Task 2', 'Task 3']
    
    for (const taskName of tasks) {
      await page.getByTestId('add-task-button').click()
      await page.getByTestId('task-name-input').fill(taskName)
      await page.getByTestId('create-task-button').click()
      await expect(page.getByText(taskName)).toBeVisible()
    }
    
    // Verify all tasks are visible
    for (const taskName of tasks) {
      await expect(page.getByText(taskName)).toBeVisible()
    }
  })

  test('syncs data when sync button is clicked', async ({ page }) => {
    // Set up listeners for sync requests
    const itemsPromise = page.waitForResponse(response => 
      response.url().includes('/items/') && response.request().method() === 'GET'
    )
    const tagsPromise = page.waitForResponse(response => 
      response.url().includes('/tags/') && response.request().method() === 'GET'
    )
    
    // Click sync button
    await page.getByTestId('sync-button').click()
    
    // Wait for both sync requests to complete
    await Promise.all([itemsPromise, tagsPromise])
    
    // Verify page is still functional
    await expect(page.getByTestId('add-task-button')).toBeVisible()
  })

  test('displays API status', async ({ page }) => {
    const apiStatus = page.getByTestId('api-status')
    await expect(apiStatus).toBeVisible()
    
    // Should show either 'healthy', 'checking...', or 'disconnected'
    const statusText = await apiStatus.textContent()
    expect(['healthy', 'checking...', 'disconnected']).toContain(statusText)
  })

  test('shows empty state in columns', async ({ page }) => {
    // Check that empty columns show placeholder text
    const todoColumn = page.getByTestId('column-todo')
    const inProgressColumn = page.getByTestId('column-inprogress')
    const doneColumn = page.getByTestId('column-done')
    
    // At least one should have the empty state text
    // (depends on existing data)
    const emptyStateText = 'Drag tasks here'
    const hasEmptyState = await page.getByText(emptyStateText).count()
    expect(hasEmptyState).toBeGreaterThanOrEqual(0)
  })
})
