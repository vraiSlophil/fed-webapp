import { useApiFetch } from '~/composables/useApiFetch'

export const login = async (email: string, password: string) => {
    return await useApiFetch('/api/login', {
        method: HttpMethod.POST,
        body: JSON.stringify({ email, password })
    })
}