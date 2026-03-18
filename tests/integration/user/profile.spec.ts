import { expect, test } from '@playwright/test';
import {
    errorResponse,
    noContentResponse,
    successResponse,
    type MockApiHandler,
} from '../../helpers/api';
import { loginThroughUi } from '../../helpers/auth';

test('updates the user profile through the authenticated page', async ({ page }) => {
    let capturedProfilePayload: Record<string, unknown> | null = null;

    const handlers: MockApiHandler[] = [
        {
            method: 'POST',
            pathname: '/api/profile/update',
            handle: (route, request) => {
                capturedProfilePayload = request.postDataJSON() as Record<string, unknown>;
                return route.fulfill(successResponse({}));
            },
        },
    ];

    await loginThroughUi(page, { handlers });
    await page.goto('/user');

    const profileInputs = page.getByTestId('user-profile-form').locator('input');
    await profileInputs.nth(0).fill('updated-user');
    await profileInputs.nth(2).fill('Updated');
    await profileInputs.nth(3).fill('Profile');
    await page.getByTestId('user-profile-save').click();

    await expect(page.getByText('Vos informations ont été enregistrées.')).toBeVisible();
    await expect
        .poll(() => {
            return capturedProfilePayload;
        })
        .toMatchObject({
            first_name: 'Updated',
            last_name: 'Profile',
            username: 'updated-user',
        });
});

test('shows an API error when the password update fails', async ({ page }) => {
    const handlers: MockApiHandler[] = [
        {
            method: 'POST',
            pathname: '/api/profile/password',
            handle: (route) => {
                return route.fulfill(errorResponse('The current password is invalid.', 422));
            },
        },
    ];

    await loginThroughUi(page, { handlers });
    await page.goto('/user');

    const passwordInputs = page.getByTestId('user-password-form').locator('input');
    await passwordInputs.nth(0).fill('wrong-password');
    await passwordInputs.nth(1).fill('new-password');
    await passwordInputs.nth(2).fill('new-password');
    await page.getByTestId('user-password-save').click();

    await expect(page.getByText('The current password is invalid.')).toBeVisible();
});

test('logs the user out and redirects to the homepage', async ({ page }) => {
    const handlers: MockApiHandler[] = [
        {
            method: 'POST',
            pathname: '/api/logout',
            handle: (route) => {
                return route.fulfill(noContentResponse());
            },
        },
    ];

    await loginThroughUi(page, { handlers });
    await page.goto('/user');
    await page.getByTestId('user-logout').click();

    await expect(page).toHaveURL('/');
    await expect
        .poll(() => {
            return page.evaluate(() => {
                return localStorage.getItem('auth-token');
            });
        })
        .toBeNull();
});
