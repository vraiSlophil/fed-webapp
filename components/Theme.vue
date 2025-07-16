<script setup lang="ts">
import type {Theme} from '~/types/themes'
import TaskList from "~/components/TaskList.vue";

const props = defineProps<{
	theme: Theme
}>()

const emits = defineEmits<{
	(e: 'destroy', theme: Theme): void
	(e: 'update:postion', themeId: string, position: { x: number, y: number, width: number, zIndex: number }): void
}>()

const DEFAULT_POSITION = {
	x: 100,
	y: 100,
	width: 450,
	zIndex: 1
}

const isEditing = ref(false)
const editedTitle = ref(props.theme.title)
const editedColor = ref(props.theme.color)
const isThemeOpen = ref(false)
const colorPopoverRef = ref()
const membersPopoverVisible = ref(false)
const deleteDialogVisible = ref(false)
const leaveDialogVisible = ref(false)
const themePosition = ref(props.theme.position || DEFAULT_POSITION)

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


// Fonction pour sauvegarder la position dans le stockage local
const savePositionToLocalStorage = (themeId: string, position: { x: number, y: number, width: number, zIndex: number }) => {
	try {
		// Récupérer les positions existantes ou initialiser un nouvel objet
		const storedPositions = localStorage.getItem('theme_positions')
		const positions = storedPositions ? JSON.parse(storedPositions) : {}

		// Mettre à jour la position pour ce thème
		positions[themeId] = position

		// Sauvegarder dans le localStorage
		localStorage.setItem('theme_positions', JSON.stringify(positions))
	} catch (error) {
		console.error('Erreur lors de la sauvegarde de la position:', error)
	}
}

// Fonction pour charger la position depuis le stockage local
const loadPositionFromLocalStorage = (themeId: string): { x: number, y: number, width: number, zIndex: number } | null => {
	try {
		const storedPositions = localStorage.getItem('theme_positions')
		if (!storedPositions) return null

		const positions = JSON.parse(storedPositions)
		return positions[themeId] || null
	} catch (error) {
		console.error('Erreur lors du chargement de la position:', error)
		return null
	}
}

// Initialiser la position du thème au chargement
onMounted(() => {
	// Charger depuis le localStorage
	const savedPosition = loadPositionFromLocalStorage(props.theme.theme_id)
	if (savedPosition) {
		themePosition.value = savedPosition
	}

	// Si aucune position n'est trouvée (ni dans le thème ni dans le localStorage)
	// utiliser les valeurs par défaut
	if (!themePosition.value) {
		themePosition.value = DEFAULT_POSITION
	}
})

// Gérer les changements de position
const handlePositionChange = (newPosition: { x: number, y: number, width: number, zIndex: number }) => {
	themePosition.value = newPosition
	savePositionToLocalStorage(props.theme.theme_id, newPosition)
	emits('update:postion', props.theme.theme_id, newPosition)

	// Mettre à jour la position dans le thème via l'API si nécessaire
	updateThemePosition(props.theme.theme_id, newPosition)
}

// Fonction pour mettre à jour la position via l'API
const updateThemePosition = async (themeId: string, position: { x: number, y: number, width: number, zIndex: number }) => {
	try {
		await updateTheme(themeId, { position } as any)
	} catch (error: any) {
		console.error('Erreur lors de la mise à jour de la position:', error)
	}
}


const openTheme = () => {
	isThemeOpen.value = !isThemeOpen.value
}

// Gestion de la mise à jour
const handleUpdate = async (themeId: string, data: { title?: string, color?: string }) => {
	try {
		await updateTheme(themeId, data)
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

// Annuler l'édition
const cancelEdit = () => {
	editedTitle.value = props.theme.title
	editedColor.value = props.theme.color
	isEditing.value = false
}

function getLuminance(hex: string): number {
	// Convertir le hex en RGB
	const r = parseInt(hex.slice(1, 3), 16) / 255
	const g = parseInt(hex.slice(3, 5), 16) / 255
	const b = parseInt(hex.slice(5, 7), 16) / 255

	// Calcul de la luminosité selon la formule W3C
	const a = [r, g, b].map((v) => {
		return v <= 0.03928
			? v / 12.92
			: Math.pow((v + 0.055) / 1.055, 2.4)
	})

	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

// Fonction pour déterminer la couleur du texte
function getTextColor(backgroundColor: string): string {
	const luminance = getLuminance(backgroundColor)

	// Seuil de luminosité (ajustable)
	return luminance > 0.5 ? '#000000' : '#ffffff'
}

// Exemple d'utilisation dans votre composant
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
	<div
		class="flex items-center justify-center flex-col shadow-sm transition-all duration-200 min-w-100"
	>
		<div
			class="flex items-center justify-between w-full p-4 rounded-t-lg"
			:class="{
				'rounded-b-lg': !isThemeOpen,
				'rounded-b-none': isThemeOpen
			}"
			:style="{
				backgroundColor: `${editedColor}`,
				color: textColor
			}"
		>
			<div>
				<Button
					@click="openTheme"
					class="cursor-pointer flex justify-center items-center align p-2 rounded-full"
					title="Ouvrir"
					text
					size="small"
					:style="{
						color: textColor,
					}"
				>
					<span
						v-if="isThemeOpen"
						class="material-symbols-rounded">
						keyboard_arrow_up
					</span>
					<span
						v-else
						class="material-symbols-rounded">
						keyboard_arrow_down
					</span>
				</Button>

			</div>
			<!-- Mode normal -->
			<div v-if="!isEditing" class="flex items-center gap-3 flex-grow ml-3">
				<span class="font-medium">{{ theme.title }}</span>
			</div>

			<!-- Mode édition -->
			<div v-else class="flex items-center gap-3 flex-grow">
				<input
					v-model="editedTitle"
					class="font-medium flex-grow px-3 py-1 mr-3 rounded-md focus:outline-none"
					:style="{
						color: textColor,
						backgroundColor: textColor + '1A'
					}"
					placeholder="Nom du thème"
					@keyup.enter="confirmEdit"
					@keyup.esc="cancelEdit"
				/>
			</div>

			<!-- Actions -->
			<div class="flex gap-2">
				<!-- Boutons en mode normal -->
				<template v-if="!isEditing">
					<!-- Bouton Modifier - affiché uniquement si l'utilisateur a le droit de modifier -->
					<Button
						v-if="canUpdateTheme"
						@click="startEdit"
						class="cursor-pointer flex justify-center items-center align p-2 rounded-full"
						title="Modifier"
						text
						size="small"
						:style="{
							color: textColor,
						}"
					>
						<span class="material-symbols-rounded">edit</span>
					</Button>

					<!-- Bouton Quitter - affiché uniquement si l'utilisateur est invité -->
					<Button
						v-if="!isOwner && !isEditing"
						@click="confirmLeave(theme)"
						class="cursor-pointer flex justify-center items-center p-2 rounded-full"
						title="Quitter le thème"
						text
						size="small"
						:style="{
							color: textColor,
						}"
					>
						<span class="material-symbols-rounded">chip_extraction</span>
					</Button>

					<!-- Bouton Supprimer - affiché uniquement si l'utilisateur est propriétaire -->
					<Button
						v-if="isOwner"
						@click="confirmDelete(theme)"
						class="cursor-pointer flex justify-center items-center p-2 rounded-full"
						title="Supprimer"
						text
						size="small"
						:style="{
							color: textColor,
						}"
					>
						<span class="material-symbols-rounded">delete</span>
					</Button>

					<!-- Bouton Partager - affiché uniquement si l'utilisateur est propriétaire -->
					<Button
						v-if="isOwner"
						@click="membersPopoverVisible = true"
						class="cursor-pointer flex justify-center items-center p-2 rounded-full"
						title="Partager"
						text
						size="small"
						:style="{
							color: textColor,
						}"
					>
						<span class="material-symbols-rounded">person_add</span>
					</Button>

					<LazyThemeMembersMenu
						v-if="isOwner"
						:visible="membersPopoverVisible"
						:theme="theme"
						@update:visible="membersPopoverVisible = $event"
					/>
				</template>

				<!-- Boutons en mode édition -->
				<template v-else>
					<!-- Bouton pour le sélecteur de couleur avec Popover -->
					<div>
						<Button
							@click="colorPopoverRef.show($event)"
							class="cursor-pointer flex justify-center items-center p-2 rounded-full"
							title="Changer la couleur"
							text
							size="small"
							:style="{
								color: textColor,
							}"
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
									<span class="text-sm  dark:text-gray-300">Code hex:</span>
									<InputText
										v-model="editedColor"
										class="flex-1 font-mono text-sm w-30"
									/>
								</div>
							</div>
						</Popover>
					</div>

					<Button
						@click="confirmEdit"
						class="cursor-pointer flex justify-center items-center p-2 rounded-full"
						title="Confirmer"
						text
						size="small"
						:style="{
							color: textColor,
						}"
					>
						<span class="material-symbols-rounded">check</span>
					</Button>
					<Button
						@click="cancelEdit"
						class="cursor-pointer flex justify-center items-center p-2 rounded-full"
						title="Annuler"
						text
						size="small"
						:style="{
							color: textColor,
						}"
					>
						<span class="material-symbols-rounded">close</span>
					</Button>
				</template>
			</div>

			<!-- Sélecteur de couleur (caché par défaut) -->
			<input
				ref="colorPickerRef"
				type="color"
				v-model="editedColor"
				class="hidden"
			/>
		</div>
		<div
			v-if="isThemeOpen"
			class="bg-white/10 dark:bg-gray/10 backdrop-blur-xs min-h-42 w-full rounded-b-lg"
			data-no-drag
		>
			<TaskList
				:theme="theme"
				:isThemeOpen="isThemeOpen"
			/>
		</div>
	</div>

	<Dialog
		v-model:visible="deleteDialogVisible"
		header="Confirmer la suppression"
		:style="{ width: '30rem' }"
		:modal="true"
	>
		<div class="confirmation-content flex items-center gap-3 m-4">
			<span class="material-symbols-rounded text-yellow-500 text-2xl">warning</span>
			<span>Êtes-vous sûr de vouloir supprimer le thème <strong>{{ selectedTheme?.title }}</strong> ?</span>
		</div>
		<template #footer>
			<Button
				label="Non"
				outlined
				@click="deleteDialogVisible = false"
			/>
			<Button
				label="Oui"
				severity="danger"
				@click="handleDeleteTheme"
				:loading="loading"
			/>
		</template>
	</Dialog>

	<Dialog
		v-model:visible="leaveDialogVisible"
		header="Confirmer la sortie"
		:style="{ width: '30rem' }"
		:modal="true"
	>
		<div class="confirmation-content flex items-center gap-3 m-4">
			<span class="material-symbols-rounded text-yellow-500 text-2xl">warning</span>
			<span>Êtes-vous sûr de vouloir quitter le thème <strong>{{ theme.title }}</strong> ?</span>
		</div>
		<template #footer>
			<Button
				label="Non"
				outlined
				@click="leaveDialogVisible = false"
			/>
			<Button
				label="Oui"
				severity="danger"
				@click="handleLeaveTheme"
				:loading="loading"
			/>
		</template>
	</Dialog>

</template>