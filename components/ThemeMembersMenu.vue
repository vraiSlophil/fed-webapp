<script setup lang="ts">
import type {Theme} from '~/types/themes'
import type {PermissionPreset, ThemeMember, ThemeMemberPermissions} from '~/types/themeMembers'
import {useThemeMembers} from '~/composables/useThemeMembers'

const props = defineProps<{
  visible: boolean
  theme: Theme
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const {
  members,
  searchResults,
  loading,
  searchLoading,
  error,
  searchError,
  permissionPresets,
  getCurrentPreset,
  getStatusLabel,
  getStatusSeverity,
  debouncedSearchUsers,
  fetchMembers,
  inviteUser,
  updateMemberPermissions,
  deactivateMember,
  reactivateMember,
  removeMember
} = useThemeMembers()

// État local
const popoverRef = ref(null)
const searchQuery = ref('')
const showInviteForm = ref(false)
const selectedUser = ref<any>(null)
const selectedPreset = ref<PermissionPreset>('read')
const customPermissions = ref<ThemeMemberPermissions>({
  can_view: true,
  can_update_theme: false,
  can_add_task: false,
  can_edit_task: false,
  can_delete_task: false,
  can_validate_task: false
})

// États pour les confirmations
const memberToDelete = ref<ThemeMember | null>(null)
const memberToDeactivate = ref<ThemeMember | null>(null)
const showDeleteConfirm = ref(false)
const showDeactivateConfirm = ref(false)

// États pour l'édition des permissions
const editingMember = ref<ThemeMember | null>(null)
const showPermissionsEdit = ref(false)

// Exposer les méthodes du popover
defineExpose({
  show: (event: any) => popoverRef.value?.show(event),
  hide: () => popoverRef.value?.hide(),
  toggle: (event: any) => popoverRef.value?.toggle(event)
})


// Charger les membres quand le menu devient visible
watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    fetchMembers(props.theme.theme_id)
  }
})

// Gérer la recherche
watch(searchQuery, (newQuery) => {
  if (newQuery.length >= 3) {
    debouncedSearchUsers(newQuery)
  }
})

// Permissions actuelles pour l'invitation
const currentInvitePermissions = computed(() => {
  if (selectedPreset.value === 'custom') {
    return customPermissions.value
  }
  return permissionPresets[selectedPreset.value]?.permissions
})

// Sélectionner un utilisateur pour l'invitation
const selectUserForInvite = (user: any) => {
  selectedUser.value = user
  showInviteForm.value = true
  searchQuery.value = ''
}

// Confirmer l'invitation
const confirmInvite = async () => {
  if (!selectedUser.value) return

  try {
    await inviteUser(props.theme.theme_id, selectedUser.value.user_id, currentInvitePermissions.value)
    resetInviteForm()
  } catch (error) {
    console.error('Erreur lors de l\'invitation:', error)
  }
}

// Réinitialiser le formulaire d'invitation
const resetInviteForm = () => {
  selectedUser.value = null
  showInviteForm.value = false
  selectedPreset.value = 'read'
  customPermissions.value = {
    can_view: true,
    can_update_theme: false,
    can_add_task: false,
    can_edit_task: false,
    can_delete_task: false,
    can_validate_task: false
  }
}

// Changer le preset de permissions
const changePreset = (preset: PermissionPreset) => {
  selectedPreset.value = preset
  if (preset !== 'custom') {
    customPermissions.value = {...permissionPresets[preset].permissions}
  }
}

// Commencer l'édition des permissions
const startEditPermissions = (member: ThemeMember) => {
  editingMember.value = member
  selectedPreset.value = getCurrentPreset(member.permissions)
  customPermissions.value = {...member.permissions}
  showPermissionsEdit.value = true
}

// Confirmer l'édition des permissions
const confirmEditPermissions = async () => {
  if (!editingMember.value) return

  try {
    await updateMemberPermissions(
        props.theme.theme_id,
        editingMember.value.user_id,
        currentInvitePermissions.value
    )
    showPermissionsEdit.value = false
    editingMember.value = null
  } catch (error) {
    console.error('Erreur lors de la mise à jour des permissions:', error)
  }
}

// Annuler l'édition des permissions
const cancelEditPermissions = () => {
  showPermissionsEdit.value = false
  editingMember.value = null
}

// Confirmer la désactivation
const confirmDeactivation = (member: ThemeMember) => {
  memberToDeactivate.value = member
  showDeactivateConfirm.value = true
}

const handleDeactivate = async () => {
  if (!memberToDeactivate.value) return

  const success = await deactivateMember(props.theme.theme_id, memberToDeactivate.value.user_id)
  if (success) {
    showDeactivateConfirm.value = false
    memberToDeactivate.value = null
  }
}

// Réactiver un membre
const handleReactivate = async (member: ThemeMember) => {
  await reactivateMember(props.theme.theme_id, member.user_id)
}

// Confirmer la suppression
const confirmDeletion = (member: ThemeMember) => {
  memberToDelete.value = member
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  if (!memberToDelete.value) return

  const success = await removeMember(props.theme.theme_id, memberToDelete.value.user_id)
  if (success) {
    showDeleteConfirm.value = false
    memberToDelete.value = null
  }
}

// Formater le nom d'affichage
const getDisplayName = (member: ThemeMember) => {
  if (member.first_name && member.last_name) {
    return `${member.first_name} ${member.last_name}`
  }
  return member.username
}

// Obtenir les permissions lisibles
const getReadablePermissions = (permissions: ThemeMemberPermissions) => {
  const readable = []
  if (permissions.can_view) readable.push('Lecture')
  if (permissions.can_update_theme) readable.push('Modifier le thème')
  if (permissions.can_add_task) readable.push('Ajouter des tâches')
  if (permissions.can_edit_task) readable.push('Modifier les tâches')
  if (permissions.can_delete_task) readable.push('Supprimer les tâches')
  if (permissions.can_validate_task) readable.push('Valider les tâches')
  return readable.join(', ')
}
</script>

<template>
  <Popover
      ref="popoverRef"
      :visible="visible"
      @update:visible="emit('update:visible', $event)"
      target="prev"
      class="w-96"
  >
    <div class="p-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">Membres du thème</h3>
        <Button
            @click="emit('update:visible', false)"
            text
            size="small"
            class="p-2"
        >
          <span class="material-symbols-rounded text-sm">close</span>
        </Button>
      </div>

      <!-- Barre de recherche -->
      <div class="mb-4">
        <div class="relative">
          <InputText
              v-model="searchQuery"
              placeholder="Rechercher un utilisateur..."
              class="w-full pl-10"
              :loading="searchLoading"
          />
          <span class="material-symbols-rounded absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        search
                    </span>
        </div>

        <!-- Résultats de recherche -->
        <div v-if="searchResults.length > 0" class="mt-2 border rounded-lg max-h-32 overflow-y-auto">
          <div
              v-for="user in searchResults"
              :key="user.user_id"
              @click="selectUserForInvite(user)"
              class="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-3"
          >
            <div
                class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
              <img
                  v-if="user.avatar_url"
                  :src="user.avatar_url"
                  :alt="user.username"
                  class="w-full h-full object-cover"
              />
              <span v-else class="material-symbols-rounded text-sm">person</span>
            </div>
            <div>
              <div class="font-medium">{{ user.username }}</div>
              <div class="text-sm text-gray-500">{{ user.email }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulaire d'invitation -->
      <div v-if="showInviteForm" class="mb-4 border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
        <div class="flex items-center gap-3 mb-3">
          <div
              class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            <img
                v-if="selectedUser?.avatar_url"
                :src="selectedUser.avatar_url"
                :alt="selectedUser.username"
                class="w-full h-full object-cover"
            />
            <span v-else class="material-symbols-rounded text-sm">person</span>
          </div>
          <div>
            <div class="font-medium">{{ selectedUser?.username }}</div>
            <div class="text-sm text-gray-500">{{ selectedUser?.email }}</div>
          </div>
        </div>

        <!-- Sélection du preset de permissions -->
        <div class="mb-3">
          <label class="block text-sm font-medium mb-2">Niveau d'accès</label>
          <div class="grid grid-cols-2 gap-2">
            <Button
                v-for="(preset, key) in permissionPresets"
                :key="key"
                @click="changePreset(key as PermissionPreset)"
                :outlined="selectedPreset !== key"
                :severity="selectedPreset === key ? 'primary' : 'secondary'"
                size="small"
                class="justify-start"
            >
              <span class="material-symbols-rounded text-sm mr-2">{{ preset.icon }}</span>
              {{ preset.label }}
            </Button>
          </div>
        </div>

        <!-- Permissions personnalisées -->
        <div v-if="selectedPreset === 'custom'" class="mb-3">
          <label class="block text-sm font-medium mb-2">Permissions détaillées</label>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <Checkbox v-model="customPermissions.can_view" inputId="perm-view"/>
              <label for="perm-view" class="text-sm">Voir le thème</label>
            </div>
            <div class="flex items-center gap-2">
              <Checkbox v-model="customPermissions.can_update_theme" inputId="perm-update"/>
              <label for="perm-update" class="text-sm">Modifier le thème</label>
            </div>
            <div class="flex items-center gap-2">
              <Checkbox v-model="customPermissions.can_add_task" inputId="perm-add"/>
              <label for="perm-add" class="text-sm">Ajouter des tâches</label>
            </div>
            <div class="flex items-center gap-2">
              <Checkbox v-model="customPermissions.can_edit_task" inputId="perm-edit"/>
              <label for="perm-edit" class="text-sm">Modifier les tâches</label>
            </div>
            <div class="flex items-center gap-2">
              <Checkbox v-model="customPermissions.can_delete_task" inputId="perm-delete"/>
              <label for="perm-delete" class="text-sm">Supprimer les tâches</label>
            </div>
            <div class="flex items-center gap-2">
              <Checkbox v-model="customPermissions.can_validate_task" inputId="perm-validate"/>
              <label for="perm-validate" class="text-sm">Valider les tâches</label>
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <Button
              @click="confirmInvite"
              size="small"
              :loading="loading"
          >
            Inviter
          </Button>
          <Button
              @click="resetInviteForm"
              size="small"
              outlined
              :disabled="loading"
          >
            Annuler
          </Button>
        </div>
      </div>

      <!-- Liste des membres -->
      <div v-if="loading" class="text-center py-4">
        <i class="pi pi-spinner pi-spin"></i>
        <p class="text-sm text-gray-500 mt-2">Chargement des membres...</p>
      </div>

      <div v-else-if="error" class="text-center py-4">
        <p class="text-sm text-red-500">{{ error }}</p>
      </div>

      <div v-else class="space-y-3">
        <div
            v-for="member in members"
            :key="member.user_id"
            class="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                  class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                <img
                    v-if="member.avatar_url"
                    :src="member.avatar_url"
                    :alt="member.username"
                    class="w-full h-full object-cover"
                />
                <span v-else class="material-symbols-rounded">person</span>
              </div>
              <div>
                <div class="font-medium">{{ getDisplayName(member) }}</div>
                <div class="text-sm text-gray-500">{{ member.email }}</div>
                <div class="flex items-center gap-2 mt-1">
                  <Tag
                      :severity="getStatusSeverity(member.status)"
                      size="small"
                  >
                    {{ getStatusLabel(member.status) }}
                  </Tag>
                  <Button
                      v-if="member.status !== 'owner'"
                      @click="startEditPermissions(member)"
                      text
                      size="small"
                      class="p-1"
                      title="Voir les permissions"
                  >
                    <span class="material-symbols-rounded text-sm">help_outline</span>
                  </Button>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div v-if="member.status !== 'owner'" class="flex items-center gap-1">
              <Button
                  @click="startEditPermissions(member)"
                  text
                  size="small"
                  class="p-2"
                  title="Modifier les permissions"
              >
                <span class="material-symbols-rounded text-sm">edit</span>
              </Button>

              <Button
                  v-if="member.status === 'active'"
                  @click="confirmDeactivation(member)"
                  text
                  size="small"
                  class="p-2"
                  title="Désactiver"
              >
                <span class="material-symbols-rounded text-sm">block</span>
              </Button>

              <Button
                  v-if="member.status === 'revoked'"
                  @click="handleReactivate(member)"
                  text
                  size="small"
                  class="p-2"
                  title="Réactiver"
                  :loading="loading"
              >
                <span class="material-symbols-rounded text-sm">check_circle</span>
              </Button>

              <Button
                  @click="confirmDeletion(member)"
                  text
                  size="small"
                  class="p-2 text-red-500 hover:text-red-600"
                  title="Supprimer"
              >
                <span class="material-symbols-rounded text-sm">delete</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog d'édition des permissions -->
    <Dialog
        v-model:visible="showPermissionsEdit"
        modal
        :header="editingMember ? `Permissions de ${getDisplayName(editingMember)}` : 'Permissions'"
        class="w-96"
    >
      <div v-if="editingMember">
        <!-- Sélection du preset -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Niveau d'accès</label>
          <div class="grid grid-cols-2 gap-2">
            <Button
                v-for="(preset, key) in permissionPresets"
                :key="key"
                @click="changePreset(key as PermissionPreset)"
                :outlined="selectedPreset !== key"
                :severity="selectedPreset === key ? 'primary' : 'secondary'"
                size="small"
                class="justify-start"
            >
              <span class="material-symbols-rounded text-sm mr-2">{{ preset.icon }}</span>
              {{ preset.label }}
            </Button>
          </div>
        </div>

        <!-- Permissions détaillées -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Permissions détaillées</label>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <Checkbox v-model="customPermissions.can_view" inputId="edit-perm-view"/>
              <label for="edit-perm-view" class="text-sm">Voir le thème</label>
            </div>
            <div class="flex items-center gap-2">
              <Checkbox v-model="customPermissions.can_update_theme" inputId="edit-perm-update"/>
              <label for="edit-perm-update" class="text-sm">Modifier le thème</label>
            </div>
            <div class="flex items-center gap-2">
              <Checkbox v-model="customPermissions.can_add_task" inputId="edit-perm-add"/>
              <label for="edit-perm-add" class="text-sm">Ajouter des tâches</label>
            </div>
            <div class="flex items-center gap-2">
              <Checkbox v-model="customPermissions.can_edit_task" inputId="edit-perm-edit"/>
              <label for="edit-perm-edit" class="text-sm">Modifier les tâches</label>
            </div>
            <div class="flex items-center gap-2">
              <Checkbox v-model="customPermissions.can_delete_task" inputId="edit-perm-delete"/>
              <label for="edit-perm-delete" class="text-sm">Supprimer les tâches</label>
            </div>
            <div class="flex items-center gap-2">
              <Checkbox v-model="customPermissions.can_validate_task" inputId="edit-perm-validate"/>
              <label for="edit-perm-validate" class="text-sm">Valider les tâches</label>
            </div>
          </div>
        </div>

        <div class="flex gap-2 justify-end">
          <Button
              @click="cancelEditPermissions"
              outlined
              size="small"
              :disabled="loading"
          >
            Annuler
          </Button>
          <Button
              @click="confirmEditPermissions"
              size="small"
              :loading="loading"
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </Dialog>

    <!-- Confirmation de désactivation -->
    <Dialog
        v-model:visible="showDeactivateConfirm"
        modal
        header="Confirmer la désactivation"
        class="w-96"
    >
      <div v-if="memberToDeactivate">
        <p class="mb-4">
          Êtes-vous sûr de vouloir désactiver {{ getDisplayName(memberToDeactivate) }} ?
          Cette personne ne pourra plus accéder au thème.
        </p>
        <div class="flex gap-2 justify-end">
          <Button
              @click="showDeactivateConfirm = false"
              outlined
              size="small"
              :disabled="loading"
          >
            Annuler
          </Button>
          <Button
              @click="handleDeactivate"
              severity="warning"
              size="small"
              :loading="loading"
          >
            Désactiver
          </Button>
        </div>
      </div>
    </Dialog>

    <!-- Confirmation de suppression -->
    <Dialog
        v-model:visible="showDeleteConfirm"
        modal
        header="Confirmer la suppression"
        class="w-96"
    >
      <div v-if="memberToDelete">
        <p class="mb-4">
          Êtes-vous sûr de vouloir supprimer {{ getDisplayName(memberToDelete) }} ?
          Cette action est irréversible.
        </p>
        <div class="flex gap-2 justify-end">
          <Button
              @click="showDeleteConfirm = false"
              outlined
              size="small"
              :disabled="loading"
          >
            Annuler
          </Button>
          <Button
              @click="handleDelete"
              severity="danger"
              size="small"
              :loading="loading"
          >
            Supprimer
          </Button>
        </div>
      </div>
    </Dialog>
  </Popover>
</template>