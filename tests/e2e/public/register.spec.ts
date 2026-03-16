import { expect, test } from '@playwright/test';

test.skip(
    true,
    'Real fed-api e2e remains blocked until the frontend is aligned with the current backend contracts.',
);

test('registers a unique user against the real backend', async ({ page }) => {
    const uniqueSuffix = `${Date.now()}`;

    await page.goto('/register');
    await page
        .getByTestId('auth-register-username')
        .locator('input')
        .fill(`pw-user-${uniqueSuffix}`);
    await page
        .getByTestId('auth-register-email')
        .locator('input')
        .fill(`pw-user-${uniqueSuffix}@example.test`);
    await page.getByTestId('auth-register-password').locator('input').first().fill('password');
    await page
        .getByTestId('auth-register-password-confirmation')
        .locator('input')
        .first()
        .fill('password');
    await page.getByTestId('auth-register-submit').click();

    await expect(page).toHaveURL('/');
});
