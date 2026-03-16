import { expect, test } from '@playwright/test';
import { standardUser } from '../../fixtures/app';
import { errorResponse, installApiMocks, successResponse } from '../../helpers/api';

test('registers a user and stores the auth token', async ({ page }) => {
    await installApiMocks(page, [
        {
            method: 'POST',
            pathname: '/api/register',
            handle: (route) => {
                return route.fulfill(
                    successResponse({
                        token: 'register-token',
                        user: standardUser,
                    }),
                );
            },
        },
    ]);

    await page.goto('/register');
    await page.getByTestId('auth-register-username').locator('input').fill('standard-user');
    await page.getByTestId('auth-register-email').locator('input').fill('user@example.com');
    await page.getByTestId('auth-register-password').locator('input').first().fill('password');
    await page
        .getByTestId('auth-register-password-confirmation')
        .locator('input')
        .first()
        .fill('password');
    await page.getByTestId('auth-register-submit').click();

    await expect(page).toHaveURL('/');
    await expect
        .poll(() => {
            return page.evaluate(() => {
                return localStorage.getItem('auth-token');
            });
        })
        .toBe('register-token');
});

test('shows the backend validation error when registration fails', async ({ page }) => {
    await installApiMocks(page, [
        {
            method: 'POST',
            pathname: '/api/register',
            handle: (route) => {
                return route.fulfill(errorResponse('The email has already been taken.', 422));
            },
        },
    ]);

    await page.goto('/register');
    await page.getByTestId('auth-register-username').locator('input').fill('standard-user');
    await page.getByTestId('auth-register-email').locator('input').fill('user@example.com');
    await page.getByTestId('auth-register-password').locator('input').first().fill('password');
    await page
        .getByTestId('auth-register-password-confirmation')
        .locator('input')
        .first()
        .fill('password');
    await page.getByTestId('auth-register-submit').click();

    await expect(page).toHaveURL('/register');
    await expect(page.getByText('The email has already been taken.')).toBeVisible();
});
