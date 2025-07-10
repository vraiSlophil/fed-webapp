<script setup lang="ts">
import type {Theme} from '~/types/themes'
import TaskList from "~/components/TaskList.vue";

const props = defineProps<{
	theme: Theme
}>()

const emit = defineEmits<{
	(e: 'update', themeId: string, data: { title?: string, color?: string }): void
	(e: 'delete', theme: Theme): void
}>()

const isEditing = ref(false)
const editedTitle = ref(props.theme.title)
const editedColor = ref(props.theme.color)
const isThemeOpen = ref(false)

const colorPopoverRef = ref()
const membersPopoverVisible = ref(false)

// Utiliser le composable de permissions avec le thème
const { isOwner, canUpdateTheme } = useThemePermissions(toRef(props, 'theme'))

const openTheme = () => {
	isThemeOpen.value = !isThemeOpen.value
}

// Démarrer l'édition
const startEdit = () => {
	if (!canUpdateTheme.value) return

	editedTitle.value = props.theme.title
	editedColor.value = props.theme.color
	isEditing.value = true
}

const updateColor = () => {
	// emit('update', props.theme.theme_id, { color: editedColor.value })
}

// Confirmer l'édition
const confirmEdit = () => {
	if (editedTitle.value.trim().length < 3) return

	emit('update', props.theme.theme_id, {
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
		class="flex items-center justify-center flex-col shadow-sm transition-all duration-200 mb-3 "
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
				<button
					@click="openTheme"
					class="cursor-pointer flex justify-center items-center align p-2 rounded-full"
					title="Ouvrir"
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
				</button>

			</div>
			<!-- Mode normal -->
			<div v-if="!isEditing" class="flex items-center gap-3 flex-grow ml-3">
				<span class="font-medium">{{ theme.title }}</span>
			</div>

			<!-- Mode édition -->
			<div v-else class="flex items-center gap-3 flex-grow">
				<input
					v-model="editedTitle"
					class="font-medium flex-grow px-3 py-1 mr-8 rounded-md focus:outline-none"
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
					<button
						v-if="canUpdateTheme"
						@click="startEdit"
						class="cursor-pointer flex justify-center items-center align p-2 rounded-full"
						title="Modifier"
					>
						<span class="material-symbols-rounded">edit</span>
					</button>

					<!-- Bouton Supprimer - affiché uniquement si l'utilisateur est propriétaire -->
					<button
						v-if="isOwner"
						@click="$emit('delete', theme)"
						class="cursor-pointer flex justify-center items-center p-2 rounded-full"
						title="Supprimer"
					>
						<span class="material-symbols-rounded">delete</span>
					</button>

					<!-- Bouton Partager - affiché uniquement si l'utilisateur est propriétaire -->
					<button
						v-if="isOwner"
						@click="membersPopoverVisible = true"
						class="cursor-pointer flex justify-center items-center p-2 rounded-full"
						title="Partager"
					>
						<span class="material-symbols-rounded">person_add</span>
					</button>

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
						<button
							@click="colorPopoverRef.show($event)"
							class="cursor-pointer flex justify-center items-center p-2 rounded-full"
							title="Changer la couleur"
						>
							<span class="material-symbols-rounded">palette</span>
						</button>
						<Popover
							ref="colorPopoverRef"
							target="prev"
						>
							<div class="p-3 flex items-center justify-center gap-2 flex-col">
								<div class="mb-3">
									<ColorPicker
										v-model="editedColor"
										inline
										@change="updateColor"
									/>
								</div>
								<div class="flex items-center justify-center flex-row gap-3">
									<span class="text-sm  dark:text-gray-300">Code hex:</span>
									<InputText
										v-model="editedColor"
										class="flex-1 font-mono text-sm w-30"
										@change="updateColor"
									/>
								</div>
							</div>
						</Popover>
					</div>

					<button
						@click="confirmEdit"
						class="cursor-pointer flex justify-center items-center p-2 rounded-full"
						title="Confirmer"
					>
						<span class="material-symbols-rounded">check</span>
					</button>
					<button
						@click="cancelEdit"
						class="cursor-pointer flex justify-center items-center p-2 rounded-full"
						title="Annuler"
					>
						<span class="material-symbols-rounded">close</span>
					</button>
				</template>
			</div>

			<!-- Sélecteur de couleur (caché par défaut) -->
			<input
				ref="colorPickerRef"
				type="color"
				v-model="editedColor"
				class="hidden"
				@input="updateColor"
			/>
		</div>
		<div
			v-if="isThemeOpen"
			class="bg-white/10 dark:bg-gray/10 backdrop-blur-xs min-h-42 w-full rounded-b-lg"

		>
			<TaskList
				:theme="theme"
				:isThemeOpen="isThemeOpen"
				@update="emit('update', theme.theme_id, $event)"
				@delete="emit('delete', theme)"
			/>
		</div>
	</div>
</template>