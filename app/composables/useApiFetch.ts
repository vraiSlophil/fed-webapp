import {HttpMethods} from "~/utils/httpMethods";
import type { QueryParams } from "~/utils/queryString";
import { buildQueryString } from "~/utils/queryString";

const ensureCsrf = async (config: any) => {
    await fetch(`${config.public.BACKEND_URL}/sanctum/csrf-cookie`, {credentials: 'include'})
}

const getXsrfHeader = () => {
    const raw = useCookie('XSRF-TOKEN').value || ''
    return decodeURIComponent(raw)
}

export type ApiFetchOptions = RequestInit & {
    query?: QueryParams
}

export const useApiFetch = async (
    url: string,
    options: ApiFetchOptions = {}
) => {
    const config = useRuntimeConfig()
    const method = ((options.method || HttpMethods.GET) as HttpMethods).toUpperCase()
    const authToken = useCookie('auth-token').value

    /* 1.  En-têtes communs */
    const baseHeaders: any = {
        Accept: 'application/json',
        ...(options.headers || {})
    }

    /* 2. Ajouter le token d'authentification s'il existe */
    if (authToken) {
        baseHeaders['Authorization'] = `Bearer ${authToken}`
    }

    /* 3.  Pour les verbes modifiant l'état, on récupère le cookie CSRF */
    if ([HttpMethods.POST, HttpMethods.PUT, HttpMethods.PATCH, HttpMethods.DELETE].includes(method as HttpMethods)) {
        await ensureCsrf(config);
        const isFormData = options.body instanceof FormData

        options.headers = {
            ...baseHeaders,
            'X-XSRF-TOKEN': getXsrfHeader(),
            ...(isFormData ? {} : {'Content-Type': 'application/json'}),
        }
    } else {
        options.headers = baseHeaders
    }

    /* 4.  On transmet TOUJOURS les cookies (session + XSRF) */
    options.credentials = 'include'

    const queryString = buildQueryString(options.query)
    const hasExistingQuery = url.includes('?')
    const finalUrl = hasExistingQuery && queryString
        ? `${url}&${queryString.slice(1)}`
        : `${url}${queryString}`

    const { query, ...fetchOptions } = options

    const response = await fetch(`${config.public.BACKEND_URL}${finalUrl}`, fetchOptions)
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
        const error: any = new Error(data?.message || 'Erreur inconnue')
        error.data = data
        throw error
    }

    return data
}