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

const emit = defineEmits<{
	(e: 'destroy', theme: Theme): void
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
const moveMenuVisible = ref(false)

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

// Items du SpeedDial construits dynamiquement selon les permissions
const speedDialItems = computed(() => {
	const items: Array<{
		label: string
		icon: string
		command: () => void
	}> = []

	if (canUpdateTheme.value) {
		items.push({
			label: 'Modifier',
			icon: 'edit',
			command: () => startEdit()
		})
	}

	// Bouton de déplacement vers un autre playground (pour tous)
	items.push({
		label: 'Déplacer',
		icon: 'drive_file_move',
		command: () => {
			moveMenuVisible.value = true
		}
	})

	if (!isOwner.value) {
		items.push({
			label: 'Quitter',
			icon: 'chip_extraction',
			command: () => confirmLeave(props.theme)
		})
	}

	if (isOwner.value) {
		items.push({
			label: 'Supprimer',
			icon: 'delete',
			command: () => confirmDelete(props.theme)
		})
		items.push({
			label: 'Partager',
			icon: 'person_add',
			command: () => {
				membersPopoverVisible.value = true
			}
		})
	}

	// items.push({
	// 	label: 'test1',
	// 	icon: 'info',
	// 	command: () => {
	// 		console.log('test1')
	// 	}
	// })
	//
	// items.push({
	// 	label: 'test2',
	// 	icon: 'info',
	// 	command: () => {
	// 		console.log('test2')
	// 	}
	// })
	//
	// items.push({
	// 	label: 'test3',
	// 	icon: 'info',
	// 	command: () => {
	// 		console.log('test3')
	// 	}
	// })
	//
	// items.push({
	// 	label: 'test4',
	// 	icon: 'info',
	// 	command: () => {
	// 		console.log('test4')
	// 	}
	// })

	return items
})

const openTheme = () => {
	if (isStoredVariant.value) return
	isThemeOpen.value = !isThemeOpen.value
}

const handleUpdate = async (themeId: string, data: { title?: string, color?: string }) => {
	try {
		await updateTheme(themeId, data)
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

const confirmDelete = (theme: Theme) => {
	selectedTheme.value = theme
	deleteDialogVisible.value = true
}

const handleDeleteTheme = async () => {
	if (selectedTheme.value) {
		try {
			await deleteTheme(selectedTheme.value.theme_id)
			// Le composable gère maintenant la suppression dans le cache paginé;
			// on continue d émettre l événement pour les parents qui écoutent encore
			emit('destroy', selectedTheme.value)
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

const startEdit = () => {
	if (!canUpdateTheme.value) return
	editedTitle.value = props.theme.title
	editedColor.value = props.theme.color
	isEditing.value = true
}

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
				isStoredVariant ? 'px-6 py-4 min-w-48 max-w-72' : 'w-full min-w-120 min-h-18 p-4',
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
					:style="{ color: textColor, borderColor: textColor + '80' }"
					class="h-10 w-10 cursor-pointer flex justify-center items-center align p-2"
					outlined
					rounded
					severity="secondary"
					title="Ouvrir"
					@click="openTheme"
				>
					<span v-if="isThemeOpen" class="material-symbols-rounded">keyboard_arrow_up</span>
					<span v-else class="material-symbols-rounded">keyboard_arrow_down</span>
				</Button>

			</div>
			<div
				class="flex flex-grow mx-4 min-w-0 cursor-pointer"
			>
				<!-- Mode normal -->
				<div
					v-if="!isEditing"
					class="flex items-center gap-3 flex-grow min-w-0"
				>
					<span class="font-medium truncate block w-full">{{ theme.title }}</span>
				</div>

				<!-- Mode édition -->
				<div
					v-else
					class="flex items-center gap-3 flex-grow"
				>
					<input
						v-model="editedTitle"
						:style="{
						color: textColor,
						backgroundColor: textColor + '1A'
					}"
						class="font-medium flex-grow px-3 py-1 !rounded-full focus:outline-none"
						placeholder="Nom du thème"
						@keyup.enter="confirmEdit"
						@keyup.esc="cancelEdit"
					/>
				</div>
			</div>

			<!-- Actions -->
			<div :class="isStoredVariant ? 'items-center' : ''">
				<template v-if="isStoredVariant">
					<slot :textColor="textColor" :theme="theme" name="stored-actions"/>
				</template>
				<template v-else>
					<template v-if="!isEditing">
						<SpeedDial
							:model="speedDialItems"
							:radius="50"
							:style="{
							    position: 'relative',
							    '--p-item-diff-x': '0px',
							    '--p-item-diff-y': '0px'
							}"
							direction="left"
							:pt="{
								root: {
									class: 'absolute',
								},
								list: {
									class: 'absolute bottom-0 right-12/10',
								},
							}"
						>
							<template #button="{ toggleCallback }" class="h-10 w-10">
								<Button
									:style="{ color: textColor, borderColor: textColor + '80' }"
									class="h-10 w-10 cursor-pointer flex justify-center items-center p-2 rounded-full"
									outlined
									rounded
									severity="secondary"
									title="Actions"
									@click="toggleCallback"
								>
									<span class="material-symbols-rounded">more_vert</span>
								</Button>
							</template>
							<template #item="{ item }">
								<Button
									:style="{ color: textColor, borderColor: textColor + '80', backgroundColor: editedColor }"
									:title="item.label"
									class="h-10 w-10 cursor-pointer flex justify-center items-center p-2 rounded-full"
									outlined
									rounded
									severity="secondary"
									@click="item.command"
								>
									<span class="material-symbols-rounded">{{ item.icon }}</span>
								</Button>
							</template>
						</SpeedDial>
						<LazyThemeMembersMenu
							v-if="isOwner"
							:theme="theme"
							:visible="membersPopoverVisible"
							@update:visible="membersPopoverVisible = $event"
						/>
						<LazyThemeMoveMenu
							:theme="theme"
							:visible="moveMenuVisible"
							@moved="emit('destroy', $event)"
							@update:visible="moveMenuVisible = $event"
						/>
					</template>

					<!-- Boutons en mode édition -->
					<template v-else>
						<div class="flex flex-row items-center justify-center gap-2">

							<!-- Bouton pour le sélecteur de couleur avec Popover -->
							<div>
								<Button
									:style="{ color: textColor, borderColor: textColor + '80' }"
									class="h-10 w-10 cursor-pointer flex justify-center items-center p-2 rounded-full"
									outlined
									rounded
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
								:style="{ color: textColor, borderColor: textColor + '80' }"
								class="h-10 w-10 cursor-pointer flex justify-center items-center p-2 rounded-full"
								outlined
								rounded
								severity="secondary"
								title="Confirmer"
								@click="confirmEdit"
							>
								<span class="material-symbols-rounded">check</span>
							</Button>
							<Button
								:style="{ color: textColor, borderColor: textColor + '80' }"
								class="h-10 w-10 cursor-pointer flex justify-center items-center p-2 rounded-full"
								outlined
								rounded
								severity="secondary"
								title="Annuler"
								@click="cancelEdit"
							>
								<span class="material-symbols-rounded">close</span>
							</Button>
						</div>
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
			class="min-h-42 w-full bg-white/10 dark:bg-neutral-800/20 backdrop-blur-xl rounded-b-[2.25rem] "
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
				rounded
				text
				@click="deleteDialogVisible = false"
			/>
			<Button
				:loading="loading"
				label="Oui"
				outlined
				rounded
				severity="danger"
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
				rounded
				text
				@click="leaveDialogVisible = false"
			/>
			<Button
				:loading="loading"
				label="Oui"
				outlined
				rounded
				severity="danger"
				@click="handleLeaveTheme"
			/>
		</template>
	</Dialog>

</template>