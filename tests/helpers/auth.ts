import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { adminUser, standardUser } from '../fixtures/app';
import { installApiMocks, noContentResponse, successResponse, type MockApiHandler } from './api';

type LoginFixtureOptions = {
    handlers?: MockApiHandler[];
    user?: typeof standardUser | typeof adminUser;
};

export const mockedAccessToken = 'playwright-access-token';

export const buildAuthHandlers = (
    user: typeof standardUser | typeof adminUser = standardUser,
): MockApiHandler[] => {
    return [
        {
            method: 'POST',
            pathname: '/api/login',
            handle: (route) => {
                return route.fulfill(
                    successResponse(
                        { token: mockedAccessToken, user },
                        { messageCode: 'auth.login.success' },
                    ),
                );
            },
        },
        {
            method: 'GET',
            pathname: '/api/user',
            handle: (route) => {
                return route.fulfill(
                    successResponse({ user }, { messageCode: 'auth.user.fetched' }),
                );
            },
        },
        {
            method: 'POST',
            pathname: '/api/logout',
            handle: (route) => {
                return route.fulfill(noContentResponse());
            },
        },
    ];
};

export const loginThroughUi = async (
    page: Page,
    options: LoginFixtureOptions = {},
): Promise<void> => {
    const user = options.user ?? standardUser;

    await installApiMocks(page, [...(options.handlers ?? []), ...buildAuthHandlers(user)]);

    await page.goto('/login');

    await page.getByTestId('auth-login-email').locator('input').fill(user.email);
    await page.getByTestId('auth-login-password').locator('input').first().fill('password');
    await page.getByTestId('auth-login-submit').click();

    await expect(page).toHaveURL('/');
    await expect
        .poll(() => {
            return page.evaluate(() => {
                return localStorage.getItem('auth-token');
            });
        })
        .toBe(mockedAccessToken);
};
