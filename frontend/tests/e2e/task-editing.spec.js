import { test, expect } from "@playwright/test";

test.describe("Task Editing", () => {
  test("edit an existing task", async ({ page }) => {
    // Use unique names based on timestamp to avoid conflicts with previous test runs
    const timestamp = Date.now();
    const originalTaskName = `Original-Task-${timestamp}`;
    const updatedTaskName = `Updated-Task-${timestamp}`;
    const originalDescription = "Original description for e2e test";
    const updatedDescription = "Updated description for e2e test";
    const uniqueTagName = `Edit-Tag-${timestamp}`;

    // Navigate to the application
    await page.goto("/");

    // Wait for the page to load and API to be healthy
    await expect(page.getByTestId("api-status")).toHaveText("healthy", {
      timeout: 10000,
    });

    // First, create a task to edit
    await page.getByTestId("add-task-button").click();
    await expect(page.getByTestId("task-name-input")).toBeVisible();
    await page.getByTestId("task-name-input").fill(originalTaskName);
    await page.getByTestId("task-description-input").fill(originalDescription);
    await page.getByTestId("create-task-button").click();

    // Wait for the task to appear in the To Do column
    await expect(page.getByText(originalTaskName)).toBeVisible({
      timeout: 5000,
    });

    // Find the task card and hover to reveal the Edit button
    const taskCard = page.locator(`article:has-text("${originalTaskName}")`);
    await taskCard.hover();

    // Click the Edit button
    const editButton = taskCard.getByTestId(
      `edit-task-${await taskCard.getAttribute("data-testid").then((id) => id.replace("task-", ""))}`,
    );
    // Alternative approach: find the edit button within the task card
    await taskCard.locator('button:has-text("Edit")').click();

    // Wait for the edit dialog to appear with the title "Edit Task"
    await expect(page.getByText("Edit Task")).toBeVisible();

    // Verify that form fields are pre-populated with existing data
    await expect(page.getByTestId("task-name-input")).toHaveValue(
      originalTaskName,
    );
    await expect(page.getByTestId("task-description-input")).toHaveValue(
      originalDescription,
    );

    // Verify the submit button shows "Update Task" instead of "Create Task"
    await expect(page.getByTestId("update-task-button")).toBeVisible();

    // Update the task name
    await page.getByTestId("task-name-input").fill("");
    await page.getByTestId("task-name-input").fill(updatedTaskName);

    // Update the task description
    await page.getByTestId("task-description-input").fill("");
    await page.getByTestId("task-description-input").fill(updatedDescription);

    // Submit the update
    await page.getByTestId("update-task-button").click();

    // Wait for the dialog to close and the updated task to appear
    await expect(page.getByText("Edit Task")).not.toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText(updatedTaskName)).toBeVisible({
      timeout: 5000,
    });

    // Verify the task is still in the To Do column (position maintained)
    const todoColumn = page.getByTestId("column-todo");
    await expect(todoColumn.getByText(updatedTaskName)).toBeVisible();

    // Verify the updated description is visible
    await expect(
      todoColumn.getByText(updatedDescription).first(),
    ).toBeVisible();

    // Verify the original task name is no longer present
    await expect(page.getByText(originalTaskName)).not.toBeVisible();
  });

  test("cancel editing a task", async ({ page }) => {
    // Use unique names based on timestamp
    const timestamp = Date.now();
    const taskName = `Cancel-Edit-Task-${timestamp}`;
    const originalDescription = "Original description";

    // Navigate to the application
    await page.goto("/");

    // Wait for the page to load and API to be healthy
    await expect(page.getByTestId("api-status")).toHaveText("healthy", {
      timeout: 10000,
    });

    // Create a task
    await page.getByTestId("add-task-button").click();
    await expect(page.getByTestId("task-name-input")).toBeVisible();
    await page.getByTestId("task-name-input").fill(taskName);
    await page.getByTestId("task-description-input").fill(originalDescription);
    await page.getByTestId("create-task-button").click();

    // Wait for the task to appear
    await expect(page.getByText(taskName)).toBeVisible({ timeout: 5000 });

    // Open the edit dialog
    const taskCard = page.locator(`article:has-text("${taskName}")`);
    await taskCard.hover();
    await taskCard.locator('button:has-text("Edit")').click();

    // Wait for the edit dialog to appear
    await expect(page.getByText("Edit Task")).toBeVisible();

    // Modify the fields
    await page.getByTestId("task-name-input").fill("Should Not Save");
    await page.getByTestId("task-description-input").fill("Should Not Save");

    // Click Cancel
    await page.getByTestId("cancel-task-button").click();

    // Verify the dialog is closed
    await expect(page.getByText("Edit Task")).not.toBeVisible({
      timeout: 5000,
    });

    // Verify the original task name is still present (no changes were saved)
    await expect(page.getByText(taskName)).toBeVisible();
    await expect(page.getByText("Should Not Save")).not.toBeVisible();
  });

  test("edit task with tags", async ({ page }) => {
    // Use unique names based on timestamp
    const timestamp = Date.now();
    const taskName = `Tagged-Task-${timestamp}`;
    const tagName = `Original-Tag-${timestamp}`;
    const secondTagName = `Second-Tag-${timestamp}`;

    // Navigate to the application
    await page.goto("/");

    // Wait for the page to load and API to be healthy
    await expect(page.getByTestId("api-status")).toHaveText("healthy", {
      timeout: 10000,
    });

    // Create a task with a tag
    await page.getByTestId("add-task-button").click();
    await expect(page.getByTestId("task-name-input")).toBeVisible();
    await page.getByTestId("task-name-input").fill(taskName);

    // Add a tag
    await page.getByTestId("toggle-tags-button").click();
    await expect(page.getByTestId("create-new-tag-button")).toBeVisible();
    await page.getByTestId("create-new-tag-button").click();
    await expect(page.getByTestId("new-tag-name-input")).toBeVisible();
    await page.getByTestId("new-tag-name-input").fill(tagName);
    await page.getByTestId("create-tag-submit-button").click();

    // Wait for the tag to appear
    const selectedTagsArea = page
      .locator('label:has-text("Tags")')
      .locator("..");
    await expect(selectedTagsArea.getByText(tagName)).toBeVisible();

    await page.getByTestId("create-task-button").click();

    // Wait for the task to appear
    await expect(page.getByText(taskName)).toBeVisible({ timeout: 5000 });

    // Open the edit dialog
    const taskCard = page.locator(`article:has-text("${taskName}")`);
    await taskCard.hover();
    await taskCard.locator('button:has-text("Edit")').click();

    // Wait for the edit dialog to appear
    await expect(page.getByText("Edit Task")).toBeVisible();

    // Verify the tag is already selected
    const editTagsArea = page.locator('label:has-text("Tags")').locator("..");
    await expect(editTagsArea.getByText(tagName)).toBeVisible();

    // Add another tag
    await page.getByTestId("create-new-tag-button").click();
    await expect(page.getByTestId("new-tag-name-input")).toBeVisible();
    await page.getByTestId("new-tag-name-input").fill(secondTagName);
    await page.getByTestId("create-tag-submit-button").click();

    // Wait for the second tag to appear
    await expect(editTagsArea.getByText(secondTagName)).toBeVisible();

    // Submit the update
    await page.getByTestId("update-task-button").click();

    // Wait for the dialog to close
    await expect(page.getByText("Edit Task")).not.toBeVisible({
      timeout: 5000,
    });

    // Verify both tags are displayed on the task
    const todoColumn = page.getByTestId("column-todo");
    const updatedTaskCard = todoColumn.locator(
      `article:has-text("${taskName}")`,
    );
    await expect(
      updatedTaskCard.locator("span.inline-flex.items-center", {
        hasText: tagName,
      }),
    ).toBeVisible();
    await expect(
      updatedTaskCard.locator("span.inline-flex.items-center", {
        hasText: secondTagName,
      }),
    ).toBeVisible();
  });
});
