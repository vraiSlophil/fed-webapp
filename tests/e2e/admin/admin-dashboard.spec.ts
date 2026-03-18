import { expect, test } from '@playwright/test';

test.skip(
    true,
    'Real fed-api e2e remains blocked until the frontend is aligned with the current backend contracts.',
);

test('opens the admin dashboard for an authenticated admin user', async ({ page }) => {
    await page.goto('/admin');

    await expect(page).toHaveURL('/admin');
    await expect(page.getByText('Administration')).toBeVisible();
});
