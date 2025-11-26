<script lang="ts" setup>
import type {Theme} from '~/types/theme'
import TaskList from "~/domains/tasks/components/TaskList.vue";
import {useColors} from "~/domains/shared/composables/useColors";
import {useThemes} from "~/domains/themes/composables/useThemes";
import {useThemePermissions} from "~/domains/themes/composables/useThemePermissions";

type ThemeVariant = 'default' | 'stored';

const props = defineProps<{
	theme: Theme
	variant?: ThemeVariant
}>()

defineSlots<{
	'stored-actions'?: (scope: { theme: Theme, textColor: string }) => any
}>()

const isEditing = ref(false)
const editedTitle = ref(props.theme.title)
const editedColor = ref(props.theme.color)
const isThemeOpen = ref(false)
const colorPopoverRef = ref()
const membersPopoverVisible = ref(false)
const deleteDialogVisible = ref(false)
const leaveDialogVisible = ref(false)

// Importer les composables nécessaires
const {
	currentTheme: selectedTheme,
	loading,
	updateTheme,
	deleteTheme,
	leaveTheme
} = useThemes();

const {isOwner, canUpdateTheme} = useThemePermissions(toRef(props, 'theme'))
const toast = useToast()
const {getTextColor} = useColors();

const variant = computed<ThemeVariant>(() => props.variant ?? 'default')
const isStoredVariant = computed(() => variant.value === 'stored')

const openTheme = () => {
	if (isStoredVariant.value) return
	isThemeOpen.value = !isThemeOpen.value
}

// Gestion de la mise à jour
const handleUpdate = async (themeId: string, data: { title?: string, color?: string }) => {
	try {
		await updateTheme(themeId, data)
		// modifie le titre et la couleur du thème dans le composant parent
		props.theme.title = data.title || props.theme.title
		props.theme.color = data.color || props.theme.color
		toast.add({
			severity: 'success',
			summary: 'Succès',
			detail: `Thème "${data.title || 'inconnu'}" mis à jour avec succès.`,
			life: 3000
		})
	} catch (error: any) {
		console.error(error)
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message,
			life: 3000
		})
	}
}

// Gestion de la suppression
const confirmDelete = (theme: Theme) => {
	selectedTheme.value = theme
	deleteDialogVisible.value = true
}

const handleDeleteTheme = async () => {
	if (selectedTheme.value) {
		try {
			await deleteTheme(selectedTheme.value.theme_id)
			emits('destroy', selectedTheme.value)
			toast.add({
				severity: 'success',
				summary: 'Succès',
				detail: `Thème "${selectedTheme.value.title}" supprimé avec succès.`,
				life: 3000
			})
		} catch (error: any) {
			console.error(error)
			toast.add({
				severity: 'error',
				summary: 'Erreur',
				detail: error.message,
				life: 3000
			})
		} finally {
			deleteDialogVisible.value = false
			selectedTheme.value = null
		}
	}
}

const confirmLeave = (theme: Theme) => {
	selectedTheme.value = theme
	leaveDialogVisible.value = true
}

const handleLeaveTheme = async () => {
	if (selectedTheme.value) {
		try {
			await leaveTheme(selectedTheme.value.theme_id)
			emits('destroy', selectedTheme.value)
			toast.add({
				severity: 'success',
				summary: 'Succès',
				detail: `Vous avez quitté le thème "${selectedTheme.value.title}".`,
				life: 3000
			})
		} catch (error: any) {
			console.error(error)
			toast.add({
				severity: 'error',
				summary: 'Erreur',
				detail: error.message,
				life: 3000
			})
		} finally {
			leaveDialogVisible.value = false
			selectedTheme.value = null
		}
	}
}

// Démarrer l'édition
const startEdit = () => {
	if (!canUpdateTheme.value) return

	editedTitle.value = props.theme.title
	editedColor.value = props.theme.color
	isEditing.value = true
}

// Confirmer l'édition
const confirmEdit = () => {
	if (editedTitle.value.trim().length < 3) return

	handleUpdate(props.theme.theme_id, {
		title: editedTitle.value,
		color: editedColor.value
	})
	isEditing.value = false
}

const cancelEdit = () => {
	editedTitle.value = props.theme.title
	editedColor.value = props.theme.color
	isEditing.value = false
}

const textColor = computed(() => {
	return getTextColor(editedColor.value)
})

watch(
	() => editedColor.value,
	(newVal) => {
		if (newVal && !newVal.startsWith('#')) {
			editedColor.value = `#${newVal}`
		}
	}
)
</script>

<template>
	<div>
		<div
			:class="[
				isStoredVariant ? 'px-6 py-4 min-w-48 max-w-72' : 'w-full min-w-100 min-h-18 p-4',
				isThemeOpen ? 'rounded-b-none' : 'rounded-b-[2.25rem]'
			]"
			:style="{
				backgroundColor: `${editedColor}`,
				color: textColor
			}"
			class="flex items-center justify-between rounded-[2.25rem] transition-all duration-200 shadow-sm hover:shadow-lg"
		>
			<div v-if="!isStoredVariant">
				<Button
					:style="{ color: textColor }"
					class="h-10 w-10 cursor-pointer flex justify-center items-center align p-2"
					rounded
					outlined
					severity="secondary"
					title="Ouvrir"
					@click="openTheme"
				>
					<span v-if="isThemeOpen" class="material-symbols-rounded">keyboard_arrow_up</span>
					<span v-else class="material-symbols-rounded">keyboard_arrow_down</span>
				</Button>

			</div>
			<!-- Mode normal -->
			<div v-if="!isEditing" class="flex items-center gap-3 flex-grow min-w-0" :class="isStoredVariant ? 'mr-4' : 'mx-6'">
				<span class="font-medium truncate block w-full">{{ theme.title }}</span>
			</div>

			<!-- Mode édition -->
			<div v-else class="flex items-center gap-3 flex-grow">
				<input
					v-model="editedTitle"
					:style="{
						color: textColor,
						backgroundColor: textColor + '1A'
					}"
					class="font-medium flex-grow px-3 py-1 mx-3 !rounded-full focus:outline-none"
					placeholder="Nom du thème"
					@keyup.enter="confirmEdit"
					@keyup.esc="cancelEdit"
				/>
			</div>

			<!-- Actions -->
			<div class="flex gap-2" :class="isStoredVariant ? 'items-center' : ''">
				<template v-if="isStoredVariant">
					<slot name="stored-actions" :theme="theme" :textColor="textColor" />
				</template>
				<template v-else>
					<!-- Boutons en mode normal -->
					<template v-if="!isEditing">
						<!-- Bouton Modifier - affiché uniquement si l'utilisateur a le droit de modifier -->
						<Button
							v-if="canUpdateTheme"
							:style="{
								color: textColor,
							}"
							class="h-10 w-10 cursor-pointer flex justify-center items-center align p-2 rounded-full"
							rounded
							outlined
							severity="secondary"
							title="Modifier"
							@click="startEdit"
						>
							<span class="material-symbols-rounded">edit</span>
						</Button>

						<!-- Bouton Quitter - affiché uniquement si l'utilisateur est invité -->
						<Button
							v-if="!isOwner && !isEditing"
							:style="{
								color: textColor,
							}"
							class="h-10 w-10 cursor-pointer flex justify-center items-center p-2 rounded-full"
							rounded
							outlined
							severity="secondary"
							title="Quitter le thème"
							@click="confirmLeave(theme)"
						>
							<span class="material-symbols-rounded">chip_extraction</span>
						</Button>

						<!-- Bouton Supprimer - affiché uniquement si l'utilisateur est propriétaire -->
						<Button
							v-if="isOwner"
							:style="{
								color: textColor,
							}"
							class="h-10 w-10 cursor-pointer flex justify-center items-center p-2 rounded-full"
							rounded
							outlined
							severity="secondary"
							title="Supprimer"
							@click="confirmDelete(theme)"
						>
							<span class="material-symbols-rounded">delete</span>
						</Button>

						<!-- Bouton Partager - affiché uniquement si l'utilisateur est propriétaire -->
						<Button
							v-if="isOwner"
							:style="{
								color: textColor,
							}"
							class="h-10 w-10 cursor-pointer flex justify-center items-center p-2 rounded-full"
							rounded
							outlined
							severity="secondary"
							title="Partager"
							@click="membersPopoverVisible = true"
						>
							<span class="material-symbols-rounded">person_add</span>
						</Button>

						<LazyThemeMembersMenu
							v-if="isOwner"
							:theme="theme"
							:visible="membersPopoverVisible"
							@update:visible="membersPopoverVisible = $event"
						/>
					</template>

					<!-- Boutons en mode édition -->
					<template v-else>
						<!-- Bouton pour le sélecteur de couleur avec Popover -->
						<div>
							<Button
								:style="{
									color: textColor,
								}"
								class="h-10 w-10 cursor-pointer flex justify-center items-center p-2 rounded-full"
								rounded
								outlined
								severity="secondary"
								title="Changer la couleur"
								@click="colorPopoverRef.show($event)"
							>
								<span class="material-symbols-rounded">palette</span>
							</Button>
							<Popover
								ref="colorPopoverRef"
								target="prev"
							>
								<div class="p-3 flex items-center justify-center gap-2 flex-col">
									<div class="mb-3">
										<ColorPicker
											v-model="editedColor"
											inline
										/>
									</div>
									<div class="flex items-center justify-center flex-row gap-3">
										<span class="text-sm  dark:text-neutral-300">Code hex:</span>
										<InputText
											v-model="editedColor"
											class="flex-1 font-mono text-sm w-30"
										/>
									</div>
								</div>
							</Popover>
						</div>

						<Button
							:style="{
								color: textColor,
							}"
							class="h-10 w-10 cursor-pointer flex justify-center items-center p-2 rounded-full"
							rounded
							outlined
							severity="secondary"
							title="Confirmer"
							@click="confirmEdit"
						>
							<span class="material-symbols-rounded">check</span>
						</Button>
						<Button
							:style="{
								color: textColor,
							}"
							class="h-10 w-10 cursor-pointer flex justify-center items-center p-2 rounded-full"
							rounded
							outlined
							severity="secondary"
							title="Annuler"
							@click="cancelEdit"
						>
							<span class="material-symbols-rounded">close</span>
						</Button>
					</template>
				</template>
			</div>

			<!-- Sélecteur de couleur (caché par défaut) -->
			<input
				ref="colorPickerRef"
				v-model="editedColor"
				class="hidden"
				type="color"
			/>
		</div>
		<div
			v-if="!isStoredVariant && isThemeOpen"
			class="min-h-42 w-full bg-white/10 dark:bg-neutral-800/20 backdrop-blur-xl rounded-b-[2.25rem] overflow-hidden"
			data-no-drag
		>
			<TaskList
				:isThemeOpen="isThemeOpen"
				:theme="theme"
				class="cursor-auto"
			/>
		</div>
 	</div>

	<Dialog
		v-model:visible="deleteDialogVisible"
		:modal="true"
		:style="{ width: '30rem' }"
		header="Confirmer la suppression"
	>
		<div class="confirmation-content flex items-center gap-3 m-4">
			<span class="material-symbols-rounded text-yellow-500 text-2xl">warning</span>
			<span>Êtes-vous sûr de vouloir supprimer le thème <strong>{{ selectedTheme?.title }}</strong> ?</span>
		</div>
		<template #footer>
			<Button
				label="Non"
				text
				rounded
				@click="deleteDialogVisible = false"
			/>
			<Button
				:loading="loading"
				label="Oui"
				severity="danger"
				rounded
				outlined
				@click="handleDeleteTheme"
			/>
		</template>
	</Dialog>

	<Dialog
		v-model:visible="leaveDialogVisible"
		:modal="true"
		:style="{ width: '30rem' }"
		header="Confirmer la sortie"
	>
		<div class="confirmation-content flex items-center gap-3 m-4">
			<span class="material-symbols-rounded text-yellow-500 text-2xl">warning</span>
			<span>Êtes-vous sûr de vouloir quitter le thème <strong>{{ theme.title }}</strong> ?</span>
		</div>
		<template #footer>
			<Button
				label="Non"
				text
				rounded
				@click="leaveDialogVisible = false"
			/>
			<Button
				:loading="loading"
				label="Oui"
				severity="danger"
				rounded
				outlined
				@click="handleLeaveTheme"
			/>
		</template>
	</Dialog>

</template>