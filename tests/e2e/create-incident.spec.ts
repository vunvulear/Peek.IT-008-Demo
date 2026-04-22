import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

test.describe('US1: Report a New Incident', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'alice');
  });

  test('create incident with all required fields', async ({ page }) => {
    await page.getByRole('button', { name: '+ New Incident' }).click();

    await page.locator('#incident-title').fill('E2E: Database connection pool exhausted');
    await page.locator('#incident-desc').fill('Production DB at max connections. Users seeing 503s.');
    await page.locator('#incident-severity').selectOption('P1');
    await page.locator('#incident-service').fill('api-gateway');

    await page.getByRole('button', { name: 'Report Incident' }).click();

    await expect(page.getByText('E2E: Database connection pool exhausted')).toBeVisible({ timeout: 5000 });
  });

  test('shows validation error for missing title', async ({ page }) => {
    await page.getByRole('button', { name: '+ New Incident' }).click();

    await page.locator('#incident-severity').selectOption('P2');
    await page.locator('#incident-service').fill('cdn');

    await page.getByRole('button', { name: 'Report Incident' }).click();

    await expect(page.getByText('Title is required')).toBeVisible({ timeout: 5000 });
  });

  test('newly created incident appears at top of dashboard', async ({ page }) => {
    await page.getByRole('button', { name: '+ New Incident' }).click();

    await page.locator('#incident-title').fill('E2E: Most recent incident');
    await page.locator('#incident-severity').selectOption('P3');
    await page.locator('#incident-service').fill('search');

    await page.getByRole('button', { name: 'Report Incident' }).click();

    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toContainText('E2E: Most recent incident', { timeout: 5000 });
  });
});
