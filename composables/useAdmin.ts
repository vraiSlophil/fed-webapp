import type {
    User,
    Role,
    UserResponse,
    UserSpecificMetrics,
    UsersMetrics,
    UserDetailsResponse
} from '~/types/user'
import { HttpMethods } from '~/utils/httpMethods'

export const useAdmin = () => {
    // États réactifs
    const users = ref<User[]>([])
    const selectedUser = ref<User | null>(null)
    const userMetrics = ref<UserSpecificMetrics | null>(null)
    const roles = ref<Role[]>([])
    const globalStats = ref<UsersMetrics | null>(null)
    const loading = ref(false)
    const totalUsers = ref(0)
    const currentPage = ref(1)

    // Filtres
    const searchQuery = ref('')
    const selectedRole = ref<number | null>(null)
    const selectedStatus = ref<string>('')

    // Variables pour la suppression
    const userToDelete = ref<User | null>(null)

    // Méthodes de récupération de données (avec throw)
    const fetchUsers = async () => {
        loading.value = true
        try {
            const config = useRuntimeConfig()
            const params = new URLSearchParams()
            if (searchQuery.value) params.append('search', searchQuery.value)
            if (selectedRole.value) params.append('role', selectedRole.value.toString())
            if (selectedStatus.value) params.append('status', selectedStatus.value)
            params.append('page', currentPage.value.toString())

            const response = (await useApiFetch(`/api/admin/users?${params.toString()}`) as any).data as UserResponse
            users.value = response.users.map(user => {
                return {
                    ...user,
                    avatar_path: user.avatar_path ? `${config.public.BACKEND_URL}/api/media/${user.avatar_path}` : null
                }
            })
            roles.value = response.roles.map(role => {
                return {
                    ...role,
                    name: role.name.charAt(0).toUpperCase() + role.name.slice(1)
                }
            })
            globalStats.value = response.stats
            totalUsers.value = response.pagination.total
        } catch (error: any) {
            throw new Error(error.message || 'Erreur lors du chargement des utilisateurs')
        } finally {
            loading.value = false
        }
    }

    const fetchUserDetails = async (user: User) => {
        try {
            const response = (await useApiFetch(`/api/admin/users/${user.user_id}`) as any).data as UserDetailsResponse
            selectedUser.value = (() => {
                const userData = response.user
                return {
                    ...userData,
                    avatar_path: userData.avatar_path ? `${useRuntimeConfig().public.BACKEND_URL}/api/media/${userData.avatar_path}` : null
                }
            })()
            userMetrics.value = response.additional_stats
        } catch (error: any) {
            throw new Error(error.message || 'Erreur lors du chargement des détails')
        }
    }

    // Autres méthodes (gardent leurs noms actuels)
    const confirmDeleteUser = (user: User) => {
        userToDelete.value = user
        return userToDelete.value
    }

    const createUser = async (formData: FormData) => {
        try {
            await useApiFetch('/api/admin/users', {
                method: HttpMethods.POST,
                body: formData
            })
            await fetchUsers()
        } catch (error: any) {
            throw new Error(error.message || 'Erreur lors de la création')
        }
    }

    const updateUser = async (userId: string, formData: FormData) => {
        try {
            await useApiFetch(`/api/admin/users/${userId}`, {
                method: HttpMethods.POST,
                body: formData
            })
            await fetchUsers()
        } catch (error: any) {
            throw new Error(error.message || 'Erreur lors de la modification')
        }
    }

    const deleteUser = async (userId: string) => {
        try {
            await useApiFetch(`/api/admin/users/${userId}`, {
                method: HttpMethods.DELETE
            })
            await fetchUsers()
        } catch (error: any) {
            throw new Error(error.message || 'Erreur lors de la suppression')
        }
    }

    const blockUser = async (userId: string) => {
        try {
            await useApiFetch(`/api/admin/users/${userId}/block`, {
                method: HttpMethods.POST
            })
            await fetchUsers()
        } catch (error: any) {
            throw new Error(error.message || 'Erreur lors du blocage')
        }
    }

    const unblockUser = async (userId: string) => {
        try {
            await useApiFetch(`/api/admin/users/${userId}/unblock`, {
                method: HttpMethods.POST
            })
            await fetchUsers()
        } catch (error: any) {
            throw new Error(error.message || 'Erreur lors du déblocage')
        }
    }

    const verifyUser = async (userId: string) => {
        try {
            await useApiFetch(`/api/admin/users/${userId}/verify`, {
                method: HttpMethods.POST
            })
            await fetchUsers()
        } catch (error: any) {
            throw new Error(error.message || 'Erreur lors de la vérification')
        }
    }

    // Méthodes utilitaires
    const resetFilters = () => {
        searchQuery.value = ''
        selectedRole.value = null
        selectedStatus.value = ''
        currentPage.value = 1
    }

    const setPage = (page: number) => {
        currentPage.value = page
    }

    const setSearchQuery = (query: string) => {
        searchQuery.value = query
        currentPage.value = 1 // Reset à la première page lors d'une recherche
    }

    const setRoleFilter = (roleId: number | null) => {
        selectedRole.value = roleId
        currentPage.value = 1
    }

    const setStatusFilter = (status: string) => {
        selectedStatus.value = status
        currentPage.value = 1
    }

    return {
        // États
        users: readonly(users),
        selectedUser: readonly(selectedUser),
        userMetrics: readonly(userMetrics),
        roles: readonly(roles),
        globalStats: readonly(globalStats),
        loading: readonly(loading),
        totalUsers: readonly(totalUsers),
        currentPage: readonly(currentPage),
        searchQuery: readonly(searchQuery),
        selectedRole: readonly(selectedRole),
        selectedStatus: readonly(selectedStatus),
        userToDelete: readonly(userToDelete),

        // Méthodes de récupération
        fetchUsers,
        fetchUserDetails,

        // Autres méthodes
        confirmDeleteUser,
        createUser,
        updateUser,
        deleteUser,
        blockUser,
        unblockUser,
        verifyUser,

        // Méthodes utilitaires
        resetFilters,
        setPage,
        setSearchQuery,
        setRoleFilter,
        setStatusFilter
    }
}
