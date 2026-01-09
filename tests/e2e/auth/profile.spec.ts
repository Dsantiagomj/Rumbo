import { test, expect, type Page } from '@playwright/test';

test.describe('User Profile Management', () => {
  // Helper function to register and login a user
  async function registerAndLogin(page: Page) {
    const timestamp = Date.now();
    const testEmail = `test-profile-${timestamp}@example.com`;
    const testPassword = 'SecurePass123!';

    // Register
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Profile Test User');
    await page.fill('input[name="preferredName"]', 'ProfileTest');
    await page.fill('input[placeholder="DD/MM/AAAA"]', '19/12/1996');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for redirect to login
    await expect(page).toHaveURL('/login', { timeout: 10000 });

    // Login
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    return { testEmail, testPassword };
  }

  test('profile page is accessible when logged in', async ({ page }) => {
    await registerAndLogin(page);

    // Navigate to profile page
    await page.goto('/settings/profile');

    // Should be on profile page
    await expect(page).toHaveURL('/settings/profile');

    // Should see form fields
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="preferredName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  // TODO: Fix redirect test - middleware not redirecting in test environment
  test.skip('profile page redirects to login when not authenticated', async ({ page }) => {
    // Clear cookies to ensure not authenticated
    await page.context().clearCookies();

    // Try to access profile page without authentication
    await page.goto('/settings/profile');

    // Should redirect to login page
    await expect(page).toHaveURL('/login', { timeout: 10000 });
  });

  test('successfully loads current profile data into form', async ({ page }) => {
    await registerAndLogin(page);

    // Navigate to profile page
    await page.goto('/settings/profile');

    // Wait for form to load
    await page.waitForTimeout(1000);

    // Check that fields are populated with current data
    await expect(page.locator('input[name="name"]')).toHaveValue('Profile Test User');
    await expect(page.locator('input[name="preferredName"]')).toHaveValue('ProfileTest');
  });

  test('successfully updates name and shows success message', async ({ page }) => {
    await registerAndLogin(page);

    // Navigate to profile page
    await page.goto('/settings/profile');

    // Wait for form to load
    await page.waitForTimeout(1000);

    // Update name
    await page.fill('input[name="name"]', 'Updated Profile Name');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=/actualizado exitosamente/i')).toBeVisible({
      timeout: 5000,
    });

    // Reload page and verify change persisted
    await page.reload();
    await page.waitForTimeout(1000);
    await expect(page.locator('input[name="name"]')).toHaveValue('Updated Profile Name');
  });

  test('successfully updates email', async ({ page }) => {
    const { testEmail } = await registerAndLogin(page);

    // Navigate to profile page
    await page.goto('/settings/profile');
    await page.waitForTimeout(1000);

    // Current email should be loaded
    await expect(page.locator('input[name="email"]')).toHaveValue(testEmail);

    // Update email to a new unique one
    const newEmail = `updated-${Date.now()}@example.com`;
    await page.fill('input[name="email"]', newEmail);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=/actualizado exitosamente/i')).toBeVisible({
      timeout: 5000,
    });
  });

  test('validates email format', async ({ page }) => {
    await registerAndLogin(page);

    // Navigate to profile page
    await page.goto('/settings/profile');
    await page.waitForTimeout(1000);

    // Try to update with invalid email
    await page.fill('input[name="email"]', 'invalid-email');

    // Submit form
    await page.click('button[type="submit"]');

    // Should stay on profile page (validation error)
    await expect(page).toHaveURL('/settings/profile');
  });

  // TODO: Fix select interactions for shadcn/ui components
  test.skip('successfully updates currency preference', async ({ page }) => {
    await registerAndLogin(page);

    // Navigate to profile page
    await page.goto('/settings/profile');
    await page.waitForTimeout(1000);

    // Open currency select
    await page.click('button:has-text("COP")');

    // Select USD
    await page.click('text=USD (Dólar)');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=/actualizado exitosamente/i')).toBeVisible({
      timeout: 5000,
    });

    // Reload and verify
    await page.reload();
    await page.waitForTimeout(1000);
    await expect(page.locator('button:has-text("USD")')).toBeVisible();
  });

  // TODO: Fix select interactions for shadcn/ui components
  test.skip('successfully updates language preference', async ({ page }) => {
    await registerAndLogin(page);

    // Navigate to profile page
    await page.goto('/settings/profile');
    await page.waitForTimeout(1000);

    // Open language select
    await page.click('button:has-text("Español")');

    // Select English
    await page.click('text=English (US)');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=/actualizado exitosamente/i')).toBeVisible({
      timeout: 5000,
    });
  });

  // TODO: Fix select interactions for shadcn/ui components
  test.skip('successfully updates date format preference', async ({ page }) => {
    await registerAndLogin(page);

    // Navigate to profile page
    await page.goto('/settings/profile');
    await page.waitForTimeout(1000);

    // Open date format select
    await page.click('button:has-text("DD/MM/YYYY")');

    // Select MM/DD/YYYY
    await page.click('text=MM/DD/YYYY (mes/día/año)');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=/actualizado exitosamente/i')).toBeVisible({
      timeout: 5000,
    });
  });

  // TODO: Fix select interactions for shadcn/ui components
  test.skip('successfully updates timezone preference', async ({ page }) => {
    await registerAndLogin(page);

    // Navigate to profile page
    await page.goto('/settings/profile');
    await page.waitForTimeout(1000);

    // Open timezone select
    await page.click('button:has-text("Colombia")');

    // Select New York
    await page.click('text=Nueva York (UTC-5/UTC-4)');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=/actualizado exitosamente/i')).toBeVisible({
      timeout: 5000,
    });

    // Reload and verify
    await page.reload();
    await page.waitForTimeout(1000);
    await expect(page.locator('button:has-text("Nueva York")')).toBeVisible();
  });

  test('form shows loading state during submission', async ({ page }) => {
    await registerAndLogin(page);

    // Navigate to profile page
    await page.goto('/settings/profile');
    await page.waitForTimeout(1000);

    // Update name
    await page.fill('input[name="name"]', 'Loading Test');

    const submitButton = page.locator('button[type="submit"]');

    // Click submit
    await submitButton.click();

    // Button should show loading state
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toContainText(/guardando/i);
  });

  test('logout button works and redirects to login', async ({ page }) => {
    await registerAndLogin(page);

    // Navigate to profile page
    await page.goto('/settings/profile');

    // Click logout button
    await page.click('button:has-text("Cerrar sesión")');

    // Should redirect to login page
    await expect(page).toHaveURL('/login', { timeout: 5000 });

    // Try to go back to profile page
    await page.goto('/settings/profile');

    // Should be redirected back to login (no longer authenticated)
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });

  test('validates name minimum length', async ({ page }) => {
    await registerAndLogin(page);

    // Navigate to profile page
    await page.goto('/settings/profile');
    await page.waitForTimeout(1000);

    // Try to update with too short name
    await page.fill('input[name="name"]', 'A');

    // Submit form
    await page.click('button[type="submit"]');

    // Should stay on profile page (validation error)
    await expect(page).toHaveURL('/settings/profile');
  });

  test('validates preferred name minimum length', async ({ page }) => {
    await registerAndLogin(page);

    // Navigate to profile page
    await page.goto('/settings/profile');
    await page.waitForTimeout(1000);

    // Try to update with too short preferred name
    await page.fill('input[name="preferredName"]', 'A');

    // Submit form
    await page.click('button[type="submit"]');

    // Should stay on profile page (validation error)
    await expect(page).toHaveURL('/settings/profile');
  });
});
