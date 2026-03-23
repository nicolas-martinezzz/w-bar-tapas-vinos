import { test, expect } from '@playwright/test';

const adminPassword = process.env.ADMIN_PASSWORD ?? process.env.E2E_ADMIN_PASSWORD ?? '';

test.describe('/admin dashboard', () => {
  test('redirects unauthenticated /admin/dashboard to /admin', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/?$/);
  });

  test('login page shows branding and password field', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByTestId('admin-login-title')).toBeVisible();
    await expect(page.getByTestId('admin-password-input')).toBeVisible();
    await expect(page.getByTestId('admin-login-submit')).toBeVisible();
  });

  test('wrong password shows error', async ({ page }) => {
    await page.goto('/admin');
    await page.getByTestId('admin-password-input').fill('__invalid_password_for_e2e__');
    await page.getByTestId('admin-login-submit').click();
    await expect(page.getByTestId('admin-login-error')).toBeVisible({ timeout: 10_000 });
  });

  test('successful login shows dashboard', async ({ page }) => {
    test.skip(!adminPassword, 'Set ADMIN_PASSWORD or E2E_ADMIN_PASSWORD in .env.local');

    await page.goto('/admin');
    await page.getByTestId('admin-password-input').fill(adminPassword);
    await page.getByTestId('admin-login-submit').click();

    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15_000 });
    await expect(page.getByTestId('dashboard-heading')).toBeVisible();
    await expect(page.getByTestId('dashboard-section-sala')).toBeVisible();
    await expect(page.getByTestId('dashboard-section-reservas')).toBeVisible();
  });

  test('dashboard refresh triggers reload without error', async ({ page }) => {
    test.skip(!adminPassword, 'Set ADMIN_PASSWORD or E2E_ADMIN_PASSWORD in .env.local');

    await page.goto('/admin');
    await page.getByTestId('admin-password-input').fill(adminPassword);
    await page.getByTestId('admin-login-submit').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15_000 });

    const btn = page.getByTestId('dashboard-refresh');
    await btn.click();
    await expect(page.getByTestId('dashboard-heading')).toBeVisible();
  });

  test('sala section has date and new table button', async ({ page }) => {
    test.skip(!adminPassword, 'Set ADMIN_PASSWORD or E2E_ADMIN_PASSWORD in .env.local');

    await page.goto('/admin');
    await page.getByTestId('admin-password-input').fill(adminPassword);
    await page.getByTestId('admin-login-submit').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15_000 });

    await expect(page.getByTestId('dashboard-date-input')).toBeVisible();
    await expect(page.getByTestId('dashboard-add-mesa')).toBeVisible();
  });

  test('reservas filter and new reservation button', async ({ page }) => {
    test.skip(!adminPassword, 'Set ADMIN_PASSWORD or E2E_ADMIN_PASSWORD in .env.local');

    await page.goto('/admin');
    await page.getByTestId('admin-password-input').fill(adminPassword);
    await page.getByTestId('admin-login-submit').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15_000 });

    await expect(page.getByTestId('dashboard-reserva-filter')).toBeVisible();
    await expect(page.getByTestId('dashboard-new-reserva')).toBeVisible();
  });
});
