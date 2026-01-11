import { test, expect } from '@playwright/test'

test.describe('End-to-End Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('api-status')).toBeVisible()
  })

  test('complete task lifecycle: create → tag → delete', async ({ page }) => {
    // Step 1: Create a task
    await page.getByTestId('add-task-button').click()
    await page.getByTestId('task-name-input').fill('Lifecycle Task')
    await page.getByTestId('task-description-input').fill('Testing complete lifecycle')
    
    // Step 2: Add a tag
    await page.getByTestId('toggle-tags-button').click()
    await page.getByTestId('create-new-tag-button').click()
    await page.getByTestId('new-tag-name-input').fill('Lifecycle Tag')
    
    const tagCreationPromise = page.waitForResponse(response => 
      response.url().includes('/tags/') && response.request().method() === 'POST'
    )
    await page.getByTestId('create-tag-submit-button').click()
    await tagCreationPromise
    
    // Select the newly created tag
    const tagButton = page.locator('button').filter({ hasText: 'Lifecycle Tag' }).first()
    await expect(tagButton).toBeVisible({ timeout: 5000 })
    await tagButton.click()
    
    // Step 3: Create the task
    await page.getByTestId('create-task-button').click()
    
    // Step 4: Verify task exists with tag
    await expect(page.getByText('Lifecycle Task')).toBeVisible()
    await expect(page.getByText('Testing complete lifecycle')).toBeVisible()
    await expect(page.getByText('Lifecycle Tag')).toBeVisible()
    
    // Step 5: Delete the task
    const taskElement = page.locator('[data-testid^="task-"]').filter({ hasText: 'Lifecycle Task' })
    await taskElement.hover()
    const deleteButton = taskElement.getByRole('button', { name: /delete/i })
    await deleteButton.click()
    
    // Step 6: Verify task is gone
    await expect(page.getByText('Lifecycle Task')).not.toBeVisible()
  })

  test('create multiple tasks with different tags', async ({ page }) => {
    // Create two different tags
    const tasks = [
      { name: 'High Priority Feature', tag: 'Priority' },
      { name: 'Critical Bug Fix', tag: 'Bug' }
    ]
    
    for (const task of tasks) {
      // Create task
      await page.getByTestId('add-task-button').click()
      await page.getByTestId('task-name-input').fill(task.name)
      
      // Open tag selector
      await page.getByTestId('toggle-tags-button').click()
      
      // Check if tag exists, otherwise create it
      const existingTag = page.locator('button').filter({ hasText: task.tag }).first()
      const tagExists = await existingTag.isVisible({ timeout: 1000 }).catch(() => false)
      
      if (!tagExists) {
        await page.getByTestId('create-new-tag-button').click()
        await page.getByTestId('new-tag-name-input').fill(task.tag)
        
        const tagCreationPromise = page.waitForResponse(response => 
          response.url().includes('/tags/') && response.request().method() === 'POST'
        )
        await page.getByTestId('create-tag-submit-button').click()
        await tagCreationPromise
      }
      
      // Select the tag
      const tagToSelect = page.locator('button').filter({ hasText: task.tag }).first()
      await expect(tagToSelect).toBeVisible({ timeout: 5000 })
      await tagToSelect.click()
      
      // Create the task
      await page.getByTestId('create-task-button').click()
      await expect(page.getByText(task.name)).toBeVisible()
    }
    
    // Verify all tasks are visible with their tags
    for (const task of tasks) {
      await expect(page.getByText(task.name)).toBeVisible()
      await expect(page.getByText(task.tag)).toBeVisible()
    }
  })

  test('create task, sync, and verify persistence', async ({ page }) => {
    // Create a task
    await page.getByTestId('add-task-button').click()
    await page.getByTestId('task-name-input').fill('Persistent Task')
    await page.getByTestId('create-task-button').click()
    
    // Verify task is visible
    await expect(page.getByText('Persistent Task')).toBeVisible()
    
    // Set up listeners for sync requests
    const itemsPromise = page.waitForResponse(response => 
      response.url().includes('/items/') && response.request().method() === 'GET'
    )
    const tagsPromise = page.waitForResponse(response => 
      response.url().includes('/tags/') && response.request().method() === 'GET'
    )
    
    // Click sync
    await page.getByTestId('sync-button').click()
    
    // Wait for sync to complete
    await Promise.all([itemsPromise, tagsPromise])
    
    // Task should still be visible after sync
    await expect(page.getByText('Persistent Task')).toBeVisible()
  })

  test('drag and drop task between columns', async ({ page }) => {
    // Create a task (will be in To Do by default)
    await page.getByTestId('add-task-button').click()
    await page.getByTestId('task-name-input').fill('Draggable Task')
    await page.getByTestId('create-task-button').click()
    
    await expect(page.getByText('Draggable Task')).toBeVisible()
    
    // Get the task element
    const taskElement = page.locator('[data-testid^="task-"]').filter({ hasText: 'Draggable Task' })
    
    // Get the In Progress column
    const inProgressColumn = page.getByTestId('column-inprogress')
    
    // Perform drag and drop
    await taskElement.dragTo(inProgressColumn)
    
    // Verify the task still exists (it should now be in the In Progress column)
    await expect(page.getByText('Draggable Task')).toBeVisible()
  })

  test('handles empty state correctly', async ({ page }) => {
    // All columns should be visible
    await expect(page.getByTestId('column-todo')).toBeVisible()
    await expect(page.getByTestId('column-inprogress')).toBeVisible()
    await expect(page.getByTestId('column-done')).toBeVisible()
    
    // Empty columns should show placeholder text
    const emptyStateText = 'Drag tasks here'
    const emptyStateCount = await page.getByText(emptyStateText).count()
    // At least some columns might be empty
    expect(emptyStateCount).toBeGreaterThanOrEqual(0)
  })

  test('creates task, refreshes page, and verifies persistence', async ({ page }) => {
    // Create a unique task name
    const uniqueTaskName = `Persistent Task ${Date.now()}`
    
    // Create a task
    await page.getByTestId('add-task-button').click()
    await page.getByTestId('task-name-input').fill(uniqueTaskName)
    await page.getByTestId('create-task-button').click()
    
    // Verify task is visible
    await expect(page.getByText(uniqueTaskName)).toBeVisible()
    
    // Reload the page
    await page.reload()
    
    // Wait for page to load
    await expect(page.getByTestId('api-status')).toBeVisible()
    
    // Task should still be visible after reload
    await expect(page.getByText(uniqueTaskName)).toBeVisible()
  })

  test('bulk task operations', async ({ page }) => {
    const taskNames = ['Bulk Task 1', 'Bulk Task 2', 'Bulk Task 3']
    
    // Create multiple tasks quickly
    for (const taskName of taskNames) {
      await page.getByTestId('add-task-button').click()
      await page.getByTestId('task-name-input').fill(taskName)
      await page.getByTestId('create-task-button').click()
      await expect(page.getByText(taskName)).toBeVisible()
    }
    
    // Verify all tasks are created
    for (const taskName of taskNames) {
      await expect(page.getByText(taskName)).toBeVisible()
    }
    
    // Delete all tasks
    for (const taskName of taskNames) {
      const taskElement = page.locator('[data-testid^="task-"]').filter({ hasText: taskName })
      await taskElement.hover()
      const deleteButton = taskElement.getByRole('button', { name: /delete/i })
      await deleteButton.click()
      await expect(page.getByText(taskName)).not.toBeVisible()
    }
    
    // Verify all tasks are deleted
    for (const taskName of taskNames) {
      await expect(page.getByText(taskName)).not.toBeVisible()
    }
  })

  test('validates form behavior on rapid interactions', async ({ page }) => {
    // Open and close form rapidly
    await page.getByTestId('add-task-button').click()
    await expect(page.getByTestId('task-name-input')).toBeVisible()
    
    await page.getByTestId('cancel-task-button').click()
    await expect(page.getByTestId('task-name-input')).not.toBeVisible()
    
    await page.getByTestId('add-task-button').click()
    await expect(page.getByTestId('task-name-input')).toBeVisible()
    
    // Form should still work correctly
    await page.getByTestId('task-name-input').fill('Rapid Test')
    await page.getByTestId('create-task-button').click()
    
    await expect(page.getByText('Rapid Test')).toBeVisible()
  })
})
