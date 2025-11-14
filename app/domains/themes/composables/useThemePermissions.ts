import type { Theme } from '~/types/theme'
import type { ThemeMemberPermissions } from '~/types/themeMembers'
import {useAuth} from "~/domains/auth/composables/useAuth";

export const useThemePermissions = (theme: Ref<Theme> | ComputedRef<Theme>) => {
  const { user } = useAuth()
  
  // Vérifier si l'utilisateur est le propriétaire du thème
  const isOwner = computed(() => {
    return user.value?.user_id === theme.value.owner_id
  })
  
  // Fonction générique pour vérifier une permission spécifique
  const hasPermission = (permission: keyof ThemeMemberPermissions) => {
    // Si l'utilisateur est propriétaire, il a tous les droits
    if (isOwner.value) return true
    
    // Si permissions n'existe pas ou si la permission spécifique n'est pas définie, retourne false
    return !!theme.value.permissions?.[permission]
  }
  
  // Permissions spécifiques couramment utilisées
  const canUpdateTheme = computed(() => hasPermission('can_update_theme'))
  const canAddTask = computed(() => hasPermission('can_add_task'))
  const canEditTask = computed(() => hasPermission('can_edit_task'))
  const canDeleteTask = computed(() => hasPermission('can_delete_task'))
  const canValidateTask = computed(() => hasPermission('can_validate_task'))
  
  return {
    isOwner,
    hasPermission,
    canUpdateTheme,
    canAddTask,
    canEditTask,
    canDeleteTask,
    canValidateTask
  }
}
