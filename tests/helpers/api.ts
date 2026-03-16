import type { Page, Request, Route } from '@playwright/test';

type MockApiHandler = {
    method?: string;
    pathname: RegExp | string;
    handle: (route: Route, request: Request, url: URL) => Promise<void> | void;
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

export const successResponse = (data: unknown, extras: Record<string, unknown> = {}) => {
    return jsonResponse({
        status: 'success',
        success: true,
        data,
        ...extras,
    });
};

export const errorResponse = (
    message: string,
    status = 400,
    extras: Record<string, unknown> = {},
) => {
    return jsonResponse(
        {
            status: 'error',
            success: false,
            message,
            ...extras,
        },
        status,
    );
};

export const installApiMocks = async (page: Page, handlers: MockApiHandler[]) => {
    await page.route('**/api/**', async (route, request) => {
        const url = new URL(request.url());
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
