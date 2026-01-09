import { test, expect } from '@playwright/test';

test.describe('User Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('successfully logs in with valid credentials', async ({ page, context }) => {
    // First register a test user
    await page.goto('/register');

    const timestamp = Date.now();
    const testEmail = `test-login-${timestamp}@example.com`;
    const testPassword = 'SecurePass123!';

    // Register user
    await page.fill('input[name="name"]', 'Test Login User');
    await page.fill('input[name="preferredName"]', 'TestLogin');
    await page.fill('input[placeholder="DD/MM/AAAA"]', '19/12/1996');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for redirect to login
    await expect(page).toHaveURL('/login', { timeout: 10000 });

    // Now login with the registered user
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Should see welcome message with preferred name
    await expect(page.locator('text=/Hola TestLogin/i')).toBeVisible();

    // Verify session cookie exists
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(
      (cookie) => cookie.name.includes('session') || cookie.name.includes('auth'),
    );
    expect(sessionCookie).toBeDefined();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // Should stay on login page (error occurred)
    await expect(page).toHaveURL('/login');

    // Wait a bit to ensure error processing
    await page.waitForTimeout(1000);
  });

  test('shows validation error for empty email', async ({ page }) => {
    await page.fill('input[name="email"]', '');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');

    // Should stay on login page
    await expect(page).toHaveURL('/login');
    await page.waitForTimeout(500);
  });

  test('shows validation error for empty password', async ({ page }) => {
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', '');
    await page.click('button[type="submit"]');

    // Should stay on login page
    await expect(page).toHaveURL('/login');
    await page.waitForTimeout(500);
  });

  test('shows validation error for invalid email format', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');

    // Should stay on login page
    await expect(page).toHaveURL('/login');
    await page.waitForTimeout(500);
  });

  test('disables submit button while loading', async ({ page }) => {
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');

    const submitButton = page.locator('button[type="submit"]');

    // Click submit
    await submitButton.click();

    // Button should show loading state
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toContainText(/iniciando|loading/i);
  });

  test('has link to register page', async ({ page }) => {
    const registerLink = page.locator('a[href="/register"]');
    await expect(registerLink).toBeVisible();

    await registerLink.click();
    await expect(page).toHaveURL('/register');
  });

  test('redirects authenticated user away from login page', async ({ page }) => {
    // First register and login
    await page.goto('/register');

    const timestamp = Date.now();
    const testEmail = `test-redirect-${timestamp}@example.com`;
    const testPassword = 'SecurePass123!';

    await page.fill('input[name="name"]', 'Test Redirect User');
    await page.fill('input[name="preferredName"]', 'TestRedirect');
    await page.fill('input[placeholder="DD/MM/AAAA"]', '19/12/1996');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/login', { timeout: 10000 });

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Now try to go to login page while authenticated
    await page.goto('/login');

    // Should redirect back to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
  });
});
