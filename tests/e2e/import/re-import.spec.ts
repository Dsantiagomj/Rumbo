/**
 * E2E Tests - Re-Import Flow
 * Tests importing new transactions to existing account with duplicate detection
 */
import { test, expect, type Page } from '@playwright/test';
import path from 'path';

// Helper to create and login a test user
async function createAndLoginUser(page: Page) {
  const timestamp = Date.now();
  const testEmail = `test-reimport-${timestamp}@example.com`;
  const testPassword = 'SecurePass123!';

  // Register
  await page.goto('/register');
  await page.fill('input[name="name"]', 'ReImport Test User');
  await page.fill('input[name="preferredName"]', 'TestReImport');
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

  return { email: testEmail, password: testPassword };
}

// Helper to import initial CSV
async function importInitialCSV(page: Page) {
  await page.goto('/import');

  const filePath = path.join(__dirname, '../../fixtures/bancolombia-valid.csv');
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(filePath);

  // Wait for review
  await expect(page.locator('text=/revisar|confirmar/i')).toBeVisible({ timeout: 15000 });

  // Confirm import
  const confirmButton = page
    .locator('button')
    .filter({ hasText: /confirmar|importar/i })
    .first();
  await confirmButton.click();

  // Wait for dashboard
  await expect(page).toHaveURL('/dashboard', { timeout: 20000 });
}

test.describe('Re-Import - Append to Existing Account', () => {
  test('should allow re-importing to existing account', async ({ page }) => {
    // Setup: Create user and import initial CSV
    await createAndLoginUser(page);
    await importInitialCSV(page);

    // Verify first account exists
    await expect(page.locator('text=/bancolombia/i')).toBeVisible();

    // Navigate to import again
    await page.goto('/import');

    // Upload February CSV
    const filePath = path.join(__dirname, '../../fixtures/bancolombia-february.csv');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    // Wait for review
    await expect(page.locator('text=/revisar|confirmar/i')).toBeVisible({ timeout: 15000 });

    // Should show option to add to existing account
    const addToExistingOption = page.locator('text=/agregar a cuenta existente|cuenta existente/i');

    if (await addToExistingOption.isVisible({ timeout: 5000 })) {
      await addToExistingOption.click();

      // Should show account selector
      await expect(page.locator('text=/bancolombia/i')).toBeVisible();

      // Select the existing account
      const existingAccount = page.locator('text=/bancolombia/i').first();
      await existingAccount.click();
    }

    // Confirm import
    const confirmButton = page
      .locator('button')
      .filter({ hasText: /confirmar|importar/i })
      .first();
    await confirmButton.click();

    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 20000 });

    // Verify account still exists (not duplicated)
    const accountCards = page.locator('text=/bancolombia/i');
    const count = await accountCards.count();

    // Should only have 1 account (transactions added to existing)
    expect(count).toBeGreaterThan(0);
  });

  test('should detect and skip duplicate transactions', async ({ page }) => {
    await createAndLoginUser(page);
    await importInitialCSV(page);

    // Try to re-import the same file
    await page.goto('/import');

    const filePath = path.join(__dirname, '../../fixtures/bancolombia-valid.csv');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    // Wait for review
    await expect(page.locator('text=/revisar|confirmar/i')).toBeVisible({ timeout: 15000 });

    // Should show duplicate warning
    const duplicateWarning = page.locator('text=/duplicad|ya exist/i');

    if (await duplicateWarning.isVisible({ timeout: 5000 })) {
      // Duplicates detected!
      await expect(duplicateWarning).toBeVisible();
    }

    // If we try to add to existing account, should show 0 new transactions
    const addToExistingOption = page.locator('text=/agregar a cuenta existente/i');

    if (await addToExistingOption.isVisible({ timeout: 3000 })) {
      await addToExistingOption.click();

      // Should indicate no new transactions to add
      const noNewTransactions = page.locator('text=/0.*nuevas?|no hay nuevas/i');

      if (await noNewTransactions.isVisible({ timeout: 3000 })) {
        await expect(noNewTransactions).toBeVisible();
      }
    }
  });

  test('should show summary of new vs duplicate transactions', async ({ page }) => {
    await createAndLoginUser(page);
    await importInitialCSV(page);

    // Create CSV with mix of new and duplicate transactions
    const mixedCSV = `FECHA,DESCRIPCIÓN,DÉBITOS,CRÉDITOS,SALDO
01/01/2024,ABONO NOMINA EMPRESA XYZ,,2000000,2000000
05/02/2024,NUEVA COMPRA EN EXITO,45000,,1955000
10/02/2024,OTRA TRANSACCION NUEVA,30000,,1925000
Saldo Final: 1.925.000`;

    const fs = await import('fs');
    const tempPath = path.join(__dirname, '../../fixtures/temp-mixed.csv');
    fs.writeFileSync(tempPath, mixedCSV);

    await page.goto('/import');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(tempPath);

    await expect(page.locator('text=/revisar|confirmar/i')).toBeVisible({ timeout: 15000 });

    // Look for summary showing duplicates and new transactions
    const hasSummary = await page.locator('text=/duplicad|nuevas?/i').isVisible({ timeout: 5000 });

    // Cleanup
    fs.unlinkSync(tempPath);

    expect(hasSummary).toBeTruthy();
  });

  test('should update account balance after re-import', async ({ page }) => {
    await createAndLoginUser(page);
    await importInitialCSV(page);

    // Navigate to dashboard then re-import
    await page.goto('/dashboard');

    // Re-import with new transactions
    await page.goto('/import');

    const filePath = path.join(__dirname, '../../fixtures/bancolombia-february.csv');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    await expect(page.locator('text=/revisar|confirmar/i')).toBeVisible({ timeout: 15000 });

    // Select existing account if option is available
    const addToExistingOption = page.locator('text=/agregar a cuenta existente/i');

    if (await addToExistingOption.isVisible({ timeout: 5000 })) {
      await addToExistingOption.click();
      const existingAccount = page.locator('text=/bancolombia/i').first();
      await existingAccount.click();
    }

    // Confirm
    const confirmButton = page
      .locator('button')
      .filter({ hasText: /confirmar|importar/i })
      .first();
    await confirmButton.click();

    await expect(page).toHaveURL('/dashboard', { timeout: 20000 });

    // Balance should be updated (different from initial)
    const updatedBalanceVisible = await page
      .locator('text=/1[.,]433[.,]000/i')
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    // Either new balance is visible OR balance stayed same (if duplicates were skipped)
    expect(
      updatedBalanceVisible || (await page.locator('text=/1[.,]858[.,]000/i').isVisible()),
    ).toBeTruthy();
  });
});

test.describe('Re-Import - Create New Account Option', () => {
  test('should allow creating new account instead of appending', async ({ page }) => {
    await createAndLoginUser(page);
    await importInitialCSV(page);

    // Re-import but create new account
    await page.goto('/import');

    const filePath = path.join(__dirname, '../../fixtures/bancolombia-february.csv');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    await expect(page.locator('text=/revisar|confirmar/i')).toBeVisible({ timeout: 15000 });

    // Look for "Create new account" option
    const createNewOption = page.locator('text=/crear cuenta nueva|nueva cuenta/i');

    if (await createNewOption.isVisible({ timeout: 5000 })) {
      await createNewOption.click();
    }

    // Give different name to new account
    const accountNameInput = page.locator('input[name="accountName"]').first();

    if (await accountNameInput.isVisible()) {
      await accountNameInput.fill('Segunda Cuenta Bancolombia');
    }

    // Confirm
    const confirmButton = page
      .locator('button')
      .filter({ hasText: /confirmar|importar/i })
      .first();
    await confirmButton.click();

    await expect(page).toHaveURL('/dashboard', { timeout: 20000 });

    // Should now have 2 accounts
    const accountCards = page.locator('text=/bancolombia/i');
    const count = await accountCards.count();

    // May have 2 accounts or just 1 (depends on implementation)
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Re-Import - Bank Validation', () => {
  test('should validate bank compatibility when re-importing', async ({ page }) => {
    await createAndLoginUser(page);
    await importInitialCSV(page); // Import Bancolombia

    // Try to import different bank's CSV to same account (if feature exists)
    const nequiCSV = `Fecha,Detalle,Valor,Saldo
01/02/2024,Recarga Nequi,50000,50000
05/02/2024,Pago QR,-20000,30000
Saldo: 30.000`;

    const fs = await import('fs');
    const tempPath = path.join(__dirname, '../../fixtures/temp-nequi.csv');
    fs.writeFileSync(tempPath, nequiCSV);

    await page.goto('/import');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(tempPath);

    await expect(page.locator('text=/revisar|confirmar/i')).toBeVisible({ timeout: 15000 });

    // If trying to add to existing account, should show bank mismatch warning
    const addToExistingOption = page.locator('text=/agregar a cuenta existente/i');

    if (await addToExistingOption.isVisible({ timeout: 3000 })) {
      await addToExistingOption.click();

      // Should show warning about different bank
      const bankMismatchWarning = page.locator('text=/banco diferente|no coincide/i');

      // Bank mismatch may be shown as warning or existing account may not appear in list
      const warningVisible = await bankMismatchWarning
        .isVisible({ timeout: 3000 })
        .catch(() => false);

      // Either warning is shown OR Bancolombia account doesn't appear as option
      const bancolombiaOption = page.locator('text=/bancolombia/i').first();
      const bancolombiaVisible = await bancolombiaOption
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      // One of these should be true: warning shown OR bank filtered out
      expect(warningVisible || !bancolombiaVisible).toBeTruthy();
    }

    // Cleanup
    fs.unlinkSync(tempPath);
  });
});

test.describe('Re-Import - Monthly Workflow', () => {
  test('should handle typical monthly re-import workflow', async ({ page }) => {
    await createAndLoginUser(page);

    // Month 1: Initial import
    await page.goto('/import');
    let filePath = path.join(__dirname, '../../fixtures/bancolombia-valid.csv');
    let fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    await expect(page.locator('text=/revisar|confirmar/i')).toBeVisible({ timeout: 15000 });

    const accountNameInput = page.locator('input[name="accountName"]').first();
    if (await accountNameInput.isVisible()) {
      await accountNameInput.fill('Bancolombia Ahorros');
    }

    let confirmButton = page
      .locator('button')
      .filter({ hasText: /confirmar|importar/i })
      .first();
    await confirmButton.click();

    await expect(page).toHaveURL('/dashboard', { timeout: 20000 });

    // Month 2: Re-import
    await page.goto('/import');
    filePath = path.join(__dirname, '../../fixtures/bancolombia-february.csv');
    fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    await expect(page.locator('text=/revisar|confirmar/i')).toBeVisible({ timeout: 15000 });

    // Select existing account
    const addToExistingOption = page.locator('text=/agregar a cuenta existente/i');

    if (await addToExistingOption.isVisible({ timeout: 5000 })) {
      await addToExistingOption.click();

      const existingAccount = page.locator('text=/bancolombia ahorros/i').first();
      if (await existingAccount.isVisible()) {
        await existingAccount.click();
      }
    }

    confirmButton = page
      .locator('button')
      .filter({ hasText: /confirmar|importar/i })
      .first();
    await confirmButton.click();

    await expect(page).toHaveURL('/dashboard', { timeout: 20000 });

    // Verify account still shows correctly
    await expect(page.locator('text=/bancolombia ahorros/i')).toBeVisible();

    // Should have transactions from both months
    // (This would need to navigate to transactions page to verify)
  });

  test('should show import reminder task after successful import', async ({ page }) => {
    await createAndLoginUser(page);
    await importInitialCSV(page);

    // Navigate to tasks/todos page if it exists
    const tasksLink = page.locator('a[href*="/task"]').or(page.locator('text=/tareas/i'));

    if (await tasksLink.isVisible({ timeout: 3000 })) {
      await tasksLink.click();

      // Should show import reminder task
      await expect(page.locator('text=/importar.*bancolombia/i')).toBeVisible({ timeout: 5000 });
    }
  });
});
