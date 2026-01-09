import { test, expect } from '@playwright/test';

test.describe('Protected Routes', () => {
  test('redirects unauthenticated user from dashboard to login', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard');

    // Should redirect to login page
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });

  test('allows authenticated user to access dashboard', async ({ page }) => {
    // Register and login
    await page.goto('/register');

    const timestamp = Date.now();
    const testEmail = `test-protected-${timestamp}@example.com`;
    const testPassword = 'SecurePass123!';

    await page.fill('input[name="name"]', 'Test Protected User');
    await page.fill('input[name="preferredName"]', 'TestProtected');
    await page.fill('input[placeholder="DD/MM/AAAA"]', '19/12/1996');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/login', { timeout: 10000 });

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Should successfully access dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    await expect(page.locator('text=/Hola TestProtected/i')).toBeVisible();

    // Should still be able to access dashboard directly
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=/TestProtected/i')).toBeVisible();
  });

  test('public routes are accessible without authentication', async ({ page }) => {
    // Login page should be accessible
    await page.goto('/login');
    await expect(page).toHaveURL('/login');

    // Register page should be accessible
    await page.goto('/register');
    await expect(page).toHaveURL('/register');
  });

  test('authenticated user redirected from auth pages to dashboard', async ({ page }) => {
    // Register and login
    await page.goto('/register');

    const timestamp = Date.now();
    const testEmail = `test-auth-redirect-${timestamp}@example.com`;
    const testPassword = 'SecurePass123!';

    await page.fill('input[name="name"]', 'Test Auth Redirect');
    await page.fill('input[name="preferredName"]', 'TestAuthRedirect');
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

    // Now try to visit login page while authenticated
    await page.goto('/login');
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });

    // Try to visit register page while authenticated
    await page.goto('/register');
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
  });

  test('session persists across page reloads', async ({ page }) => {
    // Register and login
    await page.goto('/register');

    const timestamp = Date.now();
    const testEmail = `test-session-${timestamp}@example.com`;
    const testPassword = 'SecurePass123!';

    await page.fill('input[name="name"]', 'Test Session User');
    await page.fill('input[name="preferredName"]', 'TestSession');
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

    // Reload the page
    await page.reload();

    // Should still be on dashboard (session persisted)
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=/TestSession/i')).toBeVisible();
  });

  test('direct URL access to dashboard requires authentication', async ({ page }) => {
    // Clear any existing cookies
    await page.context().clearCookies();

    // Try to directly access dashboard
    await page.goto('/dashboard');

    // Should be redirected to login
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });
});
