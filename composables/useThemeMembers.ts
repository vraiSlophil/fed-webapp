import {useApiFetch} from './useApiFetch'
import type {
    PermissionPreset,
    PermissionPresetConfig,
    ThemeMember,
    ThemeMemberPermissions,
    ThemeMemberUser
} from '~/types/themeMembers'
import {HttpMethods} from '~/utils/httpMethods'

export const useThemeMembers = () => {
    const members = ref<ThemeMember[]>([])
    const searchResults = ref<ThemeMemberUser[]>([])
    const loading = ref(false)
    const searchLoading = ref(false)

    // Presets de permissions
    const permissionPresets: Record<PermissionPreset, PermissionPresetConfig> = {
        read: {
            label: 'Lecture',
            icon: 'visibility',
            permissions: {
                can_view: true,
                can_update_theme: false,
                can_add_task: false,
                can_edit_task: false,
                can_delete_task: false,
                can_validate_task: false
            }
        },
        edit: {
            label: 'Édition',
            icon: 'edit',
            permissions: {
                can_view: true,
                can_update_theme: false,
                can_add_task: true,
                can_edit_task: true,
                can_delete_task: false,
                can_validate_task: true
            }
        },
        full: {
            label: 'Accès complet',
            icon: 'admin_panel_settings',
            permissions: {
                can_view: true,
                can_update_theme: true,
                can_add_task: true,
                can_edit_task: true,
                can_delete_task: true,
                can_validate_task: true
            }
        },
        custom: {
            label: 'Personnalisé',
            icon: 'tune',
            permissions: {
                can_view: true,
                can_update_theme: false,
                can_add_task: false,
                can_edit_task: false,
                can_delete_task: false,
                can_validate_task: false
            }
        }
    }

    // Déterminer le preset actuel pour un ensemble de permissions
    const getCurrentPreset = (permissions: ThemeMemberPermissions): PermissionPreset => {
        for (const [preset, config] of Object.entries(permissionPresets)) {
            if (preset === 'custom') continue

            const matches = Object.keys(config.permissions).every(key =>
                permissions[key as keyof ThemeMemberPermissions] ===
                config.permissions[key as keyof ThemeMemberPermissions]
            )

            if (matches) return preset as PermissionPreset
        }
        return 'custom'
    }

    // Obtenir le label du statut
    const getStatusLabel = (status: ThemeMember['status']) => {
        const labels = {
            owner: 'Propriétaire',
            active: 'Actif',
            invited: 'Invité',
            revoked: 'Désactivé'
        }
        return labels[status]
    }

    // Obtenir la sévérité du statut pour les Tags
    const getStatusSeverity = (status: ThemeMember['status']) => {
        const severityMap = {
            owner: 'success',
            active: 'info',
            invited: 'warning',
            revoked: 'secondary'
        }
        return severityMap[status]
    }

    // Rechercher des utilisateurs
    const searchUsers = async (query: string, themeId: string) => {
        if (query.length < 3) {
            searchResults.value = []
            return
        }

        searchLoading.value = true

        try {
            const response = await useApiFetch(`/api/users/search?search=${query}&theme_id=${themeId}`, {
                method: HttpMethods.GET,
                headers: {
                    'Content-Type': 'application/json'
                }
            }) as { data: { users: ThemeMemberUser[] } }

            searchResults.value = response.data.users
                .map(member => {
                    //vérifier que avatar_url est défini, si oui ajouter back/api/media/ devant
                    const config = useRuntimeConfig()
                    return ({
                        ...member,
                        avatar_url: member.avatar_url ? `${config.public.BACKEND_URL}/api/media/${member.avatar_url}` : null
                    } as ThemeMember)

                })
        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || 'Erreur lors de la recherche d\'utilisateurs');
        } finally {
            searchLoading.value = false
        }
    }

    // Recherche avec debounce
    const searchTimeout = ref<NodeJS.Timeout>()
    const debouncedSearchUsers = (query: string, themeId: string) => {
        clearTimeout(searchTimeout.value)
        searchTimeout.value = setTimeout(async () => {
            await searchUsers(query, themeId)
        }, 300)
    }

    // Lister les membres d'un thème
    const fetchMembers = async (themeId: string) => {
        loading.value = true

        try {
            const response = await useApiFetch(`/api/themes/${themeId}/members`, {
                method: HttpMethods.GET
            }) as { data: { members: ThemeMember[] } }

            members.value = response.data.members
                .map(member => {
                //vérifier que avatar_url est défini, si oui ajouter back/api/media/ devant
                const config = useRuntimeConfig()
                return ({
                    ...member,
                    avatar_url: member.avatar_url ? `${config.public.BACKEND_URL}/api/media/${member.avatar_url}` : null
                } as ThemeMember)

            })
        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || 'Erreur lors de la récupération des membres du thème');
        } finally {
            loading.value = false
        }
    }

    // Inviter un utilisateur
    const inviteUser = async (themeId: string, userId: string, permissions: ThemeMemberPermissions) => {
        loading.value = true

        try {
            const response = await useApiFetch(`/api/themes/${themeId}/members`, {
                method: HttpMethods.POST,
                body: JSON.stringify({
                    user_id: userId,
                    ...permissions
                })
            }) as { data: { invitation: ThemeMember } }

            // Ajouter le nouveau membre à la liste
            members.value.push(response.data.invitation)

            // Vider les résultats de recherche
            searchResults.value = []

            return response.data.invitation

        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || 'Erreur lors de l\'invitation de l\'utilisateur');
        } finally {
            loading.value = false
        }
    }

    // Mettre à jour les permissions d'un membre
    const updateMemberPermissions = async (themeId: string, userId: string, permissions: ThemeMemberPermissions) => {
        loading.value = true

        try {
            const response = await useApiFetch(`/api/themes/${themeId}/members/${userId}`, {
                method: HttpMethods.PUT,
                body: JSON.stringify(permissions)
            }) as { data: { permissions: ThemeMemberPermissions } }

            // Mettre à jour le membre dans la liste
            const memberIndex = members.value.findIndex(m => m.user_id === userId)
            if (memberIndex !== -1) {
                members.value[memberIndex].permissions = response.data.permissions
            }

            return response.data.permissions
        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || 'Erreur lors de la mise à jour des permissions du membre');
        } finally {
            loading.value = false
        }
    }

    // Désactiver un membre
    const deactivateMember = async (themeId: string, userId: string) => {
        loading.value = true

        try {
            await useApiFetch(`/api/themes/${themeId}/members/${userId}/deactivate`, {
                method: HttpMethods.POST
            })

            // Mettre à jour le statut du membre dans la liste
            const memberIndex = members.value.findIndex(m => m.user_id === userId)
            if (memberIndex !== -1) {
                members.value[memberIndex].status = 'revoked'
            }

            return true
        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || 'Erreur lors de la désactivation du membre');
        } finally {
            loading.value = false
        }
    }

    // Réactiver un membre
    const reactivateMember = async (themeId: string, userId: string) => {
        loading.value = true

        try {
            await useApiFetch(`/api/themes/${themeId}/members/${userId}/reactivate`, {
                method: HttpMethods.POST
            })

            // Mettre à jour le statut du membre dans la liste
            const memberIndex = members.value.findIndex(m => m.user_id === userId)
            if (memberIndex !== -1) {
                members.value[memberIndex].status = 'active'
            }

            return true
        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || 'Erreur lors de la réactivation du membre');
        } finally {
            loading.value = false
        }
    }

    // Supprimer un membre
    const removeMember = async (themeId: string, userId: string) => {
        loading.value = true

        try {
            await useApiFetch(`/api/themes/${themeId}/members/${userId}`, {
                method: HttpMethods.DELETE
            })

            // Supprimer le membre de la liste
            members.value = members.value.filter(m => m.user_id !== userId)

            return true
        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || 'Erreur lors de la suppression du membre');
        } finally {
            loading.value = false
        }
    }

    // Quitter un thème
    const leaveTheme = async (themeId: string) => {
        loading.value = true

        try {
            await useApiFetch(`/api/themes/${themeId}/leave`, {
                method: HttpMethods.POST
            })

            return true
        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || 'Erreur lors de la sortie du thème');
        } finally {
            loading.value = false
        }
    }

    return {
        members,
        searchResults,
        loading,
        searchLoading,
        permissionPresets,
        getCurrentPreset,
        getStatusLabel,
        getStatusSeverity,
        searchUsers,
        debouncedSearchUsers,
        fetchMembers,
        inviteUser,
        updateMemberPermissions,
        deactivateMember,
        reactivateMember,
        removeMember,
        leaveTheme
    }
}