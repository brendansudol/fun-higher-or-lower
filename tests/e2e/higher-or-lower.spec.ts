import { expect, test } from '@playwright/test';

test('seeded board is reproducible and playable', async ({ page }) => {
  await page.goto('/?seed=K7Q2M9&pack=world');

  await expect(page.getByRole('heading', { name: 'Higher or Lower' })).toBeVisible();
  await expect(page.getByTestId('country-left')).toContainText('Brunei');
  await expect(page.getByTestId('country-right')).toContainText('Belize');

  const rows = page.getByTestId('metric-row');
  await expect(rows).toHaveCount(5);
  await expect(rows.nth(0)).toContainText('Land area');
  await expect(rows.nth(4)).toContainText('Exports of goods and services');

  for (let index = 0; index < 5; index += 1) {
    await rows.nth(index).getByRole('button').first().click();
  }

  await page.getByRole('button', { name: 'Submit picks' }).click();
  await expect(page.getByTestId('score-banner')).toBeVisible();
  await expect(page.getByTestId('score-banner')).toContainText('/ 5');

  const beforeUrl = page.url();
  await page.getByRole('button', { name: 'New round' }).first().click();
  await expect.poll(() => page.url()).not.toBe(beforeUrl);
  await expect(page.getByRole('button', { name: 'Copy link' }).first()).toBeVisible();
});
