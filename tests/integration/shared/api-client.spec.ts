import { expect, test } from '@playwright/test';
import {
    installApiMocks,
    noContentResponse,
    paginatedEnvelope,
    permissionDeniedEnvelope,
    validationErrorEnvelope,
} from '../../helpers/api';

test('reads canonical envelope data, errors, meta, and 204 no content', async ({ page }) => {
    await installApiMocks(page, [
        {
            method: 'GET',
            pathname: '/api/tests/api-client/success',
            handle: (route) => {
                return route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(
                        paginatedEnvelope(
                            {
                                title: 'Canonical payload',
                                count: 2,
                            },
                            {
                                current_page: 1,
                                per_page: 20,
                                total: 40,
                                last_page: 2,
                                from: 1,
                                to: 20,
                                has_next: true,
                            },
                            {
                                list_context: 'api-client-harness',
                            },
                            {
                                messageCode: 'tests.api_client.success',
                            },
                        ),
                    ),
                });
            },
        },
        {
            method: 'POST',
            pathname: '/api/tests/api-client/validation',
            handle: (route) => {
                return route.fulfill({
                    status: 422,
                    contentType: 'application/json',
                    body: JSON.stringify(
                        validationErrorEnvelope(
                            {
                                title: ['Title is required.'],
                                color: ['Color is invalid.'],
                            },
                            'The request payload is invalid.',
                        ),
                    ),
                });
            },
        },
        {
            method: 'GET',
            pathname: '/api/tests/api-client/permission',
            handle: (route) => {
                return route.fulfill({
                    status: 403,
                    contentType: 'application/json',
                    body: JSON.stringify(
                        permissionDeniedEnvelope('Access denied.', {
                            meta: {
                                request_id: 'req-permission-1',
                                required_permission: 'themes.manage',
                            },
                        }),
                    ),
                });
            },
        },
        {
            method: 'DELETE',
            pathname: '/api/tests/api-client/delete',
            handle: (route) => {
                return route.fulfill(noContentResponse());
            },
        },
    ]);

    await page.goto('/tests/api-client');
    await expect(page.getByTestId('api-client-mounted')).toHaveText('true');

    await page.getByTestId('api-client-success-button').click();
    await expect(page.getByTestId('api-client-success-message-code')).toHaveText(
        'tests.api_client.success',
    );
    await expect(page.getByTestId('api-client-success-title')).toHaveText('Canonical payload');
    await expect(page.getByTestId('api-client-success-count')).toHaveText('2');
    await expect(page.getByTestId('api-client-success-has-next')).toHaveText('true');
    await expect(page.getByTestId('api-client-success-meta-extras')).toContainText(
        'api-client-harness',
    );

    await page.getByTestId('api-client-validation-button').click();
    await expect(page.getByTestId('api-client-validation-message-code')).toHaveText(
        'validation.invalid',
    );
    await expect(page.getByTestId('api-client-validation-errors')).toContainText(
        'Title is required.',
    );
    await expect(page.getByTestId('api-client-validation-errors')).toContainText(
        'Color is invalid.',
    );

    await page.getByTestId('api-client-permission-button').click();
    await expect(page.getByTestId('api-client-permission-message-code')).toHaveText(
        'permission.denied',
    );
    await expect(page.getByTestId('api-client-permission-request-id')).toHaveText(
        'req-permission-1',
    );
    await expect(page.getByTestId('api-client-permission-forbidden')).toHaveText('true');

    await page.getByTestId('api-client-delete-button').click();
    await expect(page.getByTestId('api-client-delete-completed')).toHaveText('true');
    await expect(page.getByTestId('api-client-delete-null')).toHaveText('true');
});
