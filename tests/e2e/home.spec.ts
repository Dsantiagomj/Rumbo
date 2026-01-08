import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display welcome message', async ({ page }) => {
    await page.goto('/');

    // Check for welcome heading
    await expect(page.getByRole('heading', { name: /Bienvenido a Rumbo/i })).toBeVisible();
  });

  test('should display health check status', async ({ page }) => {
    await page.goto('/');

    // Wait for health check to load
    await expect(page.getByText('System Health Check')).toBeVisible();
    await expect(page.getByText('Status:')).toBeVisible();
    await expect(page.getByText('OK')).toBeVisible();
  });

  test('should display stack information', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Stack Info' })).toBeVisible();
    await expect(page.getByText(/Next.js/i)).toBeVisible();
    await expect(page.getByText(/tRPC/i)).toBeVisible();
    await expect(page.getByText(/Prisma/i)).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /Bienvenido a Rumbo/i })).toBeVisible();
  });
});
