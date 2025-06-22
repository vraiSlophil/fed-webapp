const ensureCsrf = async (config: any) => {
    await fetch(`${config.public.BACKEND_URL}/sanctum/csrf-cookie`, {credentials: 'include'})
}

const getXsrfHeader = () => {
    const raw = useCookie('XSRF-TOKEN').value || ''
    return decodeURIComponent(raw)
}

export const useApiFetch = async (
    url: string,
    options: RequestInit = {}
) => {
    const config = useRuntimeConfig()
    const method = ((options.method || HttpMethod.GET) as HttpMethod).toUpperCase()

    /* 1.  En-têtes communs */
    const baseHeaders = {
        Accept: 'application/json',
        ...(options.headers || {})
    }

    /* 2.  Pour les verbes modifiant l’état, on récupère le cookie CSRF        */
    if ([HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH, HttpMethod.DELETE].includes(method as HttpMethod)) {
        await ensureCsrf(config);

        options.headers = {
            ...baseHeaders,
            'X-XSRF-TOKEN': getXsrfHeader(),
            'Content-Type': 'application/json',
        }
    } else {
        options.headers = baseHeaders
    }

    /* 3.  On transmet TOUJOURS les cookies (session + XSRF)                   */
    options.credentials = 'include'

    const response = await fetch(`${config.public.BACKEND_URL}${url}`, options)
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
        const error: any = new Error(data?.message || 'Erreur inconnue')
        error.data = data
        throw error
    }

    return data
}