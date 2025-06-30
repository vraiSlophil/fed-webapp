<script setup lang="ts">
import { ref } from 'vue'
import type { Theme } from '~/types/themes'

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
const colorPopoverVisible = ref(false)

// Démarrer l'édition
const startEdit = () => {
	editedTitle.value = props.theme.title
	editedColor.value = props.theme.color
	isEditing.value = true
}

const updateColor = () => {
	emit('update', props.theme.theme_id, { color: editedColor.value })
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
		class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-all duration-200 mb-3"
		:style="{ borderLeft: `4px solid ${theme.color}` }"
	>
		<!-- Mode normal -->
		<div v-if="!isEditing" class="flex items-center gap-3 flex-grow">
			<div
				class="w-6 h-6 rounded-full"
				:style="{ backgroundColor: theme.color }"
			></div>
			<span class="font-medium">{{ theme.title }}</span>
		</div>

		<!-- Mode édition -->
		<div v-else class="flex items-center gap-3 flex-grow">
			<input
				v-model="editedTitle"
				class="flex-grow px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
				placeholder="Nom du thème"
				@keyup.enter="confirmEdit"
				@keyup.esc="cancelEdit"
			/>
		</div>

		<!-- Actions -->
		<div class="flex gap-2">
			<!-- Boutons en mode normal -->
			<template v-if="!isEditing">
				<button
					@click="startEdit"
					class="cursor-pointer flex justify-center items-center align p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
					title="Modifier"
				>
					<span class="material-symbols-rounded">edit</span>
				</button>
				<button
					@click="$emit('delete', theme)"
					class="cursor-pointer flex justify-center items-center p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
					title="Supprimer"
				>
					<span class="material-symbols-rounded">delete</span>
				</button>
				<button
					class="cursor-pointer flex justify-center items-center p-2 rounded-full text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
					title="Partager (à venir)"
				>
					<span class="material-symbols-rounded">person_add</span>
				</button>
			</template>

			<!-- Boutons en mode édition -->
			<template v-else>
				<!-- Bouton pour le sélecteur de couleur avec Popover -->
				<div>
					<button
						type="button"
						@click="colorPopoverVisible.show($event)"
						class="cursor-pointer flex justify-center items-center p-2 rounded-full text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
						title="Changer la couleur"
						aria-haspopup="true"
						aria-controls="color-picker-popover"
					>
						<span class="material-symbols-rounded">palette</span>
					</button>

					<Popover
						ref="colorPopoverVisible"
						target="prev"
					>
						<div class="p-3 w-72">
							<div class="mb-3">
								<ColorPicker v-model="editedColor" inline @change="updateColor" />
							</div>
							<div class="flex items-center mt-2">
								<span class="mr-2 text-sm text-gray-600 dark:text-gray-300">Code hex:</span>
								<InputText
									v-model="editedColor"
									class="flex-1 font-mono text-sm"
									@change="updateColor"
								/>
							</div>
						</div>
					</Popover>
				</div>

				<button
					@click="confirmEdit"
					class="cursor-pointer flex justify-center items-center p-2 rounded-full text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
					title="Confirmer"
				>
					<span class="material-symbols-rounded">check</span>
				</button>
				<button
					@click="cancelEdit"
					class="cursor-pointer flex justify-center items-center p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
</template>
