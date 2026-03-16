import path from 'node:path';
import { expect, test } from '@playwright/test';
import { getPlaywrightE2eEnv } from '../../helpers/env';

test.skip(
    true,
    'Real fed-api e2e remains blocked until the frontend is aligned with the current backend contracts.',
);

test('authenticates the seeded standard user', async ({ page }) => {
    const playwrightE2eEnv = getPlaywrightE2eEnv();

    await page.goto('/login');
    await page.getByTestId('auth-login-email').locator('input').fill(playwrightE2eEnv.userEmail);
    await page
        .getByTestId('auth-login-password')
        .locator('input')
        .first()
        .fill(playwrightE2eEnv.password);
    await page.getByTestId('auth-login-submit').click();

    await expect(page).toHaveURL('/');
    await page.context().storageState({
        path: path.join(process.cwd(), 'tests/.auth/user.json'),
    });
});
