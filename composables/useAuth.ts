import type {User} from "~/types/user";

const user = ref<User | null>(null)
const isAuthenticated = ref(false)

export function useAuth() {
  const register = async (username: string, email: string, password: string, password_confirmation: string) => {
    const response = await useApiFetch('/api/register', {
      method: HttpMethod.POST,
      body: JSON.stringify({ username, email, password, password_confirmation })
    })
    if (response && response.user) {
      user.value = response.user
      isAuthenticated.value = true
    }
    return response
  }

  const login = async (email: string, password: string) => {
    const response = await useApiFetch('/api/login', {
      method: HttpMethod.POST,
      body: JSON.stringify({ email, password })
    })
    if (response && response.user) {
      user.value = response.user
      isAuthenticated.value = true
    }
    return response
  }

  const logout = () => {
    user.value = null
    isAuthenticated.value = false
    // Appeller l'API de déconnexion si nécessaire
  }

  return {
    user,
    isAuthenticated,
    register,
    login,
    logout
  }
}