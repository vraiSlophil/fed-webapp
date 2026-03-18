import type { NitroFetchOptions } from 'nitropack';
import type { ApiErrorEnvelope, ApiRawMeta, ApiSuccessEnvelope } from '~/types/api';
import type { QueryParams } from '~/utils/queryString';
import { buildQueryString } from '~/utils/queryString';
import { useAuthState } from '~/domains/auth/composables/useAuthState';
import { ApiClientError, getRequestId } from '~/utils/apiEnvelope';
import { HttpMethods } from '~/utils/httpMethods';

export type ApiFetchOptions = Omit<NitroFetchOptions<string>, 'query' | 'method'> & {
    method?: HttpMethods;
    query?: QueryParams;
    redirectOn401?: string | false;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const resolveApiMeta = (value: unknown): ApiRawMeta | null => {
    if (!isRecord(value)) {
        return null;
    }

    return { ...value };
};

const resolveApiErrorBody = (value: unknown): ApiErrorEnvelope | null => {
    if (!isRecord(value) || value.status !== 'error' || typeof value.message !== 'string') {
        return null;
    }

    const messageCode =
        typeof value.message_code === 'string' ? value.message_code : 'common.error';

    return {
        status: 'error',
        message: value.message,
        message_code: messageCode,
        message_params: isRecord(value.message_params)
            ? (value.message_params as Record<string, string | number | boolean | null>)
            : undefined,
        data: value.data === null ? null : undefined,
        errors: value.errors,
        meta: resolveApiMeta(value.meta) ?? undefined,
    };
};

const buildApiClientError = (error: unknown): ApiClientError => {
    const errorRecord = isRecord(error) ? error : {};
    const responseRecord = isRecord(errorRecord.response) ? errorRecord.response : {};
    const statusCandidate = errorRecord.status ?? errorRecord.statusCode ?? responseRecord.status;
    const statusCode =
        typeof statusCandidate === 'number' && Number.isFinite(statusCandidate)
            ? statusCandidate
            : 0;
    const headers =
        responseRecord.headers instanceof Headers ? responseRecord.headers : new Headers();
    const errorBody = resolveApiErrorBody(errorRecord.data ?? responseRecord._data);
    const meta = resolveApiMeta(errorBody?.meta);

    return new ApiClientError({
        message:
            errorBody?.message ??
            (typeof errorRecord.message === 'string' ? errorRecord.message : 'API request failed'),
        statusCode,
        messageCode: errorBody?.message_code ?? null,
        messageParams: errorBody?.message_params ?? null,
        errors: errorBody?.errors ?? null,
        meta,
        requestId: getRequestId(meta, headers),
        headers,
        cause: error,
    });
};

export const useApiFetch = async <TData>(
    url: string,
    options: ApiFetchOptions = {},
): Promise<ApiSuccessEnvelope<TData> | null> => {
    const config = useRuntimeConfig();
    const { token, clearAuth, setForbidden } = useAuthState();

    const headers = new Headers(options.headers || {});
    headers.set('Accept', 'application/json');

    if (token.value) {
        headers.set('Authorization', `Bearer ${token.value}`);
    }

    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    if (options.body && !isFormData && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    setForbidden(false);

    const queryString = buildQueryString(options.query);
    const hasExistingQuery = url.includes('?');
    const finalUrl =
        hasExistingQuery && queryString ? `${url}&${queryString.slice(1)}` : `${url}${queryString}`;

    const {
        query: _query,
        redirectOn401,
        headers: _headers,
        credentials: _credentials,
        ...fetchOptions
    } = options;

    try {
        const response = await $fetch.raw<ApiSuccessEnvelope<TData>>(
            `${config.public.BACKEND_URL}${finalUrl}`,
            {
                ...fetchOptions,
                headers,
                credentials: 'omit',
            },
        );

        if (response.status === 204) {
            return null;
        }

        if (!response._data) {
            throw new ApiClientError({
                message: 'API response body is missing.',
                statusCode: response.status,
                headers: response.headers,
            });
        }

        return response._data;
    } catch (error: unknown) {
        const apiError = buildApiClientError(error);

        if (apiError.statusCode === 401) {
            clearAuth();
            const redirectTarget = redirectOn401 === undefined ? '/login' : redirectOn401;
            if (redirectTarget && import.meta.client) {
                void navigateTo(redirectTarget);
            }
        } else if (apiError.statusCode === 403) {
            setForbidden(true);
        }

        throw apiError;
    }
};
