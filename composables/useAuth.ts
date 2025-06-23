import type {User} from "~/types/user";

const user = useState<User | null>('user', () => null)
const isAuthenticated = useState<boolean>('isAuthenticated', () => false)

export function useAuth() {
    const register = async (username: string, email: string, password: string, password_confirmation: string) => {
        const response = await useApiFetch('/api/register', {
            method: HttpMethod.POST,
            body: JSON.stringify({username, email, password, password_confirmation})
        })
        if (response && response.status === 'success' && response.data) {
            const {user: userRef} = await useUser()
            user.value = userRef.value
            isAuthenticated.value = true
        }
        return response
    }

    const login = async (email: string, password: string) => {
        const response = await useApiFetch('/api/login', {
            method: HttpMethod.POST,
            body: JSON.stringify({email, password})
        })
        if (response && response.status === 'success' && response.data) {
            const {user: userRef} = await useUser()
            user.value = userRef.value
            isAuthenticated.value = true
        }
        return response
    }

    const logout = async () => {
        user.value = null
        isAuthenticated.value = false
    }

    return {
        user,
        isAuthenticated,
        register,
        login,
        logout
    }
}