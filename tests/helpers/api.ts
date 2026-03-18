import type { Page, Request, Route } from '@playwright/test';
import type {
    ApiErrorEnvelope,
    ApiMessageParams,
    ApiRawMeta,
    ApiSuccessEnvelope,
    ApiValidationErrors,
} from '../../app/types/api';
import type { Pagination } from '../../app/types/pagination';

type MockApiHandler = {
    method?: string;
    pathname: RegExp | string;
    handle: (_route: Route, _request: Request, _url: URL) => Promise<void> | void;
};

type SuccessEnvelopeOptions = {
    message?: string;
    messageCode?: string;
    messageParams?: ApiMessageParams;
    meta?: ApiRawMeta;
};

type ErrorEnvelopeOptions = {
    messageCode?: string;
    messageParams?: ApiMessageParams;
    errors?: unknown;
    meta?: ApiRawMeta;
};

const matchesPathname = (pathname: string, matcher: RegExp | string): boolean => {
    if (matcher instanceof RegExp) {
        return matcher.test(pathname);
    }

    return pathname === matcher;
};

export const jsonResponse = (body: unknown, status = 200) => {
    return {
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
    };
};

export const noContentResponse = () => {
    return {
        status: 204,
        body: '',
    };
};

export const successEnvelope = <TData>(
    data: TData,
    options: SuccessEnvelopeOptions = {},
): ApiSuccessEnvelope<TData> => {
    return {
        status: 'success',
        message: options.message ?? 'Ok',
        message_code: options.messageCode ?? 'common.ok',
        ...(options.messageParams ? { message_params: options.messageParams } : {}),
        data,
        ...(options.meta ? { meta: options.meta } : {}),
    };
};

export const paginatedEnvelope = <TData>(
    data: TData,
    pagination: Pagination,
    metaExtras: ApiRawMeta = {},
    options: Omit<SuccessEnvelopeOptions, 'meta'> = {},
): ApiSuccessEnvelope<TData> => {
    return successEnvelope(data, {
        ...options,
        meta: {
            ...pagination,
            ...metaExtras,
        },
    });
};

export const errorEnvelope = (
    message: string,
    options: ErrorEnvelopeOptions = {},
): ApiErrorEnvelope => {
    return {
        status: 'error',
        message,
        message_code: options.messageCode ?? 'common.error',
        ...(options.messageParams ? { message_params: options.messageParams } : {}),
        ...(options.errors !== undefined ? { errors: options.errors } : {}),
        ...(options.meta ? { meta: options.meta } : {}),
    };
};

export const validationErrorEnvelope = (
    fieldErrors: ApiValidationErrors,
    message = 'Validation failed.',
) => {
    return errorEnvelope(message, {
        messageCode: 'validation.invalid',
        errors: fieldErrors,
    });
};

export const permissionDeniedEnvelope = (
    message = 'Permission denied.',
    options: {
        messageCode?: string;
        meta?: ApiRawMeta;
    } = {},
) => {
    return errorEnvelope(message, {
        messageCode: options.messageCode ?? 'permission.denied',
        meta: options.meta,
    });
};

export const successResponse = <TData>(data: TData, options: SuccessEnvelopeOptions = {}) => {
    return jsonResponse(successEnvelope(data, options));
};

export const errorResponse = (
    message: string,
    status = 400,
    options: ErrorEnvelopeOptions = {},
) => {
    return jsonResponse(errorEnvelope(message, options), status);
};

export const installApiMocks = async (page: Page, handlers: MockApiHandler[]) => {
    await page.route('**/*', async (route, request) => {
        const url = new URL(request.url());

        if (url.pathname !== '/api' && !url.pathname.startsWith('/api/')) {
            await route.continue();
            return;
        }

        const handler = handlers.find((candidate) => {
            const methodMatches =
                candidate.method === undefined ||
                candidate.method.toUpperCase() === request.method().toUpperCase();

            return methodMatches && matchesPathname(url.pathname, candidate.pathname);
        });

        if (!handler) {
            await route.fulfill(
                errorResponse(`Unhandled mocked request: ${request.method()} ${url.pathname}`, 500),
            );
            return;
        }

        await handler.handle(route, request, url);
    });
};

export type { MockApiHandler };
