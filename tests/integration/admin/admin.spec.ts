import { expect, test } from '@playwright/test';
import {
    adminUser,
    adminUserDetailsResponse,
    adminUserListResponse,
    standardUser,
} from '../../fixtures/app';
import { successResponse, type MockApiHandler } from '../../helpers/api';
import { loginThroughUi } from '../../helpers/auth';

test('redirects authenticated non-admin users away from the admin page', async ({ page }) => {
    await loginThroughUi(page, { user: standardUser });
    await page.goto('/admin');

    await expect(page).toHaveURL('/');
});

test('renders the admin dashboard and fetches filtered user details', async ({ page }) => {
    const searchTerms: string[] = [];

    const handlers: MockApiHandler[] = [
        {
            method: 'GET',
            pathname: '/api/admin/users',
            handle: (route, _request, url) => {
                const search = url.searchParams.get('search') ?? '';
                searchTerms.push(search);

                const users = search
                    ? adminUserListResponse.users.filter((user) => {
                          return user.username.includes(search) || user.email.includes(search);
                      })
                    : adminUserListResponse.users;

                return route.fulfill(
                    successResponse({
                        ...adminUserListResponse,
                        users,
                    }),
                );
            },
        },
        {
            method: 'GET',
            pathname: `/api/admin/users/${adminUser.user_id}`,
            handle: (route) => {
                return route.fulfill(successResponse(adminUserDetailsResponse));
            },
        },
    ];

    await loginThroughUi(page, { handlers, user: adminUser });
    await page.goto('/admin');

    await expect(page.getByTestId('admin-page')).toBeVisible();
    await expect(page.getByText('Administration')).toBeVisible();
    await expect(page.getByTestId('admin-users-table')).toContainText(adminUser.email);

    await page.getByTestId('admin-users-search').fill('admin');
    await expect
        .poll(() => {
            return searchTerms.includes('admin');
        })
        .toBe(true);

    await page.getByTestId(`admin-users-action-details-${adminUser.user_id}`).click();
    await expect(page.getByText('Profil')).toBeVisible();
    await expect(page.getByText(adminUser.email)).toBeVisible();
});
