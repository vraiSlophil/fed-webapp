import type {User} from "~/types/user";

export function useAuth() {
    const user = useState<User | null>('user', () => null)
    const loading = useState<boolean>('auth-loading', () => true)
    const isAuthenticated = useState<boolean>('isAuthenticated', () => false)

    const authToken = useCookie('auth-token', {
        maxAge: 60 * 60 * 24 * 7,
        sameSite: true,
        secure: process.env.NODE_ENV === 'production'
    })

    const fetchUser = async () => {
        loading.value = true
        try {
            const response = await useApiFetch('/api/user', {method: HttpMethods.GET})
            user.value = response.data
            isAuthenticated.value = true
            return true
        } catch (error: any) {
            user.value = null
            isAuthenticated.value = false
            authToken.value = null
            console.error('Erreur lors de la récupération des données utilisateur:', error)
            throw new Error(error.message || 'Erreur lors de la récupération des données utilisateur')
        } finally {
            loading.value = false
        }
    }

    const register = async (username: string, email: string, password: string, password_confirmation: string) => {
        loading.value = true
        try {
            const response = await useApiFetch('/api/register', {
                method: HttpMethods.POST,
                body: JSON.stringify({username, email, password, password_confirmation})
            })
            await handleResponse(response)
            return response
        } catch (error: any) {
            console.error('Erreur lors de l\'inscription:', error)
            throw new Error(error.message || 'Erreur lors de l\'inscription')
        } finally {
            loading.value = false
        }
    }

    const login = async (email: string, password: string) => {
        loading.value = true
        try {
            const response = await useApiFetch('/api/login', {
                method: HttpMethods.POST,
                body: JSON.stringify({email, password})
            })
            await handleResponse(response)
            return response
        } catch (error: any) {
            console.error('Erreur lors de la connexion:', error)
            throw new Error(error.message || 'Erreur lors de la connexion')
        } finally {
            loading.value = false
        }
    }

    const logout = async () => {
        loading.value = true
        try {
            if (authToken.value) {
                await useApiFetch('/api/logout', {method: HttpMethods.POST})
            } else {
                throw new Error('Aucun token de connexion disponible.')
            }
        } catch (error: any) {
            console.error('Erreur lors de la déconnexion:', error)
            throw new Error(error.message || 'Erreur lors de la déconnexion')
        } finally {
            user.value = null
            isAuthenticated.value = false
            authToken.value = null
            loading.value = false
        }
    }

    const handleResponse = async (response: any) => {
        if (response && response.status === 'success' && response.data) {
            if (response.data.token) {
                authToken.value = response.data.token
            }
            if (response.data.user) {
                user.value = response.data.user
                isAuthenticated.value = true
            } else {
                await fetchUser()
            }
        } else {
            const errorMessage = response?.message || 'Erreur lors de la réponse de l\'API'
            console.error(errorMessage)
            throw new Error(errorMessage)
        }
    }

    const initAuth = async () => {
        loading.value = true // ✅ Début du chargement initial
        try {
            if (authToken.value) {
                return await fetchUser()
            }
            return false
        } finally {
            loading.value = false // ✅ Fin du chargement initial (même sans token)
        }
    }

    return {
        user,
        loading,
        isAuthenticated,
        authToken,
        register,
        login,
        logout,
        fetchUser,
        initAuth
    }
}