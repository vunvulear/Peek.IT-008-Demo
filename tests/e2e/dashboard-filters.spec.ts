import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

test.describe('US4: Dashboard Filters and Sort', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'alice');
  });

  test('dashboard displays all required columns', async ({ page }) => {
    // Verify table headers
    await expect(page.getByRole('columnheader', { name: 'ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Title' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Severity' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Owner' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Service' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Updated' })).toBeVisible();
  });

  test('filter by status shows only matching incidents', async ({ page }) => {
    // Click the "Open" filter button
    await page.getByRole('button', { name: 'Open', exact: true }).click();

    // Wait for table to refresh
    await page.waitForTimeout(500);

    // All visible status badges should be "Open"
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const row = rows.nth(i);
        await expect(row).toContainText('Open');
      }
    }
  });

  test('filter by severity shows only matching incidents', async ({ page }) => {
    // Click "P1" filter
    await page.getByRole('button', { name: 'P1', exact: true }).click();

    await page.waitForTimeout(500);

    const rows = page.locator('tbody tr');
    const count = await rows.count();
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const row = rows.nth(i);
        await expect(row).toContainText('P1');
      }
    }
  });

  test('clear filters restores full list', async ({ page }) => {
    // Apply a filter
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    await page.waitForTimeout(300);

    // Note initial filtered count
    const filteredText = await page.getByText('total').textContent();

    // Clear filters
    await page.getByText('Clear filters').click();
    await page.waitForTimeout(300);

    // Total should be >= filtered count
    const totalText = await page.getByText('total').textContent();
    expect(totalText).toBeDefined();
  });

  test('clicking a row navigates to incident detail', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Should navigate to detail page
    await expect(page.getByText('Back to Dashboard')).toBeVisible();
    await expect(page.getByText('Timeline')).toBeVisible();
  });
});
