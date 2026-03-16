import { expect, test } from '@playwright/test';
import { errorResponse, installApiMocks, successResponse } from '../../helpers/api';

test('submits the forgot-password form successfully', async ({ page }) => {
    await installApiMocks(page, [
        {
            method: 'POST',
            pathname: '/api/forgot-password',
            handle: (route) => {
                return route.fulfill(successResponse({}));
            },
        },
    ]);

    await page.goto('/forgot-password');
    await page.getByTestId('auth-forgot-password-email').locator('input').fill('user@example.com');
    await page.getByTestId('auth-forgot-password-submit').click();

    await expect(page.getByText('Un email de réinitialisation a été envoyé.')).toBeVisible();
    await expect(page.getByTestId('auth-forgot-password-email').locator('input')).toHaveValue('');
});

test('shows the backend error when forgot-password fails', async ({ page }) => {
    await installApiMocks(page, [
        {
            method: 'POST',
            pathname: '/api/forgot-password',
            handle: (route) => {
                return route.fulfill(errorResponse('No account matched this email address.', 400));
            },
        },
    ]);

    await page.goto('/forgot-password');
    await page.getByTestId('auth-forgot-password-email').locator('input').fill('user@example.com');
    await page.getByTestId('auth-forgot-password-submit').click();

    await expect(page.getByText('No account matched this email address.')).toBeVisible();
});
