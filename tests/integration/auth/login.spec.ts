import { expect, test } from '@playwright/test';
import { errorResponse, installApiMocks } from '../../helpers/api';

test('renders the login form with an initially disabled submit button', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
    await expect(page.getByTestId('auth-login-email').locator('input')).toHaveValue('');
    await expect(page.getByTestId('auth-login-password').locator('input').first()).toHaveValue('');
    await expect(page.getByTestId('auth-login-submit')).toBeDisabled();
});

test('shows the backend error toast when login fails', async ({ page }) => {
    await installApiMocks(page, [
        {
            method: 'POST',
            pathname: '/api/login',
            handle: (route) => {
                return route.fulfill(errorResponse('Invalid credentials.', 401));
            },
        },
    ]);

    await page.goto('/login');
    await page.getByTestId('auth-login-email').locator('input').fill('user@example.com');
    await page.getByTestId('auth-login-password').locator('input').first().fill('bad-password');
    await page.getByTestId('auth-login-submit').click();

    await expect(page).toHaveURL('/login');
    await expect(page.getByText('Invalid credentials.')).toBeVisible();
});
