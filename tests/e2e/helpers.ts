import { Page } from '@playwright/test';

export async function loginAs(page: Page, username: string) {
  await page.goto('/login');
  await page.getByLabel('Username').fill(username);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('/');
}
