import { expect, test } from '@playwright/test';
import { defaultPlayground, playgroundTheme, secondaryPlayground } from '../../fixtures/app';
import { jsonResponse, successResponse, type MockApiHandler } from '../../helpers/api';
import { loginThroughUi } from '../../helpers/auth';

const buildPlaygroundThemeResponse = (themes: unknown[]) => {
    return jsonResponse({
        status: 200,
        success: true,
        data: {
            themes,
            pagination: {
                total: themes.length,
                per_page: 20,
                current_page: 1,
                last_page: 1,
                from: themes.length ? 1 : null,
                to: themes.length || null,
            },
        },
    });
};

test('creates a playground from the menu and refreshes the playground list', async ({ page }) => {
    const playgrounds = [{ ...defaultPlayground }, { ...secondaryPlayground }];
    let createdPayload: Record<string, unknown> | null = null;

    const handlers: MockApiHandler[] = [
        {
            method: 'GET',
            pathname: '/api/playgrounds',
            handle: (route) => {
                return route.fulfill(successResponse({ playgrounds }));
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
                return route.fulfill(buildPlaygroundThemeResponse([{ ...playgroundTheme }]));
            },
        },
        {
            method: 'POST',
            pathname: '/api/playgrounds',
            handle: (route, request) => {
                createdPayload = request.postDataJSON() as Record<string, unknown>;

                playgrounds.push({
                    ...secondaryPlayground,
                    playground_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
                    name: 'Client Delivery',
                    slug: 'client-delivery',
                });

                return route.fulfill(
                    successResponse({
                        playground: playgrounds[playgrounds.length - 1],
                    }),
                );
            },
        },
    ];

    await loginThroughUi(page, { handlers });
    await page.goto('/playground');

    await page.getByTestId('playground-menu-toggle').click();
    await page.getByTestId('playground-menu-create-open').click();
    await page.getByTestId('playground-create-name').fill('Client Delivery');
    await expect(page.getByTestId('playground-create-slug')).toHaveValue('client-delivery');
    await page.getByTestId('playground-create-submit').click();

    await expect(page.getByText('Playground créé avec succès.')).toBeVisible();
    await expect
        .poll(() => {
            return createdPayload;
        })
        .toMatchObject({
            name: 'Client Delivery',
            slug: 'client-delivery',
        });
});

test('edits and deletes a playground from the menu', async ({ page }) => {
    const playgrounds = [{ ...defaultPlayground }, { ...secondaryPlayground }];
    let updatedPayload: Record<string, unknown> | null = null;

    const handlers: MockApiHandler[] = [
        {
            method: 'GET',
            pathname: '/api/playgrounds',
            handle: (route) => {
                return route.fulfill(successResponse({ playgrounds }));
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
                return route.fulfill(buildPlaygroundThemeResponse([{ ...playgroundTheme }]));
            },
        },
        {
            method: 'PATCH',
            pathname: `/api/playgrounds/${secondaryPlayground.playground_id}`,
            handle: (route, request) => {
                updatedPayload = request.postDataJSON() as Record<string, unknown>;
                playgrounds[1] = {
                    ...playgrounds[1]!,
                    name: 'Renamed Work',
                    slug: 'renamed-work',
                };

                return route.fulfill(successResponse({ playground: playgrounds[1] }));
            },
        },
        {
            method: 'DELETE',
            pathname: `/api/playgrounds/${secondaryPlayground.playground_id}`,
            handle: (route) => {
                playgrounds.splice(
                    playgrounds.findIndex((playground) => {
                        return playground.playground_id === secondaryPlayground.playground_id;
                    }),
                    1,
                );

                return route.fulfill({
                    body: '',
                    status: 204,
                });
            },
        },
    ];

    await loginThroughUi(page, { handlers });
    await page.goto('/playground');

    await page.getByTestId('playground-menu-toggle').click();
    await page.getByTestId(`playground-menu-edit-${secondaryPlayground.playground_id}`).click();
    await page.getByTestId('playground-edit-name').fill('Renamed Work');
    await page.getByTestId('playground-edit-submit').click();

    await expect(page.getByText('Playground mis à jour avec succès.')).toBeVisible();
    await expect
        .poll(() => {
            return updatedPayload;
        })
        .toMatchObject({
            name: 'Renamed Work',
            slug: 'renamed-work',
        });

    await page.getByTestId(`playground-menu-delete-${secondaryPlayground.playground_id}`).click();
    await page.getByTestId('playground-delete-confirm').click();

    await expect(page.getByText('Playground supprimé avec succès.')).toBeVisible();
});

test('loads another playground route and shows its empty state', async ({ page }) => {
    const handlers: MockApiHandler[] = [
        {
            method: 'GET',
            pathname: '/api/playgrounds',
            handle: (route) => {
                return route.fulfill(
                    successResponse({ playgrounds: [defaultPlayground, secondaryPlayground] }),
                );
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
            pathname: '/api/playgrounds/by-slug/work',
            handle: (route) => {
                return route.fulfill(successResponse({ playground: secondaryPlayground }));
            },
        },
        {
            method: 'GET',
            pathname: `/api/playgrounds/${defaultPlayground.playground_id}/themes`,
            handle: (route) => {
                return route.fulfill(buildPlaygroundThemeResponse([{ ...playgroundTheme }]));
            },
        },
        {
            method: 'GET',
            pathname: `/api/playgrounds/${secondaryPlayground.playground_id}/themes`,
            handle: (route) => {
                return route.fulfill(buildPlaygroundThemeResponse([]));
            },
        },
    ];

    await loginThroughUi(page, { handlers });
    await page.goto('/playground');

    await page.getByTestId('playground-menu-toggle').click();
    await page.getByTestId(`playground-menu-load-${secondaryPlayground.playground_id}`).click();

    await expect(page).toHaveURL('/playground/work');
    await expect(page.getByText('Aucun thème trouvé. Créez votre premier thème !')).toBeVisible();
});
