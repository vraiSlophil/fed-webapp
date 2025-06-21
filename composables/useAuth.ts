import type {User} from "~/types/user";

const user = ref<User | null>(null)
const isAuthenticated = ref(false)

export function useAuth() {
  const login = async (email: string, password: string) => {
    const response = await useApiFetch('/api/login', {
      method: 'POST',
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
    login,
    logout
  }
}