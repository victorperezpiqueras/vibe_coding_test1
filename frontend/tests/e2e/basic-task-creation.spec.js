import { test, expect } from '@playwright/test'

test.describe('Basic Task Creation', () => {
  test('create one task with one label in one column', async ({ page }) => {
    // Use unique names based on timestamp to avoid conflicts with previous test runs
    const timestamp = Date.now()
    const uniqueTaskName = `Test-Task-${timestamp}`
    const uniqueTagName = `E2E-Tag-${timestamp}`

    // Navigate to the application
    await page.goto('/')

    // Wait for the page to load and API to be healthy
    await expect(page.getByTestId('api-status')).toHaveText('healthy', { timeout: 10000 })

    // Click the "Add new task" button
    await page.getByTestId('add-task-button').click()

    // Wait for the form to appear
    await expect(page.getByTestId('task-name-input')).toBeVisible()

    // Fill in the task name
    await page.getByTestId('task-name-input').fill(uniqueTaskName)

    // Fill in the task description
    await page.getByTestId('task-description-input').fill('This is a test task created by e2e test')

    // Click "Add tags" button to open the tag selector
    await page.getByTestId('toggle-tags-button').click()

    // Wait for the tag section to be visible
    await expect(page.getByTestId('create-new-tag-button')).toBeVisible()

    // Click "Create new tag" button
    await page.getByTestId('create-new-tag-button').click()

    // Wait for tag creation form to appear
    await expect(page.getByTestId('new-tag-name-input')).toBeVisible()

    // Fill in tag name
    await page.getByTestId('new-tag-name-input').fill(uniqueTagName)

    // Click the create tag submit button
    await page.getByTestId('create-tag-submit-button').click()

    // Wait for the tag to be automatically selected and appear in the selected tags area
    // The tag should now be visible in the selected tags section (not in the unselected list)
    const selectedTagsArea = page.locator('label:has-text("Tags")').locator('..')
    await expect(selectedTagsArea.getByText(uniqueTagName)).toBeVisible()

    // Submit the task creation form
    await page.getByTestId('create-task-button').click()

    // Wait for the task to appear in the To Do column
    await expect(page.getByText(uniqueTaskName)).toBeVisible({ timeout: 5000 })

    // Verify the task is in the To Do column
    const todoColumn = page.getByTestId('column-todo')
    await expect(todoColumn.getByText(uniqueTaskName)).toBeVisible()

    // Verify the tag is displayed on the task - use a more specific selector for the tag element
    await expect(todoColumn.locator('span.inline-flex.items-center', { hasText: uniqueTagName })).toBeVisible()

    // Verify the task description is visible
    await expect(todoColumn.getByText('This is a test task created by e2e test').first()).toBeVisible()

    // Verify the column counter shows at least 1 item
    // (could be more if test ran multiple times without database cleanup)
    const columnHeader = todoColumn.locator('div').filter({ hasText: 'To Do' }).first()
    await expect(columnHeader).toContainText(/[1-9]\d*/)
  })
})
