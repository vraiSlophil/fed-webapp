<script setup lang="ts">
import type { PermissionPreset, ThemeMember, ThemeMemberPermissions } from '~/types/themeMembers'

interface Props {
  visible: boolean
  title: string
  mode: 'invite' | 'edit'
  user?: any
  member?: ThemeMember
  permissionPresets: Record<PermissionPreset, any>
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', permissions: ThemeMemberPermissions): void
  (e: 'cancel'): void
}>()

// État simple
const selectedPreset = ref<PermissionPreset>('read')
const permissions = ref({
  can_view: true,
  can_update_theme: false,
  can_add_task: false,
  can_edit_task: false,
  can_delete_task: false,
  can_validate_task: false
})

// Initialiser quand le dialog s'ouvre
watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    if (props.mode === 'edit' && props.member) {
      // Mode édition : charger les permissions existantes
      permissions.value = { ...props.member.permissions }
      selectedPreset.value = 'custom'
    } else {
      // Mode invitation : permissions par défaut
      selectedPreset.value = 'read'
      permissions.value = {
        can_view: true,
        can_update_theme: false,
        can_add_task: false,
        can_edit_task: false,
        can_delete_task: false,
        can_validate_task: false
      }
    }
  }
})

// Changer le preset
const changePreset = (preset: PermissionPreset) => {
  selectedPreset.value = preset
  if (preset !== 'custom') {
    const presetData = props.permissionPresets[preset]
    if (presetData && presetData.permissions) {
      permissions.value = { ...presetData.permissions }
    }
  }
}

// Watcher pour détecter les changements manuels des checkboxes
watch(permissions, (newPermissions: any) => {
  // Chercher d'abord si les permissions correspondent à un preset existant
  let matchingPreset = null
  for (const [presetKey, presetData] of Object.entries(props.permissionPresets)) {
    if (presetData && presetData.permissions) {
      const match = Object.keys(presetData.permissions).every(key =>
          presetData.permissions[key] === newPermissions[key]
      )
      if (match) {
        matchingPreset = presetKey
        break
      }
    }
  }

  // Si on a trouvé un preset correspondant, le sélectionner
  if (matchingPreset) {
    selectedPreset.value = matchingPreset as PermissionPreset
  } else {
    // Sinon, passer en mode custom
    selectedPreset.value = 'custom'
  }
}, { deep: true })

// Confirmer
const confirmPermissions = () => {
  emit('confirm', permissions.value)
}

// Annuler
const cancel = () => {
  emit('cancel')
}

// Personne à afficher
const displayPerson = computed(() => {
  return props.mode === 'invite' ? props.user : props.member
})

// Nom d'affichage
const getDisplayName = (person: any) => {
  if (!person) return ''
  if (person.first_name && person.last_name) {
    return `${person.first_name} ${person.last_name}`
  }
  return person.username || ''
}
</script>

<template>
  <Dialog
      :visible="visible"
      @update:visible="emit('update:visible', $event)"
      modal
      :header="title"
      class="w-96"
  >
    <div v-if="displayPerson" class="flex items-center gap-3 mb-4">
      <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
        <img
            v-if="displayPerson.avatar_url"
            :src="displayPerson.avatar_url"
            :alt="displayPerson.username"
            class="w-full h-full object-cover"
        />
        <span v-else class="material-symbols-rounded text-sm">person</span>
      </div>
      <div>
        <div class="font-medium">{{ getDisplayName(displayPerson) }}</div>
        <div class="text-sm text-gray-500">{{ displayPerson.email }}</div>
      </div>
    </div>

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

    <!-- Permissions -->
    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">Permissions détaillées</label>
      <div class="gap-4 grid grid-cols-1 sm:grid-cols-2">
        <div class="relative flex items-center gap-2">
          <input
            type="checkbox"
            v-model="permissions.can_view"
            :id="`${mode}-view`"
            class="relative appearance-none h-5 w-5 border border-gray-600 hover:border-amber-400 rounded checked:bg-amber-500  focus:ring-amber-500 flex items-center justify-center cursor-pointer transition-colors"
          >
          <span
            v-if="permissions.can_view"
            class="material-symbols-rounded absolute pointer-events-none left-0 top-0 flex items-center justify-center h-5 w-5 cursor-pointer"
          >
            check
          </span>
          <label :for="`${mode}-view`" class="text-sm cursor-pointer">Voir le thème</label>
        </div>
        <div class="relative flex items-center gap-2">
          <input
            type="checkbox"
            v-model="permissions.can_update_theme"
            :id="`${mode}-update`"
            class="relative appearance-none h-5 w-5 border border-gray-600 hover:border-amber-400 rounded checked:bg-amber-500 focus:ring-amber-500 flex items-center justify-center cursor-pointer transition-colors"
          >
          <span
            v-if="permissions.can_update_theme"
            class="material-symbols-rounded absolute pointer-events-none left-0 top-0 flex items-center justify-center h-5 w-5 cursor-pointer"
          >
            check
          </span>
          <label :for="`${mode}-update`" class="text-sm cursor-pointer">Modifier le thème</label>
        </div>
        <div class="relative flex items-center gap-2">
          <input
            type="checkbox"
            v-model="permissions.can_add_task"
            :id="`${mode}-add`"
            class="relative appearance-none h-5 w-5 border border-gray-600 hover:border-amber-400 rounded checked:bg-amber-500 focus:ring-amber-500 flex items-center justify-center cursor-pointer transition-colors"
          >
          <span
            v-if="permissions.can_add_task"
            class="material-symbols-rounded absolute pointer-events-none left-0 top-0 flex items-center justify-center h-5 w-5 cursor-pointer"
          >
            check
          </span>
          <label :for="`${mode}-add`" class="text-sm cursor-pointer">Ajouter des tâches</label>
        </div>
        <div class="relative flex items-center gap-2">
          <input
            type="checkbox"
            v-model="permissions.can_edit_task"
            :id="`${mode}-edit`"
            class="relative appearance-none h-5 w-5 border border-gray-600 hover:border-amber-400 rounded checked:bg-amber-500 focus:ring-amber-500 flex items-center justify-center cursor-pointer transition-colors"
          >
          <span
            v-if="permissions.can_edit_task"
            class="material-symbols-rounded absolute pointer-events-none left-0 top-0 flex items-center justify-center h-5 w-5 cursor-pointer"
          >
            check
          </span>
          <label :for="`${mode}-edit`" class="text-sm cursor-pointer">Modifier les tâches</label>
        </div>
        <div class="relative flex items-center gap-2">
          <input
            type="checkbox"
            v-model="permissions.can_delete_task"
            :id="`${mode}-delete`"
            class="relative appearance-none h-5 w-5 border border-gray-600 hover:border-amber-400 rounded checked:bg-amber-500 focus:ring-amber-500 flex items-center justify-center cursor-pointer transition-colors"
          >
          <span
            v-if="permissions.can_delete_task"
            class="material-symbols-rounded absolute pointer-events-none left-0 top-0 flex items-center justify-center h-5 w-5 cursor-pointer"
          >
            check
          </span>
          <label :for="`${mode}-delete`" class="text-sm cursor-pointer">Supprimer les tâches</label>
        </div>
        <div class="relative flex items-center gap-2">
          <input
            type="checkbox"
            v-model="permissions.can_validate_task"
            :id="`${mode}-validate`"
            class="relative appearance-none h-5 w-5 border border-gray-600 hover:border-amber-400 rounded checked:bg-amber-500 focus:ring-amber-500 flex items-center justify-center cursor-pointer transition-colors"
          >
          <span
            v-if="permissions.can_validate_task"
            class="material-symbols-rounded absolute pointer-events-none left-0 top-0 flex items-center justify-center h-5 w-5 cursor-pointer"
          >
            check
          </span>
          <label :for="`${mode}-validate`" class="text-sm cursor-pointer">Valider les tâches</label>
        </div>
      </div>
    </div>

    <div class="flex gap-2 justify-end">
      <Button
          @click="cancel"
          outlined
          size="small"
          :disabled="loading"
      >
        Annuler
      </Button>
      <Button
          @click="confirmPermissions"
          size="small"
          :loading="loading"
      >
        {{ mode === 'invite' ? 'Inviter' : 'Enregistrer' }}
      </Button>
    </div>
  </Dialog>
</template>