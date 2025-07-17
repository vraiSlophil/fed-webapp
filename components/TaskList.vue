<script setup lang="ts">
import type {Theme, ThemeStats} from '~/types/themes'
import type {Task} from '~/types/task'
import {useTasks} from '~/composables/useTasks'
import { useThemeStats } from '~/composables/useThemeStats'

const props = defineProps<{
	theme: Theme
	isThemeOpen: boolean
}>()

const toast = useToast();

// Utiliser le composable de permissions
const {
	isOwner,
	canAddTask
} = useThemePermissions(toRef(props, 'theme'))

// Composable pour les tâches
const {
	tasks,
	pagination,
	loading,
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
} = useTasks()

// Composable pour les statistiques du thème
const {
	stats: themeStats,
	loading: statsLoading,
	fetchThemeStats
} = useThemeStats()

// État local pour les composants UI
const searchQuery = ref('')
const currentSort = ref('desc')
const currentStatusFilter = ref<'todo' | 'doing' | 'done' | undefined>(undefined)
const currentArchivedFilter = ref(false)

// Affichage détaillé des statistiques
const showDetailedStats = ref(false)

// Charger les tâches au montage et quand le thème change
onMounted(() => {
	if (props.isThemeOpen) {
		loadTasksAndStats()
	}
})

// Watcher pour charger les tâches quand le thème s'ouvre/ferme
watch(() => props.isThemeOpen, (isOpen) => {
	if (isOpen) {
		loadTasksAndStats()

	}
})

// Charger les tâches et statistiques pour ce thème
const loadTasksAndStats = async () => {
	await Promise.all([
		loadTasks(),
		fetchThemeStats(props.theme.theme_id)
	])
}

// Charger les statistiques du thème
const loadThemeStats = async () => {
  await fetchThemeStats(props.theme.theme_id)
}

// Charger les tâches pour ce thème
const loadTasks = async () => {
	try {
		await fetchTasks({
			theme_id: props.theme.theme_id,
			archived: currentArchivedFilter.value
		})
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message,
			life: 3000
		})
	}
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
	if (!newTaskTitle.value.trim() || !canAddTask.value) return

	isCreatingTask.value = true
	try {
		await createTask({
			theme_id: props.theme.theme_id,
			title: newTaskTitle.value.trim(),
			status: 'todo'
		})
		newTaskTitle.value = ''
		await loadTasksAndStats()
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message,
			life: 3000
		})
	} finally {
		isCreatingTask.value = false
	}
}

// Gestionnaires d'événements du composant Task
const handleTaskUpdated = async (updatedTask: Task) => {
	// Le composant Task gère déjà la mise à jour locale
	// On peut ajouter ici de la logique supplémentaire si nécessaire
	await loadThemeStats()
}

const handleTaskDeleted = async (taskId: string) => {
	// Recharger la liste après suppression
	await loadTasksAndStats()
}

const handleTaskArchived = async (task: Task) => {
	// Si on n'affiche pas les tâches archivées, recharger la liste
	if (!currentArchivedFilter.value) {
		await loadTasksAndStats()
	}
}

const handleTaskRestored = async (task: Task) => {
	// Si on affiche les tâches archivées, recharger la liste
	if (currentArchivedFilter.value) {
		await loadTasksAndStats()
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

// Fonction pour basculer l'affichage détaillé des statistiques
const toggleDetailedStats = () => {
	showDetailedStats.value = !showDetailedStats.value
}

</script>

<template>
	<div class="h-full flex flex-col rounded-b-lg">
		<!-- Barre d'outils -->
		<div
			class="flex items-center justify-center flex-col p-4 gap-3"
		>
			<div
				class="flex items-center justify-start w-full gap-2 flex-wrap"
			>
				<!-- Barre de recherche -->
				<IconField class="flex-1 relative max-w-lg min-w-sm">
					<span class="material-symbols-rounded text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2">
					  search
					</span>
					<InputText
						v-model="searchQuery"
						@input="handleSearch"
						placeholder="Rechercher une tâche..."
						class="w-full h-12 pl-10 pr-4 py-2 text-sm"
					/>
				</IconField>
<!--			</div>-->

<!--			<div-->
<!--				class="flex items-center justify-start w-full gap-2"-->
<!--			>-->
				<!-- Bouton de filtre par statut -->
				<div class="relative">
					<Select
						v-model="currentStatusFilter"
						:options="statusOptions"
						optionLabel="label"
						class="w-36 h-12"
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
								  {{ (currentStatusFilter as any)?.icon || statusOptions[0].icon}}
								</span>
								<span>
									{{ (currentStatusFilter as any)?.label || statusOptions[0].label }}
								</span>
							</div>
						</template>
					</Select>
				</div>
				<!-- Bouton de tri (version toggle) -->
				<Button
					@click="toggleSortOrder"
					:severity="currentSort === 'desc' ? 'secondary' : 'info'"
					outlined
					class="flex items-center h-12 w-12"
				>
					<span class="material-symbols-rounded text-sm">{{ getCurrentSortOption().icon }}</span>
<!--					<span class="hidden sm:inline text-nowrap">{{ getCurrentSortOption().label }}</span>-->
				</Button>

				<!-- Bouton de filtre d'archivage (version toggle) -->
				<Button
					@click="toggleArchivedFilter"
					:severity="currentArchivedFilter ? 'default' : 'secondary'"
					outlined
					class="flex items-center h-12 w-12"
				>
					<span class="material-symbols-rounded text-sm">{{ getCurrentArchiveOption().icon }}</span>
<!--					<span class="hidden sm:inline text-nowrap">{{ getCurrentArchiveOption().label }}</span>-->
				</Button>
			</div>
		</div>

		<!-- Formulaire de création de tâche (seulement pour les tâches actives) -->
		<div v-if="(!currentArchivedFilter && canAddTask) || isOwner" class="px-4">
			<div class="flex gap-2">
				<InputText
					v-model="newTaskTitle"
					@keyup.enter="handleCreateTask"
					placeholder="Ajouter une nouvelle tâche..."
					class="flex-1 h-12 min-w-sm max-w-lg"
					autofocus
					:disabled="isCreatingTask"
				/>
				<Button
					@click="handleCreateTask"
					:loading="isCreatingTask"
					:disabled="!newTaskTitle.trim()"
					size="small"
					class="px-4 h-12 w-12"
				>
					<span class="material-symbols-rounded">add</span>
				</Button>
			</div>
		</div>

		<!-- Statistiques -->
		<div
			v-if="(themeStats) && !currentArchivedFilter"
			class="p-4 border-b dark:border-gray-700 transition-all"
			:style="{
				filter: statsLoading ? 'blur(4px) brightness(0.5)' : 'none',

			}"
		>
			<!-- Affichage des statistiques de base -->
			<div class="space-y-3">
				<!-- Statistiques de base et bouton pour afficher plus -->
				<div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
					<div class="flex items-center gap-2">
						<span>{{ themeStats.active }} tâche{{ themeStats.active > 1 ? 's' : '' }} active{{ themeStats.active > 1 ? 's' : '' }}</span>
						<span>{{ themeStats.done }} terminée{{ themeStats.done > 1 ? 's' : '' }}</span>
						<Tag
							severity="secondary"
							:style="{ backgroundColor: props.theme.color + '44', color: textColor }"
						>
							{{ themeStats.completion_rate }}% terminé
						</Tag>
					</div>
					<Button
						@click="toggleDetailedStats"
						:severity="'secondary'"
						text
						:aria-label="showDetailedStats ? 'Masquer les détails' : 'Afficher les détails'"
					>
						<span class="material-symbols-rounded text-sm">
							{{ showDetailedStats ? 'expand_less' : 'expand_more' }}
						</span>
					</Button>
				</div>

				<!-- Barre de progression -->
				<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
					<div
						class="h-2 rounded-full transition-all duration-300"
						:style="{
							width: themeStats.completion_rate + '%',
							backgroundColor: props.theme.color
						}"
					></div>
				</div>

				<!-- Statistiques détaillées (conditionnelles) -->
				<div v-if="showDetailedStats" class="pt-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
					<!-- Statistiques par statut -->
					<div class="bg-white/10 dark:bg-gray/10 rounded-lg p-3 space-y-2">
						<h4 class="font-semibold text-gray-700 dark:text-gray-300">Par statut</h4>
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-1">
								<span class="material-symbols-rounded text-blue-500 text-sm">radio_button_unchecked</span>
								À faire
							</span>
							<span class="font-medium">{{ themeStats.todo }}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-1">
								<span class="material-symbols-rounded text-yellow-500 text-sm">schedule</span>
								En cours
							</span>
							<span class="font-medium">{{ themeStats.doing }}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-1">
								<span class="material-symbols-rounded text-green-500 text-sm">check_circle</span>
								Terminé
							</span>
							<span class="font-medium">{{ themeStats.done }}</span>
						</div>
					</div>

					<!-- Statistiques d'archivage -->
					<div class="bg-white/10 dark:bg-gray/10 rounded-lg p-3 space-y-2">
						<h4 class="font-semibold text-gray-700 dark:text-gray-300">Archivage</h4>
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-1">
								<span class="material-symbols-rounded text-green-500 text-sm">visibility</span>
								Actives
							</span>
							<span class="font-medium">{{ themeStats.active }}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-1">
								<span class="material-symbols-rounded text-gray-500 text-sm">archive</span>
								Archivées
							</span>
							<span class="font-medium">{{ themeStats.archived }}</span>
						</div>
					</div>

					<!-- Statistiques récentes -->
					<div class="bg-white/10 dark:bg-gray/10 rounded-lg p-3 space-y-2 col-span-2 md:col-span-1">
						<h4 class="font-semibold text-gray-700 dark:text-gray-300">Derniers 7 jours</h4>
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-1">
								<span class="material-symbols-rounded text-blue-500 text-sm">add_circle</span>
								Créées
							</span>
							<span class="font-medium">{{ themeStats.recently_created }}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-1">
								<span class="material-symbols-rounded text-green-500 text-sm">task_alt</span>
								Terminées
							</span>
							<span class="font-medium">{{ themeStats.recently_completed }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Liste des tâches -->
		<div class="flex-1 overflow-y-auto">
			<div
				v-if="loading"
				class="flex items-center justify-center w-full h-42"
			>
				<span class="material-symbols-rounded text-gray-400 !text-4xl animate-spin">
					progress_activity
				</span>
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
					:theme="theme"
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