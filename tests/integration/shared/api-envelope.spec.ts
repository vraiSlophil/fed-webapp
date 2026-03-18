import { expect, test } from '@playwright/test';
import {
    ApiClientError,
    getFieldErrors,
    getRequestId,
    isApiClientError,
    isValidationApiError,
    splitApiMeta,
} from '../../../app/utils/apiEnvelope';

test('splitApiMeta extracts pagination and meta extras', () => {
    const result = splitApiMeta({
        current_page: 2,
        per_page: 20,
        total: 45,
        last_page: 3,
        from: 21,
        to: 40,
        has_next: true,
        sort_by: 'created_at',
    });

    expect(result.pagination).toEqual({
        current_page: 2,
        per_page: 20,
        total: 45,
        last_page: 3,
        from: 21,
        to: 40,
        has_next: true,
    });
    expect(result.metaExtras).toEqual({
        sort_by: 'created_at',
    });
});

test('splitApiMeta keeps pagination null when meta is incomplete', () => {
    const result = splitApiMeta({
        current_page: 1,
        per_page: 20,
        total: 2,
        last_page: 1,
        from: 1,
        to: 2,
    });

    expect(result.pagination).toBeNull();
    expect(result.metaExtras).toEqual({
        current_page: 1,
        per_page: 20,
        total: 2,
        last_page: 1,
        from: 1,
        to: 2,
    });
});

test('extracts request id from meta and falls back to headers', () => {
    expect(getRequestId({ request_id: 'req-meta-1' })).toBe('req-meta-1');
    expect(getRequestId({}, new Headers({ 'X-Request-Id': 'req-header-1' }))).toBe('req-header-1');
});

test('identifies validation api errors and exposes field errors', () => {
    const error = new ApiClientError({
        message: 'Validation failed.',
        statusCode: 422,
        messageCode: 'validation.invalid',
        errors: {
            email: ['The email field is required.'],
        },
        meta: {
            request_id: 'req-validation-1',
        },
    });

    expect(isApiClientError(error)).toBe(true);
    expect(isValidationApiError(error)).toBe(true);
    expect(getFieldErrors(error)).toEqual({
        email: ['The email field is required.'],
    });
});
