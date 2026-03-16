import { expect, test } from '@playwright/test';

test.skip(
    true,
    'Real fed-api e2e remains blocked until the frontend is aligned with the current backend contracts.',
);

test('opens the playground for an authenticated standard user and logs out', async ({ page }) => {
    await page.goto('/playground');
    await expect(page).toHaveURL(/\/playground/);

    await page.getByRole('button', { name: /Accéder à FED|standard-user|Alice Admin/i }).click();
    await page.getByTestId('user-logout').click();

    await expect(page).toHaveURL('/');
});
