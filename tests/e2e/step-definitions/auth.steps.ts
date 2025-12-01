import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { Given, When, Then } = createBdd()

Given('I am on the login page', async ({ page }) => {
  await page.goto('/login')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForSelector('[data-testid="email-input"]', { timeout: 10000 })
})

Given('I am logged in as {string}', async ({ page }, email: string) => {
  // Clear cookies and localStorage to ensure fresh state
  await page.context().clearCookies()
  await page.goto('/login')
  await page.evaluate(() => {
    localStorage.removeItem('auth-storage')
    // Don't clear users-storage - let it load from API if needed
  })
  
  await page.waitForLoadState('domcontentloaded')
  await page.waitForSelector('[data-testid="email-input"]', { timeout: 15000 })
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', 'password123')
  
  // Wait for navigation after clicking submit
  await Promise.all([
    page.waitForURL('**/dashboard', { timeout: 15000 }),
    page.click('[data-testid="login-button"]'),
  ])
  
  // Ensure we're on dashboard and wait for it to be ready
  await page.waitForLoadState('domcontentloaded')
  await page.waitForSelector('[data-testid="dashboard-title"]', { timeout: 10000 })
  
  // Verify auth state is persisted by checking localStorage - wait for it to be set
  let authState = null
  let attempts = 0
  while (!authState && attempts < 10) {
    await page.waitForTimeout(500)
    authState = await page.evaluate(() => {
      return localStorage.getItem('auth-storage')
    })
    attempts++
  }
  
  if (!authState) {
    throw new Error('Auth state not persisted to localStorage')
  }
  
  // Verify it's valid JSON with isAuthenticated = true
  const parsed = JSON.parse(authState)
  if (!parsed.state?.isAuthenticated) {
    throw new Error('Auth state not properly set in localStorage')
  }
  
  // Give additional time for state to be fully ready
  await page.waitForTimeout(1000)
})

When('I enter email {string}', async ({ page }, email: string) => {
  await page.fill('[data-testid="email-input"]', email)
})

When('I enter password {string}', async ({ page }, password: string) => {
  await page.fill('[data-testid="password-input"]', password)
})

When('I click the login button', async ({ page }) => {
  await page.click('[data-testid="login-button"]')
  await page.waitForTimeout(1000)
})

When('I click the logout button', async ({ page }) => {
  await page.click('[data-testid="logout-button"]')
  await page.waitForTimeout(1000)
})

Then('I should be redirected to the dashboard', async ({ page }) => {
  await page.waitForURL('**/dashboard', { timeout: 15000 })
  await page.waitForLoadState('domcontentloaded')
  expect(page.url()).toContain('/dashboard')
})

Then('I should see an error message', async ({ page }) => {
  // Wait for error message to appear
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 5000 })
})

Then('I should remain on the login page', async ({ page }) => {
  expect(page.url()).toContain('/login')
})

Then('I should be redirected to the login page', async ({ page }) => {
  await page.waitForURL('**/login', { timeout: 5000 })
  expect(page.url()).toContain('/login')
})

Then('I should not see the dashboard', async ({ page }) => {
  await expect(page.locator('[data-testid="dashboard-title"]')).not.toBeVisible()
})
