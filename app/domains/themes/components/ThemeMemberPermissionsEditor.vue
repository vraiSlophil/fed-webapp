<script lang="ts" setup>
import type {PermissionPreset, ThemeMember, ThemeMemberPermissions} from '~/types/themeMembers'
import {useThemeMembers} from "~/domains/themes/composables/useThemeMembers";

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

// Composables
const {
	getCurrentPreset
} = useThemeMembers();

// Initialiser quand le dialog s'ouvre
watch(() => props.visible, (isVisible) => {
	if (isVisible) {
		if (props.mode === 'edit' && props.member) {
			// Mode édition : charger les permissions existantes
			permissions.value = {...props.member.permissions}
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
			permissions.value = {...presetData.permissions}
		}
	}
}

// Watcher pour détecter les changements manuels des checkboxes
watch(permissions, (newPermissions: any) => {
	selectedPreset.value = getCurrentPreset(newPermissions);
}, {deep: true})

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
		:header="title"
		:visible="visible"
		class="w-md"
		modal
		@update:visible="emit('update:visible', $event)"
	>
		<div v-if="displayPerson" class="flex items-center gap-3 mb-4">
			<div
				class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
				<img
					v-if="displayPerson.avatar_path"
					:alt="displayPerson.username"
					:src="displayPerson.avatar_path"
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
					:severity="selectedPreset === key ? 'primary' : 'secondary'"
					outlined
					rounded
					size="small"
					@click="changePreset(key as PermissionPreset)"
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
					<Button
						:severity="permissions.can_view ? 'primary' : 'secondary'"
						outlined
						rounded
						size="small"
						@click="permissions.can_view = !permissions.can_view"
						class="w-full"
					>
						<span v-if="permissions.can_view" class="material-symbols-rounded text-sm mr-2">visibility</span>
						<span v-else class="material-symbols-rounded text-sm mr-2">visibility_off</span>
						Voir le thème
					</Button>
				</div>
				<div class="relative flex items-center gap-2">
					<Button
						:severity="permissions.can_update_theme ? 'primary' : 'secondary'"
						outlined
						rounded
						size="small"
						@click="permissions.can_update_theme = !permissions.can_update_theme"
						class="w-full text-nowrap"
					>
						<span v-if="permissions.can_update_theme" class="material-symbols-rounded text-sm mr-2">edit</span>
						<span v-else class="material-symbols-rounded text-sm mr-2">edit_off</span>
						Modifier le thème
					</Button>
				</div>
				<div class="relative flex items-center gap-2">
					<Button
						:severity="permissions.can_add_task ? 'primary' : 'secondary'"
						outlined
						rounded
						size="small"
						@click="permissions.can_add_task = !permissions.can_add_task"
						class="w-full text-nowrap"
					>
						<span class="material-symbols-rounded text-sm mr-2">add</span>
						Ajouter des tâches
					</Button>
				</div>
				<div class="relative flex items-center gap-2">
					<Button
						:severity="permissions.can_edit_task ? 'primary' : 'secondary'"
						outlined
						rounded
						size="small"
						@click="permissions.can_edit_task = !permissions.can_edit_task"
						class="w-full text-nowrap"
					>
						<span v-if="permissions.can_edit_task" class="material-symbols-rounded text-sm mr-2">edit</span>
						<span v-else class="material-symbols-rounded text-sm mr-2">edit_off</span>
						Modifier les tâches
					</Button>
				</div>
				<div class="relative flex items-center gap-2">
					<Button
						:severity="permissions.can_delete_task ? 'primary' : 'secondary'"
						outlined
						rounded
						size="small"
						@click="permissions.can_delete_task = !permissions.can_delete_task"
						class="w-full text-nowrap"
					>
						<span class="material-symbols-rounded text-sm mr-2">delete</span>
						Supprimer les tâches
					</Button>
				</div>
				<div class="relative flex items-center gap-2">
					<Button
						:severity="permissions.can_validate_task ? 'primary' : 'secondary'"
						outlined
						rounded
						size="small"
						@click="permissions.can_validate_task = !permissions.can_validate_task"
						class="w-full text-nowrap"
					>
						<span v-if="permissions.can_validate_task" class="material-symbols-rounded text-sm mr-2">check</span>
						<span v-else class="material-symbols-rounded text-sm mr-2">close</span>
						Valider les tâches
					</Button>
				</div>
			</div>
		</div>

		<div class="flex gap-2 justify-end">
			<Button
				:disabled="loading"
				severity="danger"
				text
				rounded
				@click="cancel"
			>
				Annuler
			</Button>
			<Button
				:loading="loading"
				outlined
				rounded
				@click="confirmPermissions"
			>
				{{ mode === 'invite' ? 'Inviter' : 'Enregistrer' }}
			</Button>
		</div>
	</Dialog>
</template>