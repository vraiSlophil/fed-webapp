<script setup lang="ts">
import type {Theme} from '~/types/themes'
import type {ThemeMember, ThemeMemberPermissions} from '~/types/themeMembers'
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
const searchQuery = ref('')
const selectedUser = ref<any>(null)

// États pour les confirmations
const memberToDelete = ref<ThemeMember | null>(null)
const memberToDeactivate = ref<ThemeMember | null>(null)
const showDeleteConfirm = ref(false)
const showDeactivateConfirm = ref(false)

// États pour les composants de permissions
const showInvitePermissions = ref(false)
const showEditPermissions = ref(false)
const editingMember = ref<ThemeMember | null>(null)

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

// Sélectionner un utilisateur pour l'invitation
const selectUserForInvite = (user: any) => {
  selectedUser.value = user
  showInvitePermissions.value = true
  searchQuery.value = ''
}

// Confirmer l'invitation
const confirmInvite = async (permissions: ThemeMemberPermissions) => {
  if (!selectedUser.value) return

  try {
    await inviteUser(props.theme.theme_id, selectedUser.value.user_id, permissions)
    showInvitePermissions.value = false
    selectedUser.value = null
  } catch (error) {
    console.error('Erreur lors de l\'invitation:', error)
  }
}

// Annuler l'invitation
const cancelInvite = () => {
  showInvitePermissions.value = false
  selectedUser.value = null
}

// Commencer l'édition des permissions
const startEditPermissions = (member: ThemeMember) => {
  editingMember.value = member
  showEditPermissions.value = true
}

// Confirmer l'édition des permissions
const confirmEditPermissions = async (permissions: ThemeMemberPermissions) => {
  if (!editingMember.value) return

  try {
    await updateMemberPermissions(
        props.theme.theme_id,
        editingMember.value.user_id,
        permissions
    )
    showEditPermissions.value = false
    editingMember.value = null
  } catch (error) {
    console.error('Erreur lors de la mise à jour des permissions:', error)
  }
}

// Annuler l'édition des permissions
const cancelEditPermissions = () => {
  showEditPermissions.value = false
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
</script>

<template>
  <Dialog
      :visible="visible"
      @update:visible="emit('update:visible', $event)"
      class="w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3"
      modal
  >
    <template #header>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">Membres du thème</h3>
      </div>
    </template>

    <Tabs value="0">
      <TabList>
        <Tab value="0">Membres</Tab>
        <Tab value="1">Inviter un membre</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <!-- Liste des membres -->
          <div v-if="loading" class="text-center py-4">
            <span class="material-symbols-rounded text-gray-400 !text-4xl animate-spin">
              progress_activity
            </span>
            <p class="text-sm text-gray-500 mt-2">Chargement des membres...</p>
          </div>

          <div v-else-if="error" class="text-center py-4">
            <p class="text-sm text-red-500">{{ error }}</p>
          </div>

          <div v-else>
            <div
                v-for="member in members"
                :key="member.user_id"
            >
              <Divider v-if="members.indexOf(member) > 0" />
              <div class="flex items-center justify-between py-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                    <img
                        v-if="member.avatar_url"
                        :src="member.avatar_url"
                        :alt="member.username"
                        class="w-full h-full object-cover"
                    />
                    <span v-else class="material-symbols-rounded">person</span>
                  </div>
                  <div class="flex-1 flex items-center justify-between gap-3">
                    <div class="flex flex-col gap-1 max-w-42 overflow-hidden text-ellipsis flex-nowrap">
                      <div
                          class="font-medium overflow-hidden text-ellipsis whitespace-nowrap"
                          :title="getDisplayName(member)"
                      >
                        {{ getDisplayName(member) }}
                      </div>
                      <div
                          class="text-sm text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap"
                          :title="member.email"
                      >
                        {{ member.email }}
                      </div>
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                      <Tag
                          :severity="getStatusSeverity(member.status)"
                          size="small"
                      >
                        {{ getStatusLabel(member.status) }}
                      </Tag>
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
        </TabPanel>
        <TabPanel value="1">
          <!-- Barre de recherche -->
          <div>
            <IconField class="mb-4 relative flex items-center justify-start">
              <span class="material-symbols-rounded text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2">
                search
              </span>
              <InputText
                  v-model="searchQuery"
                  placeholder="Rechercher un utilisateur..."
                  class="w-full pl-10"
                  :loading="searchLoading"
              />
            </IconField>

            <!-- Résultats de recherche -->
            <div v-if="searchResults.length > 0" class="overflow-y-auto">
              <div
                  v-for="user in searchResults"
                  :key="user.user_id"
              >
                <Divider v-if="searchResults.indexOf(user) > 0" />
                <div class="flex items-center justify-between py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
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
                  <div>
                    <Button
                        @click="selectUserForInvite(user)"
                        severity="primary"
                        size="small"
                        class="p-2"
                    >
                      Inviter
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>

    <!-- Composant pour l'invitation -->
    <ThemeMemberPermissionsEditor
        v-model:visible="showInvitePermissions"
        mode="invite"
        title="Inviter un membre"
        :user="selectedUser"
        :permission-presets="permissionPresets"
        :loading="loading"
        @confirm="confirmInvite"
        @cancel="cancelInvite"
    />

    <!-- Composant pour l'édition des permissions -->
    <ThemeMemberPermissionsEditor
        v-model:visible="showEditPermissions"
        mode="edit"
        :title="editingMember ? `Permissions de ${getDisplayName(editingMember)}` : 'Permissions'"
        :member="editingMember"
        :permission-presets="permissionPresets"
        :loading="loading"
        @confirm="confirmEditPermissions"
        @cancel="cancelEditPermissions"
    />

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
  </Dialog>
</template>