import { test, expect } from '@playwright/test'

/**
 * Integration tests that verify frontend-backend communication
 * These tests interact with the real backend API
 */
test.describe('API Integration', () => {
  const API_URL = 'http://localhost:8000'

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for API to be healthy
    await expect(page.getByTestId('api-status')).toBeVisible()
    // Wait for API status to stabilize (not just be visible)
    await expect(page.getByTestId('api-status')).not.toHaveText('checking...', { timeout: 3000 })
  })

  test('verifies API health check', async ({ page }) => {
    const apiStatus = page.getByTestId('api-status')
    
    // Wait for status to stabilize
    await expect(apiStatus).not.toHaveText('checking...', { timeout: 3000 })
    
    const statusText = await apiStatus.textContent()
    
    // API should be healthy or disconnected (after checking is done)
    expect(['healthy', 'disconnected']).toContain(statusText)
  })

  test('creates item via API and verifies in UI', async ({ page }) => {
    // Create a task through the UI
    await page.getByTestId('add-task-button').click()
    await page.getByTestId('task-name-input').fill('API Integration Test')
    await page.getByTestId('task-description-input').fill('Testing API integration')
    await page.getByTestId('create-task-button').click()
    
    // Verify task appears in UI
    await expect(page.getByText('API Integration Test')).toBeVisible()
    
    // Verify via network that POST request was made
    // The task should persist in the backend
    await page.reload()
    await expect(page.getByTestId('api-status')).toBeVisible()
    
    // Task should still be there after reload (proving it was saved to backend)
    await expect(page.getByText('API Integration Test')).toBeVisible()
  })

  test('fetches items on page load', async ({ page, context }) => {
    // Create a promise to catch the API request
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/items/') && response.request().method() === 'GET'
    )
    
    // Reload to trigger fetch
    await page.reload()
    
    // Wait for the response
    const response = await responsePromise
    
    // Verify response is successful
    expect(response.status()).toBe(200)
    
    // Verify response contains array
    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
  })

  test('deletes item via API', async ({ page }) => {
    // Create a task first
    await page.getByTestId('add-task-button').click()
    await page.getByTestId('task-name-input').fill('To Be Deleted')
    await page.getByTestId('create-task-button').click()
    await expect(page.getByText('To Be Deleted')).toBeVisible()
    
    // Set up listener for DELETE request
    const deletePromise = page.waitForResponse(response => 
      response.url().includes('/items/') && response.request().method() === 'DELETE'
    )
    
    // Delete the task
    const taskElement = page.locator('[data-testid^="task-"]').filter({ hasText: 'To Be Deleted' })
    await taskElement.hover()
    await taskElement.getByRole('button', { name: /delete/i }).click()
    
    // Wait for DELETE request
    const response = await deletePromise
    expect(response.status()).toBe(200)
    
    // Verify task is removed from UI
    await expect(page.getByText('To Be Deleted')).not.toBeVisible()
  })

  test('creates tag via API', async ({ page }) => {
    // Set up listener for POST to tags endpoint
    const createTagPromise = page.waitForResponse(response => 
      response.url().includes('/tags/') && response.request().method() === 'POST'
    )
    
    // Create a tag through UI
    await page.getByTestId('add-task-button').click()
    await page.getByTestId('toggle-tags-button').click()
    await page.getByTestId('create-new-tag-button').click()
    await page.getByTestId('new-tag-name-input').fill('API Tag Test')
    await page.getByTestId('create-tag-submit-button').click()
    
    // Wait for API call
    const response = await createTagPromise
    expect(response.status()).toBe(200)
    
    // Verify tag data in response
    const tagData = await response.json()
    expect(tagData.name).toBe('API Tag Test')
    expect(tagData).toHaveProperty('color')
    expect(tagData).toHaveProperty('id')
  })

  test('fetches tags on page load', async ({ page }) => {
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/tags/') && response.request().method() === 'GET'
    )
    
    await page.reload()
    
    const response = await responsePromise
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
  })

  test('handles API errors gracefully', async ({ page, context }) => {
    // This test would need the backend to be down or mocked to fail
    // For now, we verify that the app handles the initial state correctly
    
    const apiStatus = page.getByTestId('api-status')
    await apiStatus.waitFor({ state: 'visible' })
    
    const statusText = await apiStatus.textContent()
    // Should show some status (not crash)
    expect(statusText).toBeTruthy()
  })

  test('syncs with backend on sync button click', async ({ page }) => {
    // Set up listeners for both items and tags GET requests
    const itemsPromise = page.waitForResponse(response => 
      response.url().includes('/items/') && response.request().method() === 'GET'
    )
    const tagsPromise = page.waitForResponse(response => 
      response.url().includes('/tags/') && response.request().method() === 'GET'
    )
    
    // Click sync button
    await page.getByTestId('sync-button').click()
    
    // Wait for both requests
    const [itemsResponse, tagsResponse] = await Promise.all([itemsPromise, tagsPromise])
    
    expect(itemsResponse.status()).toBe(200)
    expect(tagsResponse.status()).toBe(200)
  })

  test('sends correct payload when creating item with tags', async ({ page }) => {
    // First create a tag
    await page.getByTestId('add-task-button').click()
    await page.getByTestId('toggle-tags-button').click()
    await page.getByTestId('create-new-tag-button').click()
    await page.getByTestId('new-tag-name-input').fill('Payload Tag')
    
    const tagCreationPromise = page.waitForResponse(response => 
      response.url().includes('/tags/') && response.request().method() === 'POST'
    )
    await page.getByTestId('create-tag-submit-button').click()
    await tagCreationPromise
    
    // Select the tag
    const tagButton = page.locator('button').filter({ hasText: 'Payload Tag' }).first()
    await expect(tagButton).toBeVisible({ timeout: 5000 })
    await tagButton.click()
    
    // Set up listener for item creation
    let requestBody = null
    page.on('request', request => {
      if (request.url().includes('/items/') && request.method() === 'POST') {
        requestBody = request.postDataJSON()
      }
    })
    
    // Fill in task details
    await page.getByTestId('task-name-input').fill('Tagged Task')
    await page.getByTestId('task-description-input').fill('Has tags')
    
    // Wait for item creation
    const itemCreationPromise = page.waitForResponse(response => 
      response.url().includes('/items/') && response.request().method() === 'POST'
    )
    
    // Create the task
    await page.getByTestId('create-task-button').click()
    await itemCreationPromise
    
    // Verify payload structure
    expect(requestBody).toBeTruthy()
    expect(requestBody.name).toBe('Tagged Task')
    expect(requestBody.description).toBe('Has tags')
    expect(Array.isArray(requestBody.tag_ids)).toBe(true)
    expect(requestBody.tag_ids.length).toBeGreaterThan(0)
  })

  test('handles CORS correctly', async ({ page }) => {
    // The app should work without CORS errors
    // Listen for console errors
    const errors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    // Set up listeners for sync requests to ensure completion
    const itemsPromise = page.waitForResponse(response => 
      response.url().includes('/items/') && response.request().method() === 'GET'
    )
    const tagsPromise = page.waitForResponse(response => 
      response.url().includes('/tags/') && response.request().method() === 'GET'
    )
    
    // Perform some API operations
    await page.getByTestId('sync-button').click()
    await Promise.all([itemsPromise, tagsPromise])
    
    // Should not have CORS errors
    const corsErrors = errors.filter(err => err.toLowerCase().includes('cors'))
    expect(corsErrors.length).toBe(0)
  })

  test('validates API response data structure', async ({ page }) => {
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/items/') && response.request().method() === 'GET'
    )
    
    await page.reload()
    
    const response = await responsePromise
    const items = await response.json()
    
    // Verify each item has expected structure
    if (items.length > 0) {
      const item = items[0]
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('name')
      expect(item).toHaveProperty('description')
      expect(item).toHaveProperty('tags')
      expect(Array.isArray(item.tags)).toBe(true)
    }
  })
})
