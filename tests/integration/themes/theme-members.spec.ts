import { expect, test } from '@playwright/test';
import {
    activeMember,
    defaultPlayground,
    ownerMember,
    playgroundTheme,
    searchMemberResult,
} from '../../fixtures/app';
import { jsonResponse, successResponse, type MockApiHandler } from '../../helpers/api';
import { loginThroughUi } from '../../helpers/auth';

const buildPlaygroundThemeResponse = () => {
    return jsonResponse({
        status: 200,
        success: true,
        data: {
            themes: [{ ...playgroundTheme }],
            pagination: {
                total: 1,
                per_page: 20,
                current_page: 1,
                last_page: 1,
                from: 1,
                to: 1,
            },
        },
    });
};

test('searches for users and invites a new theme member with permissions', async ({ page }) => {
    const members = [{ ...ownerMember }, { ...activeMember }];
    let invitePayload: Record<string, unknown> | null = null;

    const handlers: MockApiHandler[] = [
        {
            method: 'GET',
            pathname: '/api/playgrounds',
            handle: (route) => {
                return route.fulfill(successResponse({ playgrounds: [defaultPlayground] }));
            },
        },
        {
            method: 'GET',
            pathname: `/api/playgrounds/${defaultPlayground.playground_id}`,
            handle: (route) => {
                return route.fulfill(successResponse({ playground: defaultPlayground }));
            },
        },
        {
            method: 'GET',
            pathname: `/api/playgrounds/${defaultPlayground.playground_id}/themes`,
            handle: (route) => {
                return route.fulfill(buildPlaygroundThemeResponse());
            },
        },
        {
            method: 'GET',
            pathname: `/api/themes/${playgroundTheme.theme_id}/members`,
            handle: (route) => {
                return route.fulfill(successResponse({ members }));
            },
        },
        {
            method: 'GET',
            pathname: '/api/users/search',
            handle: (route) => {
                return route.fulfill(successResponse({ users: [searchMemberResult] }));
            },
        },
        {
            method: 'POST',
            pathname: `/api/themes/${playgroundTheme.theme_id}/members`,
            handle: (route, request) => {
                invitePayload = request.postDataJSON() as Record<string, unknown>;
                members.push({
                    ...searchMemberResult,
                    invited_at: '2026-01-12T10:00:00.000Z',
                    permissions: {
                        can_view: true,
                        can_update_theme: true,
                        can_add_task: true,
                        can_edit_task: true,
                        can_delete_task: true,
                        can_validate_task: true,
                    },
                    status: 'invited',
                });

                return route.fulfill(
                    successResponse({
                        invitation: members[members.length - 1],
                    }),
                );
            },
        },
    ];

    await loginThroughUi(page, { handlers });
    await page.goto('/playground');

    await page.getByTestId(`themes-theme-actions-${playgroundTheme.theme_id}`).click();
    await page.getByTestId(`themes-theme-action-share-${playgroundTheme.theme_id}`).click();

    await expect(page.getByTestId('themes-members-dialog')).toBeVisible();
    await expect(page.getByTestId(`themes-members-row-${activeMember.user_id}`)).toBeVisible();

    await page.getByRole('tab', { name: 'Inviter un membre' }).click();
    await page.getByTestId('themes-members-search-input').fill('new');
    await expect(
        page.getByTestId(`themes-members-search-result-${searchMemberResult.user_id}`),
    ).toBeVisible();

    await page.getByTestId(`themes-members-invite-open-${searchMemberResult.user_id}`).click();
    await expect(page.getByTestId('themes-member-permissions-dialog')).toBeVisible();
    await page.getByTestId('themes-member-permissions-preset-full').click();
    await page.getByTestId('themes-member-permissions-confirm').click();

    await expect(page.getByText('Invitation envoyée')).toBeVisible();
    await expect
        .poll(() => {
            return invitePayload;
        })
        .toMatchObject({
            user_id: searchMemberResult.user_id,
            can_delete_task: true,
            can_update_theme: true,
        });
});

test('edits, deactivates, and reactivates an existing member', async ({ page }) => {
    const members = [{ ...ownerMember }, { ...activeMember }];
    let updatedPermissions: Record<string, unknown> | null = null;

    const handlers: MockApiHandler[] = [
        {
            method: 'GET',
            pathname: '/api/playgrounds',
            handle: (route) => {
                return route.fulfill(successResponse({ playgrounds: [defaultPlayground] }));
            },
        },
        {
            method: 'GET',
            pathname: `/api/playgrounds/${defaultPlayground.playground_id}`,
            handle: (route) => {
                return route.fulfill(successResponse({ playground: defaultPlayground }));
            },
        },
        {
            method: 'GET',
            pathname: `/api/playgrounds/${defaultPlayground.playground_id}/themes`,
            handle: (route) => {
                return route.fulfill(buildPlaygroundThemeResponse());
            },
        },
        {
            method: 'GET',
            pathname: `/api/themes/${playgroundTheme.theme_id}/members`,
            handle: (route) => {
                return route.fulfill(successResponse({ members }));
            },
        },
        {
            method: 'PATCH',
            pathname: `/api/themes/${playgroundTheme.theme_id}/members/${activeMember.user_id}`,
            handle: (route, request) => {
                updatedPermissions = request.postDataJSON() as Record<string, unknown>;
                members[1] = {
                    ...members[1]!,
                    permissions: {
                        ...members[1]!.permissions,
                        ...(updatedPermissions as (typeof members)[1]['permissions']),
                    },
                };

                return route.fulfill(
                    successResponse({
                        permissions: members[1]!.permissions,
                    }),
                );
            },
        },
        {
            method: 'POST',
            pathname: `/api/themes/${playgroundTheme.theme_id}/members/${activeMember.user_id}/deactivate`,
            handle: (route) => {
                members[1] = {
                    ...members[1]!,
                    status: 'revoked',
                };

                return route.fulfill(successResponse({}));
            },
        },
        {
            method: 'POST',
            pathname: `/api/themes/${playgroundTheme.theme_id}/members/${activeMember.user_id}/reactivate`,
            handle: (route) => {
                members[1] = {
                    ...members[1]!,
                    status: 'active',
                };

                return route.fulfill(successResponse({}));
            },
        },
    ];

    await loginThroughUi(page, { handlers });
    await page.goto('/playground');

    await page.getByTestId(`themes-theme-actions-${playgroundTheme.theme_id}`).click();
    await page.getByTestId(`themes-theme-action-share-${playgroundTheme.theme_id}`).click();
    await expect(page.getByTestId('themes-members-dialog')).toBeVisible();

    await page.getByTestId(`themes-members-edit-${activeMember.user_id}`).click();
    await page.getByTestId('themes-member-permissions-toggle-can_delete_task').click();
    await page.getByTestId('themes-member-permissions-confirm').click();

    await expect(page.getByText('Permissions mises à jour')).toBeVisible();
    await expect
        .poll(() => {
            return updatedPermissions;
        })
        .toMatchObject({
            can_delete_task: true,
        });

    await page.getByTestId(`themes-members-deactivate-${activeMember.user_id}`).click();
    await page.getByRole('button', { name: 'Désactiver' }).click();
    await expect(page.getByText('Membre désactivé')).toBeVisible();

    await page.getByTestId(`themes-members-reactivate-${activeMember.user_id}`).click();
    await expect(page.getByText('Membre réactivé')).toBeVisible();
});
