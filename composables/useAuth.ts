import type {User} from "~/types/user";

export function useAuth() {
    const user = useState<User | null>('user', () => null)
    const isAuthenticated = useState<boolean>('isAuthenticated', () => false)
    // Stockage du token avec useCookie pour persistance
    const authToken = useCookie('auth-token', {
        maxAge: 60 * 60 * 24 * 7, // 7 jours
        sameSite: true,
        secure: process.env.NODE_ENV === 'production'
    })

    // Fonction fetchUser déplacée depuis useUser
    const fetchUser = async () => {
        try {
            // Si le token existe, la requête utilisera automatiquement le header Authorization
            const response = await useApiFetch('/api/user', {method: HttpMethods.GET})
            if (response && response.data) {
                user.value = response.data
                isAuthenticated.value = true
                return true
            } else {
                user.value = null
                isAuthenticated.value = false
                authToken.value = null
                return false
            }
        } catch (error) {
            user.value = null
            isAuthenticated.value = false
            authToken.value = null
            return false
        }
    }

    const register = async (username: string, email: string, password: string, password_confirmation: string) => {
        const response = await useApiFetch('/api/register', {
            method: HttpMethods.POST,
            body: JSON.stringify({username, email, password, password_confirmation})
        })
        await handleResponse(response)
        return response
    }

    const login = async (email: string, password: string) => {
        const response = await useApiFetch('/api/login', {
            method: HttpMethods.POST,
            body: JSON.stringify({email, password})
        })
        await handleResponse(response)
        return response
    }

    const logout = async () => {
        try {
            // Appeler l'API de déconnexion si disponible
            if (authToken.value) {
                await useApiFetch('/api/logout', { method: HttpMethods.POST })
            }
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error)
        } finally {
            // Nettoyer les données locales même si la requête échoue
            user.value = null
            isAuthenticated.value = false
            authToken.value = null
        }
    }

    const handleResponse = async (response: any) => {
        if (response && response.status === 'success' && response.data) {
            // Stocker le token
            if (response.data.token) {
                authToken.value = response.data.token
            }
            // Stocker les données utilisateur directement
            if (response.data.user) {
                user.value = response.data.user
                isAuthenticated.value = true
            } else {
                // Si les données utilisateur ne sont pas incluses dans la réponse
                await fetchUser()
            }
        }
    }

    const initAuth = async () => {
        if (authToken.value) {
            return await fetchUser()
        }
        return false
    }

    return {
        user,
        isAuthenticated,
        authToken,
        register,
        login,
        logout,
        fetchUser,
        initAuth
    }
}
