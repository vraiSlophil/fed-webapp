<script setup lang="ts">
import type {Theme} from '~/types/themes'
import type {Task} from '~/types/task'
import {useTasks} from '~/composables/useTasks'

const props = defineProps<{
	theme: Theme
	isThemeOpen: boolean
}>()

const emit = defineEmits<{
	(e: 'update', data: { title?: string, color?: string }): void
	(e: 'delete', theme: Theme): void
}>()

// Composable pour les tâches
const {
	tasks,
	pagination,
	loading,
	error,
	sortOptions,
	statusOptions,
	archiveOptions,
	fetchTasks,
	createTask,
	setSortOrder,
	setStatusFilter,
	setArchivedFilter,
	setSearchFilter,
	setPage,
	taskStats
} = useTasks()

// État local pour les composants UI
const sortMenuVisible = ref(false)
// const filterMenuVisible = ref(false)
const archiveMenuVisible = ref(false)
const searchQuery = ref('')
const currentSort = ref('desc')
const currentStatusFilter = ref<'todo' | 'doing' | 'done' | undefined>(undefined)
const currentArchivedFilter = ref(false)

// Charger les tâches au montage et quand le thème change
onMounted(() => {
	if (props.isThemeOpen) {
		loadTasks()
	}
})

// Watcher pour charger les tâches quand le thème s'ouvre/ferme
watch(() => props.isThemeOpen, (isOpen) => {
	if (isOpen) {
		loadTasks()
	}
})

// Charger les tâches pour ce thème
const loadTasks = async () => {
	await fetchTasks({
		theme_id: props.theme.theme_id,
		archived: currentArchivedFilter.value
	})
}

// Fonction pour basculer entre les options de tri
const toggleSortOrder = async () => {
	const newSortOrder = currentSort.value === 'desc' ? 'asc' : 'desc'
	currentSort.value = newSortOrder
	setSortOrder(newSortOrder)
	await loadTasks()
}

// Gérer le changement de filtre de statut
const handleStatusFilter = async (status: 'todo' | 'doing' | 'done' | undefined) => {
	setStatusFilter(status)
	await loadTasks()
}

// Fonction pour basculer entre les options d'archivage
const toggleArchivedFilter = async () => {
	currentArchivedFilter.value = !currentArchivedFilter.value
	setArchivedFilter(currentArchivedFilter.value)
	await loadTasks()
}

// Gérer la recherche avec debounce
const searchTimeout = ref<NodeJS.Timeout>()
const handleSearch = () => {
	clearTimeout(searchTimeout.value)
	searchTimeout.value = setTimeout(async () => {
		setSearchFilter(searchQuery.value)
		await loadTasks()
	}, 300)
}

// Obtenir l'option de tri actuelle
const getCurrentSortOption = () => {
	return sortOptions.find(option => option.value === currentSort.value) || sortOptions[0]
}

// Obtenir l'option de filtre actuelle
const getCurrentStatusOption = () => {
	return statusOptions.find(option => option.value === currentStatusFilter.value) || statusOptions[0]
}

// Obtenir l'option de filtre d'archivage actuelle
const getCurrentArchiveOption = () => {
	return archiveOptions.find(option => option.value === currentArchivedFilter.value) || archiveOptions[0]
}

// Watcher pour réagir aux changements du filtre de statut
watch(currentStatusFilter, async (newStatus: any) => {
	await handleStatusFilter(newStatus.value)
})


// Gérer la création d'une nouvelle tâche
const newTaskTitle = ref('')
const isCreatingTask = ref(false)

const handleCreateTask = async () => {
	if (!newTaskTitle.value.trim()) return

	isCreatingTask.value = true
	try {
		await createTask({
			theme_id: props.theme.theme_id,
			title: newTaskTitle.value.trim(),
			status: 'todo'
		})
		newTaskTitle.value = ''
		await loadTasks() // Recharger la liste
	} catch (error) {
		console.error('Erreur lors de la création de la tâche:', error)
	} finally {
		isCreatingTask.value = false
	}
}

// Gestionnaires d'événements du composant Task
const handleTaskUpdated = (updatedTask: Task) => {
	// Le composant Task gère déjà la mise à jour locale
	// On peut ajouter ici de la logique supplémentaire si nécessaire
}

const handleTaskDeleted = (taskId: string) => {
	// Recharger la liste après suppression
	loadTasks()
}

const handleTaskArchived = (task: Task) => {
	// Si on n'affiche pas les tâches archivées, recharger la liste
	if (!currentArchivedFilter.value) {
		loadTasks()
	}
}

const handleTaskRestored = (task: Task) => {
	// Si on affiche les tâches archivées, recharger la liste
	if (currentArchivedFilter.value) {
		loadTasks()
	}
}

// Déterminer la couleur du texte selon l'arrière-plan
function getLuminance(hex: string): number {
	const r = parseInt(hex.slice(1, 3), 16) / 255
	const g = parseInt(hex.slice(3, 5), 16) / 255
	const b = parseInt(hex.slice(5, 7), 16) / 255

	const a = [r, g, b].map((v) => {
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
	})

	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

function getTextColor(backgroundColor: string): string {
	const luminance = getLuminance(backgroundColor)
	return luminance > 0.5 ? '#000000' : '#ffffff'
}

const textColor = computed(() => getTextColor(props.theme.color))
</script>

<template>
	<div class="h-full flex flex-col rounded-b-lg">
		<!-- Barre d'outils -->
		<div class="flex items-center justify-center flex-col p-4 gap-3 ">
			<div
				class="flex items-center justify-between w-full gap-2"
			>
				<!-- Bouton de filtre par statut -->
				<div class="relative">
					<Select
						v-model="currentStatusFilter"
						:options="statusOptions"
						optionLabel="label"
						class="w-36"
					>
						<template #option="slotProps">
							<div class="flex items-center gap-2">
								<span class="material-symbols-rounded text-sm">{{ slotProps.option.icon }}</span>
								{{ slotProps.option.label }}
							</div>
						</template>
						<template #value="slotProps">
							<div class="flex items-center gap-2">
								<span class="material-symbols-rounded text-sm">
								  {{ currentStatusFilter?.icon || statusOptions[0].icon}}
								</span>
								<span>
									{{ currentStatusFilter?.label || statusOptions[0].label }}
								</span>
							</div>
						</template>
					</Select>
				</div>
				<!-- Barre de recherche -->
				<IconField class="flex-1 relative">
					<InputIcon>
					<span class="material-symbols-rounded flex justify-center text-gray-400 text-sm">
						search
					</span>
					</InputIcon>
					<InputText
						v-model="searchQuery"
						@input="handleSearch"
						placeholder="Rechercher une tâche..."
						class="w-full pl-10 pr-4 py-2 text-sm"
					/>
				</IconField>
			</div>

			<div
				class="flex items-center justify-start w-full gap-2"
			>
				<!-- Bouton de tri (version toggle) -->
				<Button
					@click="toggleSortOrder"
					:severity="currentSort === 'desc' ? 'secondary' : 'info'"
					outlined
					class="flex items-center gap-2"
				>
					<span class="material-symbols-rounded text-sm">{{ getCurrentSortOption().icon }}</span>
					<span class="hidden sm:inline text-nowrap">{{ getCurrentSortOption().label }}</span>
				</Button>

				<!-- Bouton de filtre d'archivage (version toggle) -->
				<Button
					@click="toggleArchivedFilter"
					:severity="currentArchivedFilter ? 'default' : 'secondary'"
					outlined
					class="flex items-center gap-2"
				>
					<span class="material-symbols-rounded text-sm">{{ getCurrentArchiveOption().icon }}</span>
					<span class="hidden sm:inline text-nowrap">{{ getCurrentArchiveOption().label }}</span>
				</Button>
			</div>
		</div>

		<!-- Formulaire de création de tâche (seulement pour les tâches actives) -->
		<div v-if="!currentArchivedFilter" class="px-4">
			<div class="flex gap-2">
				<InputText
					v-model="newTaskTitle"
					@keyup.enter="handleCreateTask"
					placeholder="Ajouter une nouvelle tâche..."
					class="flex-1"
					:disabled="isCreatingTask"
				/>
				<Button
					@click="handleCreateTask"
					:loading="isCreatingTask"
					:disabled="!newTaskTitle.trim()"
					size="small"
					class="px-4"
				>
					<span class="material-symbols-rounded">add</span>
				</Button>
			</div>
		</div>

		<!-- Statistiques -->
		<div v-if="taskStats.total > 0" class="p-4 border-b dark:border-gray-700">
			<div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
				<span>{{ taskStats.total }} tâche{{ taskStats.total > 1 ? 's' : '' }}</span>
				<span v-if="!currentArchivedFilter">{{ taskStats.progress }}% terminé</span>
			</div>
			<div v-if="!currentArchivedFilter" class="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
				<div
					class="h-2 rounded-full transition-all duration-300"
					:style="{
						width: taskStats.progress + '%',
						backgroundColor: props.theme.color
					}"
				></div>
			</div>
		</div>

		<!-- Liste des tâches -->
		<div class="flex-1 overflow-y-auto">
			<div v-if="loading" class="flex items-center justify-center p-8">
				<ProgressSpinner size="small"/>
			</div>

			<div v-else-if="error" class="p-4 text-center text-red-500">
				{{ error }}
			</div>

			<div v-else-if="tasks.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
				<span class="material-symbols-rounded text-4xl mb-2 block">
					{{ currentArchivedFilter ? 'archive' : 'assignment' }}
				</span>
				<p>{{ currentArchivedFilter ? 'Aucune tâche archivée' : 'Aucune tâche trouvée' }}</p>
				<p v-if="!currentArchivedFilter" class="text-sm mt-1">Créez votre première tâche ci-dessus</p>
			</div>

			<div v-else class="divide-y-0">
				<!-- Utilisation du composant Task -->
				<Task
					v-for="task in tasks"
					:key="task.task_id"
					:task="task"
					@updated="handleTaskUpdated"
					@deleted="handleTaskDeleted"
					@archived="handleTaskArchived"
					@restored="handleTaskRestored"
				/>
			</div>
		</div>

		<!-- Pagination -->
		<div v-if="pagination.last_page > 1" class="p-4 border-t dark:border-gray-700">
			<Paginator
				:rows="pagination.per_page"
				:totalRecords="pagination.total"
				:first="(pagination.current_page - 1) * pagination.per_page"
				@page="setPage($event.page + 1); loadTasks()"
			/>
		</div>
	</div>
</template>