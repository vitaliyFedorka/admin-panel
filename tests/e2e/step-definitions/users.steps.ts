import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'
import { DataTable } from '@cucumber/cucumber'

const { Given, When, Then } = createBdd()

Given('I navigate to the users page', async ({ page }) => {
  // Ensure auth state is ready in localStorage before navigating
  let authReady = false
  for (let i = 0; i < 20; i++) {
    authReady = await page.evaluate(() => {
      try {
        const auth = localStorage.getItem('auth-storage')
        if (auth) {
          const parsed = JSON.parse(auth)
          return parsed.state?.isAuthenticated === true
        }
      } catch {
        return false
      }
      return false
    })
    if (authReady) break
    await page.waitForTimeout(500)
  }
  
  if (!authReady) {
    throw new Error('Auth state not ready in localStorage before navigation')
  }
  
  // Navigate to users page
  await page.goto('/users', { waitUntil: 'networkidle' })
  await page.waitForLoadState('domcontentloaded')
  
  // Wait for React hydration - give extra time for Zustand to hydrate
  await page.waitForTimeout(5000)
  
  // Verify we're still on users page (not redirected to login)
  const url = page.url()
  if (url.includes('/login')) {
    throw new Error('Redirected to login - authentication failed')
  }
  
  // Wait for sidebar to appear (confirms Layout rendered)
  await page.waitForSelector('[data-testid="logout-button"]', { timeout: 20000 })
  
  // Wait for main content area
  await page.waitForSelector('main', { timeout: 20000 })
  
  // Wait for users page header - this confirms the page content is rendering
  await page.waitForSelector('h1:has-text("Users")', { timeout: 30000 })
  // Wait for the table to appear
  await page.waitForSelector('[data-testid="users-table"]', { timeout: 30000 })
  
  // Verify add button is present
  await page.waitForSelector('[data-testid="add-user-button"]', { timeout: 10000 })
  
  // Wait for table rows to be present (at least one)
  await page.waitForSelector('[data-testid="users-table"] tbody tr', { timeout: 15000 })
  
  await page.waitForTimeout(1000)
})

Then('I should see a table with users', async ({ page }) => {
  // Wait for table to be visible
  await page.waitForSelector('[data-testid="users-table"]', { timeout: 20000 })
  await expect(page.locator('[data-testid="users-table"]')).toBeVisible({ timeout: 10000 })
  // Wait for at least one row
  await page.waitForSelector('[data-testid="users-table"] tbody tr', { timeout: 20000 })
  const rows = page.locator('[data-testid="users-table"] tbody tr')
  await expect(rows.first()).toBeVisible({ timeout: 10000 })
})

Then('I should see at least one user in the table', async ({ page }) => {
  const rows = page.locator('[data-testid="users-table"] tbody tr')
  const count = await rows.count()
  expect(count).toBeGreaterThan(0)
})

When('I click the {string} button', async ({ page }, buttonText: string) => {
  // Map button text to test IDs
  const buttonMap: Record<string, string> = {
    'Add User': '[data-testid="add-user-button"]',
    'Edit': '[data-testid^="edit-user-"]',
    'Delete': '[data-testid^="delete-user-"]',
  }
  
  const testId = buttonMap[buttonText]
  if (testId) {
    const button = page.locator(testId).first()
    await expect(button).toBeVisible({ timeout: 15000 })
    await expect(button).toBeEnabled({ timeout: 5000 })
    await button.click()
  } else {
    // Fallback to text-based selector
    const button = page.locator(`button:has-text("${buttonText}")`).first()
    await expect(button).toBeVisible({ timeout: 15000 })
    await button.click()
  }
  await page.waitForTimeout(500)
})

When('I fill in the user form with:', async ({ page }, dataTable: DataTable) => {
  const rows = dataTable.hashes()
  for (const row of rows) {
    const field = row.field.toLowerCase()
    const value = row.value
    
    const fieldMap: Record<string, string> = {
      'name': '[data-testid="user-name-input"]',
      'username': '[data-testid="user-username-input"]',
      'email': '[data-testid="user-email-input"]',
      'phone': '[data-testid="user-phone-input"]',
      'website': '[data-testid="user-website-input"]',
    }
    
    const testId = fieldMap[field]
    if (testId) {
      await page.fill(testId, value)
    }
  }
})

When('I submit the form', async ({ page }) => {
  // Wait for submit button to be enabled
  await page.waitForSelector('[data-testid="user-form-submit"]', { state: 'visible', timeout: 5000 })
  
  // Set up handler for any alert dialogs (in case of errors)
  page.once('dialog', async (dialog: any) => {
    await dialog.accept()
  })
  
  // Click submit
  await page.click('[data-testid="user-form-submit"]')
  
  // Wait for modal to close (form submission completed)
  await page.waitForSelector('[data-testid="user-modal"]', { state: 'hidden', timeout: 15000 })
  
  // Wait for table to update - give React time to re-render
  await page.waitForTimeout(2000)
  
  // Ensure table is still visible and ready
  await page.waitForSelector('[data-testid="users-table"]', { timeout: 10000 })
  await page.waitForSelector('[data-testid="users-table"] tbody tr', { timeout: 10000 })
})

Then('I should see {string} in the users table', async ({ page }, text: string) => {
  // Wait for table to be ready
  await page.waitForSelector('[data-testid="users-table"]', { timeout: 10000 })
  // Wait for table rows to be present
  await page.waitForSelector('[data-testid="users-table"] tbody tr', { timeout: 10000 })
  // Wait a moment for any updates to render
  await page.waitForTimeout(2000)
  
  // Wait for the text to appear in the table - try multiple approaches
  const tableBody = page.locator('[data-testid="users-table"] tbody')
  
  // First try to find it in the table body
  try {
    await expect(tableBody.locator(`text=${text}`).first()).toBeVisible({ timeout: 15000 })
  } catch {
    // If not found in tbody, try the whole table
    await expect(page.locator('[data-testid="users-table"]').locator(`text=${text}`).first()).toBeVisible({ timeout: 15000 })
  }
})

Then('the modal should be closed', async ({ page }) => {
  // Wait for modal to disappear - give it time to close
  await page.waitForTimeout(1000)
  // Wait for modal to be hidden
  await page.waitForSelector('[data-testid="user-modal"]', { state: 'hidden', timeout: 5000 }).catch(() => {
    // If modal selector doesn't exist at all, that's also fine
  })
  // Verify it's not visible
  const modalVisible = await page.locator('[data-testid="user-modal"]').isVisible().catch(() => false)
  if (modalVisible) {
    throw new Error('Modal is still visible after form submission')
  }
})

Given('there is a user {string} in the table', async ({ page }, userName: string) => {
  await page.goto('/users', { waitUntil: 'networkidle' })
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(500)

  await page.waitForSelector('[data-testid="users-table"]', { timeout: 20000 })
  await page.waitForSelector('[data-testid="users-table"] tbody tr', { timeout: 10000 })
  
  const userExists = await page.locator(`text=${userName}`).count() > 0
  if (!userExists) {
    // Create the user if it doesn't exist
    await page.waitForSelector('[data-testid="add-user-button"]', { timeout: 10000 })
    await page.click('[data-testid="add-user-button"]')
    await page.waitForSelector('[data-testid="user-name-input"]', { timeout: 5000 })
    await page.fill('[data-testid="user-name-input"]', userName)
    await page.fill('[data-testid="user-username-input"]', userName.toLowerCase().replace(' ', ''))
    await page.fill('[data-testid="user-email-input"]', `${userName.toLowerCase().replace(' ', '')}@example.com`)
    await page.click('[data-testid="user-form-submit"]')
    await page.waitForTimeout(2000)
    // Wait for the new user to appear in the table
    await page.waitForSelector(`text=${userName}`, { timeout: 10000 })
  }
})

When('I click the {string} button for {string}', async ({ page }, buttonText: string, userName: string) => {
  // Wait for table to be ready
  await page.waitForSelector('[data-testid="users-table"]', { timeout: 10000 })
  // Find the row containing the user name
  const row = page.locator('[data-testid="users-table"]').locator(`tbody tr:has-text("${userName}")`)
  await expect(row).toBeVisible({ timeout: 10000 })
  
  if (buttonText === 'Edit') {
    const editButton = row.locator('[data-testid^="edit-user-"]')
    await expect(editButton).toBeVisible({ timeout: 5000 })
    await editButton.click()
    // Wait for modal to open
    await page.waitForSelector('[data-testid="user-modal"]', { timeout: 5000 })
  } else if (buttonText === 'Delete') {
    // Set up dialog handler BEFORE clicking delete
    page.once('dialog', async (dialog: any) => {
      await dialog.accept()
    })
    
    const deleteButton = row.locator('[data-testid^="delete-user-"]')
    await expect(deleteButton).toBeVisible({ timeout: 5000 })
    await deleteButton.click()
    // Wait a moment for the dialog to appear and be handled
    await page.waitForTimeout(1000)
  } else {
    await row.locator(`button:has-text("${buttonText}")`).click()
  }
  await page.waitForTimeout(500)
})

When('I change the name to {string}', async ({ page }, newName: string) => {
  await page.fill('[data-testid="user-name-input"]', newName)
})

Then('I should not see {string} in the users table', async ({ page }, text: string) => {
  // Wait for table to update after deletion/edit
  await page.waitForTimeout(2000)
  // Wait for table to be ready
  await page.waitForSelector('[data-testid="users-table"]', { timeout: 10000 })
  // Check within the table specifically - wait for the text to disappear
  const tableBody = page.locator('[data-testid="users-table"] tbody')
  await expect(tableBody.locator(`text=${text}`)).not.toBeVisible({ timeout: 10000 })
})

When('I confirm the deletion', async ({ page }) => {
  // The dialog should have been handled when the delete button was clicked
  // Just wait for the deletion to process and table to update
  await page.waitForTimeout(2000)
  
  // Ensure table is still visible and updated
  await page.waitForSelector('[data-testid="users-table"]', { timeout: 10000 })
  await page.waitForSelector('[data-testid="users-table"] tbody tr', { timeout: 10000 })
})

When('I click on the {string} column header', async ({ page }, columnName: string) => {
  if (columnName === 'Name') {
    await page.waitForSelector('[data-testid="name-column-header"]', { timeout: 10000 })
    await page.click('[data-testid="name-column-header"]')
  } else {
    await page.click(`th:has-text("${columnName}")`)
  }
  await page.waitForTimeout(500)
})

When('I click on the {string} column header again', async ({ page }, columnName: string) => {
  if (columnName === 'Name') {
    await page.waitForSelector('[data-testid="name-column-header"]', { timeout: 10000 })
    await page.click('[data-testid="name-column-header"]')
  } else {
    await page.click(`th:has-text("${columnName}")`)
  }
  await page.waitForTimeout(500)
})

Then('the users should be sorted by name in ascending order', async ({ page }) => {
  const names = await page.locator('[data-testid="users-table"] tbody tr td:nth-child(2)').allTextContents()
  const sorted = [...names].sort()
  expect(names).toEqual(sorted)
})

Then('the users should be sorted by name in descending order', async ({ page }) => {
  const names = await page.locator('[data-testid="users-table"] tbody tr td:nth-child(2)').allTextContents()
  const sorted = [...names].sort().reverse()
  expect(names).toEqual(sorted)
})
