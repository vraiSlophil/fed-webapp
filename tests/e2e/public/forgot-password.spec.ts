import { expect, test } from '@playwright/test';
import { getPlaywrightE2eEnv } from '../../helpers/env';

test.skip(
    true,
    'Real fed-api e2e remains blocked until the frontend is aligned with the current backend contracts.',
);

test('requests a password reset against the real backend', async ({ page }) => {
    const playwrightE2eEnv = getPlaywrightE2eEnv();

    await page.goto('/forgot-password');
    await page
        .getByTestId('auth-forgot-password-email')
        .locator('input')
        .fill(playwrightE2eEnv.userEmail);
    await page.getByTestId('auth-forgot-password-submit').click();

    await expect(page.getByText('Un email de réinitialisation a été envoyé.')).toBeVisible();
});
