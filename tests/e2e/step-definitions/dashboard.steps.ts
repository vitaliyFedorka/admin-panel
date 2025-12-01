import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'
import { DataTable } from '@cucumber/cucumber'

const { Given, When, Then } = createBdd()

When('I navigate to the dashboard', async ({ page }) => {
  await page.goto('/dashboard')
  await page.waitForLoadState('domcontentloaded')
  // Wait for dashboard content to load
  await page.waitForSelector('[data-testid="dashboard-title"]', { timeout: 15000 })
  // Wait for loading to complete if present
  const loadingExists = await page.locator('[data-testid="loading-dashboard"]').count() > 0
  if (loadingExists) {
    await page.waitForSelector('[data-testid="loading-dashboard"]', { state: 'hidden', timeout: 20000 })
  }
})

Then('I should see the dashboard page', async ({ page }) => {
  await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible({ timeout: 10000 })
})

Then('I should see statistics cards for:', async ({ page }, dataTable: DataTable) => {
  const rows = dataTable.raw()
  const cardMap: Record<string, string> = {
    'Users': '[data-testid="users-stat-card"]',
    'Posts': '[data-testid="posts-stat-card"]',
    'Todos': '[data-testid="todos-stat-card"]',
  }
  
  for (const row of rows) {
    const cardName = row[0]
    const testId = cardMap[cardName]
    if (testId) {
      await expect(page.locator(testId)).toBeVisible({ timeout: 10000 })
    } else {
      await expect(page.locator(`text=${cardName}`).first()).toBeVisible({ timeout: 10000 })
    }
  }
})

Then('I should see {string} chart', async ({ page }, chartName: string) => {
  const chartMap: Record<string, string> = {
    'Posts per User': '[data-testid="posts-per-user-chart"]',
    'Todos Completion Status': '[data-testid="todos-completion-chart"]',
    'Todos Status by User': '[data-testid="todos-status-by-user-chart"]',
    'Posts Distribution by User': '[data-testid="posts-distribution-chart"]',
  }
  
  const testId = chartMap[chartName]
  if (testId) {
    await expect(page.locator(testId)).toBeVisible({ timeout: 10000 })
  } else {
    await expect(page.locator(`h2:has-text("${chartName}")`)).toBeVisible({ timeout: 10000 })
  }
})

Given('I am on the users page', async ({ page }) => {
  await page.goto('/users')
  await page.waitForLoadState('domcontentloaded')
  
  // Check if redirected to login
  const currentUrl = page.url()
  if (currentUrl.includes('/login')) {
    await page.waitForTimeout(1000)
    await page.goto('/users')
    await page.waitForLoadState('domcontentloaded')
  }
  
  // Wait for table to load
  await page.waitForSelector('[data-testid="users-table"]', { timeout: 20000 })
  try {
    await page.waitForSelector('[data-testid="loading-users"]', { state: 'hidden', timeout: 5000 })
  } catch {
    // No loading indicator
  }
})

Given('I see the total number of users', async ({ page }) => {
  // This step is called when on users page - wait for table to be visible
  // Ensure we're on the users page
  if (!page.url().includes('/users')) {
    await page.goto('/users', { waitUntil: 'networkidle' })
  }
  
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(500)
  
  // Check if redirected to login
  const currentUrl = page.url()
  if (currentUrl.includes('/login')) {
    await page.waitForTimeout(1000)
    await page.goto('/users', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
  }
  
  // Check if loading indicator exists (without throwing error if it doesn't)
  const loadingVisible = await page.locator('[data-testid="loading-users"]').isVisible().catch(() => false)
  
  // If loading indicator exists, wait for it to disappear
  if (loadingVisible) {
    await page.waitForSelector('[data-testid="loading-users"]', { state: 'hidden', timeout: 20000 })
  }
  
  // Final wait for table and rows
  await page.waitForSelector('[data-testid="users-table"]', { timeout: 20000 })
  await page.waitForSelector('[data-testid="users-table"] tbody tr', { timeout: 20000 })
})

Then('the user count on dashboard should match the users page count', async ({ page }) => {
  // Get count from users page
  await page.goto('/users', { waitUntil: 'networkidle' })
  await page.waitForLoadState('domcontentloaded')
  
  // Wait for table to be visible
  await page.waitForSelector('[data-testid="users-table"]', { timeout: 20000 })
  // Wait for loading to complete
  const loadingExists = await page.locator('[data-testid="loading-users"]').count() > 0
  if (loadingExists) {
    await page.waitForSelector('[data-testid="loading-users"]', { state: 'hidden', timeout: 20000 })
  }
  
  // Wait for at least one row to be present
  await page.waitForSelector('[data-testid="users-table"] tbody tr', { timeout: 20000 })
  const usersCount = await page.locator('[data-testid="users-table"] tbody tr').count()
  
  // Navigate to dashboard and check count
  await page.goto('/dashboard', { waitUntil: 'networkidle' })
  await page.waitForLoadState('domcontentloaded')
  
  // Wait for dashboard to load
  await page.waitForSelector('[data-testid="dashboard-title"]', { timeout: 15000 })
  // Wait for loading to complete if present
  const dashboardLoading = await page.locator('[data-testid="loading-dashboard"]').count() > 0
  if (dashboardLoading) {
    await page.waitForSelector('[data-testid="loading-dashboard"]', { state: 'hidden', timeout: 20000 })
  }
  
  // Find the Users stat card and check the count
  await page.waitForSelector('[data-testid="users-stat-card"]', { timeout: 15000 })
  const dashboardCountElement = page.locator('[data-testid="users-count"]')
  await expect(dashboardCountElement).toBeVisible({ timeout: 10000 })
  const dashboardCountText = await dashboardCountElement.textContent()
  const count = parseInt(dashboardCountText?.trim() || '0')
  
  expect(count).toBe(usersCount)
})
