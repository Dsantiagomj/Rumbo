import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('successfully registers a new user', async ({ page }) => {
    // Generate unique email for test
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;

    // Fill registration form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="preferredName"]', 'Test');

    // Fill date of birth
    await page.fill('input[placeholder="DD/MM/AAAA"]', '19/12/1996');

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to login page
    await expect(page).toHaveURL('/login', { timeout: 10000 });
  });

  test('shows validation error for invalid email', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="preferredName"]', 'Test');
    await page.fill('input[placeholder="DD/MM/AAAA"]', '19/12/1996');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!');

    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.locator('text=/email/i')).toBeVisible();
  });

  test('shows validation error for weak password', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="preferredName"]', 'Test');
    await page.fill('input[placeholder="DD/MM/AAAA"]', '19/12/1996');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'weak');
    await page.fill('input[name="confirmPassword"]', 'weak');

    await page.click('button[type="submit"]');

    // Should show password validation errors
    const errorText = page.locator('text=/contraseña/i');
    await expect(errorText.first()).toBeVisible();
  });

  test('shows error when passwords do not match', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="preferredName"]', 'Test');
    await page.fill('input[placeholder="DD/MM/AAAA"]', '19/12/1996');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPass123!');

    await page.click('button[type="submit"]');

    // Should show password mismatch error
    await expect(page.locator('text=Las contraseñas no coinciden')).toBeVisible();
  });

  test('shows error for underage users (< 13 years)', async ({ page }) => {
    // Calculate a date less than 13 years ago
    const today = new Date();
    const underageDate = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());
    const formattedDate = `${underageDate.getDate().toString().padStart(2, '0')}/${(underageDate.getMonth() + 1).toString().padStart(2, '0')}/${underageDate.getFullYear()}`;

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="preferredName"]', 'Test');
    await page.fill('input[placeholder="DD/MM/AAAA"]', formattedDate);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!');

    await page.click('button[type="submit"]');

    // Should show age restriction error
    await expect(page.locator('text=/13 años/i')).toBeVisible();
  });

  test('calendar allows selecting birth date', async ({ page }) => {
    // Click calendar icon button to open date picker
    await page.click('button:has(svg[class*="lucide-calendar"])');

    // Wait for calendar popover to appear
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // Calendar is now visible - test passed if we got here
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('allows manual date entry with auto-formatting', async ({ page }) => {
    const dateInput = page.locator('input[placeholder="DD/MM/AAAA"]');

    // Type digits without slashes
    await dateInput.fill('');
    await dateInput.type('19121996');

    // Should auto-format to DD/MM/YYYY
    await expect(dateInput).toHaveValue('19/12/1996');
  });

  test('disables submit button while loading', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="preferredName"]', 'Test');
    await page.fill('input[placeholder="DD/MM/AAAA"]', '19/12/1996');
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!');

    const submitButton = page.locator('button[type="submit"]');

    // Click submit
    await submitButton.click();

    // Button should show loading state
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toContainText('Creando cuenta...');
  });

  test('has link to login page', async ({ page }) => {
    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink).toBeVisible();

    await loginLink.click();
    await expect(page).toHaveURL('/login');
  });
});
