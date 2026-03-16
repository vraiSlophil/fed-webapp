import type { NitroFetchOptions } from 'nitropack';
import type { QueryParams } from '~/utils/queryString';
import { buildQueryString } from '~/utils/queryString';
import { useAuthState } from '~/domains/auth/composables/useAuthState';
import { HttpMethods } from '~/utils/httpMethods';

export type ApiFetchOptions = Omit<NitroFetchOptions<string>, 'query' | 'method'> & {
    method?: HttpMethods;
    query?: QueryParams;
    redirectOn401?: string | false;
};

export const useApiFetch = async <T>(url: string, options: ApiFetchOptions = {}): Promise<T> => {
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
        query,
        redirectOn401,
        headers: _headers,
        credentials: _credentials,
        ...fetchOptions
    } = options;

    try {
        return await $fetch<T>(`${config.public.BACKEND_URL}${finalUrl}`, {
            ...fetchOptions,
            headers,
            credentials: 'omit',
        });
    } catch (error: any) {
        const status = error?.status || error?.statusCode || error?.response?.status;

        if (status === 401) {
            clearAuth();
            const redirectTarget = redirectOn401 === undefined ? '/login' : redirectOn401;
            if (redirectTarget && import.meta.client) {
                void navigateTo(redirectTarget);
            }
        } else if (status === 403) {
            setForbidden(true);
        }

        throw error;
    }
};
