import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

test.describe('US2/US3: Triage, Assign, and Update Status', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'alice');

    // Create a test incident
    await page.getByRole('button', { name: '+ New Incident' }).click();
    await page.locator('#incident-title').fill('E2E: Triage test incident');
    await page.locator('#incident-severity').selectOption('P3');
    await page.locator('#incident-service').fill('cache');
    await page.getByRole('button', { name: 'Report Incident' }).click();

    // Navigate to the detail page (click first matching row)
    await page.locator('tbody tr', { hasText: 'E2E: Triage test incident' }).first().click();
    await page.waitForSelector('#detail-status');
  });

  test('change severity and verify timeline entry', async ({ page }) => {
    await page.locator('#detail-severity').selectOption('P1');

    await expect(page.getByText('Severity changed from P3 to P1')).toBeVisible({ timeout: 5000 });
  });

  test('assign owner and verify timeline entry', async ({ page }) => {
    await page.locator('#detail-owner').selectOption({ label: 'Bob Smith' });

    await expect(page.getByText('Assigned to Bob Smith')).toBeVisible({ timeout: 5000 });
  });

  test('change status to Investigating and verify timeline', async ({ page }) => {
    await page.locator('#detail-status').selectOption('Investigating');

    await expect(page.getByText('Status changed from Open to Investigating')).toBeVisible({ timeout: 5000 });
  });

  test('add a resolution note', async ({ page }) => {
    const input = page.getByPlaceholder('Add a resolution note or update...');
    await input.fill('Root cause identified: memory leak');
    await expect(input).toHaveValue('Root cause identified: memory leak');

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/timeline') && resp.request().method() === 'POST'
    );
    await input.press('Enter');
    await responsePromise;

    // Reload to ensure fresh timeline data is rendered
    await page.reload();
    await page.waitForSelector('#detail-status');
    await expect(page.getByText('Root cause identified: memory leak')).toBeVisible({ timeout: 10000 });
  });

  test('full lifecycle: triage → investigate → resolve → close', async ({ page }) => {
    await page.locator('#detail-severity').selectOption('P1');
    await expect(page.getByText('Severity changed from P3 to P1')).toBeVisible({ timeout: 5000 });

    await page.locator('#detail-owner').selectOption({ label: 'Bob Smith' });
    await expect(page.getByText('Assigned to Bob Smith')).toBeVisible({ timeout: 5000 });

    await page.locator('#detail-status').selectOption('Investigating');
    await expect(page.getByText('Status changed from Open to Investigating')).toBeVisible({ timeout: 5000 });

    await page.locator('#detail-status').selectOption('Resolved');
    await expect(page.getByText('Investigating to Resolved')).toBeVisible({ timeout: 5000 });

    await page.locator('#detail-status').selectOption('Closed');
    await expect(page.getByText('Resolved to Closed')).toBeVisible({ timeout: 5000 });
  });
});
