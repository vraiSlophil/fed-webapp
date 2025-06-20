import { useRuntimeConfig, useCookie } from '#app'
    import { HttpMethod } from '~/utils/httpMethods'

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

      // Utilise l'enum pour vérifier la méthode
      if ([HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH, HttpMethod.DELETE].includes(method as HttpMethod)) {
        await fetch(`${config.public.BACKEND_URL}/sanctum/csrf-cookie`, {
          credentials: 'include'
        })
        options.headers = {
          ...(options.headers || {}),
          'X-XSRF-TOKEN': getXsrfHeader(),
          'Content-Type': 'application/json',
        }
        options.credentials = 'include'
      }

      const response = await fetch(`${config.public.BACKEND_URL}${url}`, options)
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const error: any = new Error(data?.message || 'Erreur inconnue')
        error.data = data
        throw error
      }

      return data
    }