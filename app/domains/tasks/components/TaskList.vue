<script lang="ts" setup>
import type {Theme} from '~/types/theme'
import type {Task} from '~/types/task'
import {useThemePermissions} from "~/domains/themes/composables/useThemePermissions";
import {useTasks} from "~/domains/tasks/composables/useTasks";
import {useThemeStats} from "~/domains/themes/composables/useThemeStats";

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

const filtersVisibility = ref(false)

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

const toggleFiltersVisibility = () => {
	filtersVisibility.value = !filtersVisibility.value
}

</script>

<template>
	<div class="h-full flex flex-col rounded-b-lg">
		<div class="flex flex-col gap-1 p-4 border-b border-neutral-300 dark:border-neutral-700 transition-all">
			<!-- Barre d'outils -->
			<div class="flex justify-start">
				<div class="w-full max-w-lg flex items-center justify-start gap-2 relative">
					<IconField class="flex-1 relative">
						<span
							class="material-symbols-rounded text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2">search</span>
						<InputText
							v-model="searchQuery"
							class="w-full h-10 flex items-center justify-between pl-10 pr-4 py-2 text-sm !rounded-full"
							placeholder="Rechercher une tâche..."
							@input="handleSearch"
						/>
					</IconField>
					<div class="">
						<Button
							class="w-10 h-10"
							outlined
							rounded
							severity="secondary"
							@click="toggleFiltersVisibility"
						>
							<span v-if="!filtersVisibility" class="material-symbols-rounded">settings</span>
							<span v-else class="material-symbols-rounded">close</span>
						</Button>
						<div
							:class="filtersVisibility ? 'opacity-100 pointer-event-default' : 'opacity-0 pointer-events-none'"
							class="mr-10 p-2 absolute -top-2 right-0 flex justify-center items-center flex-nowrap gap-2 rounded-full bg-white/60 dark:bg-black/60 animation-all duration-200"
						>
							<Select
								v-model="currentStatusFilter"
								:options="statusOptions"
								class="w-36 h-10 flex items-center justify-between !rounded-full"
								optionLabel="label"
							>
								<template #option="slotProps">
									<div class="flex items-center gap-2">
									<span class="material-symbols-rounded text-sm text-neutral-400">{{
											slotProps.option.icon
										}}</span>
										{{ slotProps.option.label }}
									</div>
								</template>
								<template #value="slotProps">
									<div class="flex items-center gap-2 ">
								<span class="material-symbols-rounded text-sm text-neutral-400">
								  {{ (currentStatusFilter as any)?.icon || statusOptions[0].icon }}
								</span>
										<span>
									{{ (currentStatusFilter as any)?.label || statusOptions[0].label }}
								</span>
									</div>
								</template>
							</Select>
							<Button
								class="h-10 w-10 flex items-center justify-center !text-neutral-400"
								rounded
								text
								title="Changer l'ordre"
								@click="toggleSortOrder"
							>
								<span class="material-symbols-rounded text-sm">{{ getCurrentSortOption().icon }}</span>
							</Button>

							<Button
								class="h-10 w-10 flex items-center justify-center !text-neutral-400"
								rounded
								text
								title="Basculer l'archive"
								@click="toggleArchivedFilter"
							>
								<span class="material-symbols-rounded text-sm">{{
										getCurrentArchiveOption().icon
									}}</span>
							</Button>
						</div>
					</div>
				</div>
			</div>

			<!-- Formulaire de création de tâche (seulement pour les tâches actives) -->
			<div v-if="(!currentArchivedFilter && canAddTask) || isOwner" class="px-4">
			</div>
			<div class="max-w-lg flex gap-2">
				<InputText
					v-model="newTaskTitle"
					:disabled="isCreatingTask"
					autofocus
					class="flex-1 h-10 !rounded-full !px-4"
					placeholder="Ajouter une nouvelle tâche..."
					@keyup.enter="handleCreateTask"
				/>
				<Button
					:disabled="!newTaskTitle.trim()"
					:loading="isCreatingTask"
					class="h-10 w-10"
					outlined
					rounded
					title="Créer une tâche"
					@click="handleCreateTask"
				>
					<span v-if="!isCreatingTask" class="material-symbols-rounded">add</span>
					<span v-else class="material-symbols-rounded animate-spin">progress_activity</span>
				</Button>
			</div>
		</div>

		<div
			class="overflow-y-auto max-h-[50vh]"
		>
			<!-- Statistiques -->
			<div
				v-if="(themeStats) && !currentArchivedFilter"
				:style="{
				filter: statsLoading ? 'blur(4px) brightness(0.5)' : 'none',

			}"
				class="p-4 border-b border-neutral-300 dark:border-neutral-700 transition-all"
			>
				<!-- Affichage des statistiques de base -->
				<div class="space-y-3">
					<!-- Statistiques de base et bouton pour afficher plus -->
					<div class="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
						<div class="flex items-center gap-2">
						<span>{{ themeStats.active }} tâche{{
								themeStats.active > 1 ? 's' : ''
							}} active{{ themeStats.active > 1 ? 's' : '' }}</span>
							<span>{{ themeStats.done }} terminée{{ themeStats.done > 1 ? 's' : '' }}</span>
							<Tag
								:style="{ backgroundColor: props.theme.color + '44', color: textColor }"
								severity="secondary"
							>
								{{ themeStats.completion_rate }}% terminé
							</Tag>
						</div>
						<Button
							:aria-label="showDetailedStats ? 'Masquer les détails' : 'Afficher les détails'"
							:severity="'secondary'"
							text
							@click="toggleDetailedStats"
						>
						<span class="material-symbols-rounded text-sm">
							{{ showDetailedStats ? 'expand_less' : 'expand_more' }}
						</span>
						</Button>
					</div>

					<!-- Barre de progression -->
					<div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
						<div
							:style="{
							width: themeStats.completion_rate + '%',
							backgroundColor: props.theme.color
						}"
							class="h-2 rounded-full transition-all duration-300"
						></div>
					</div>

					<!-- Statistiques détaillées (conditionnelles) -->
					<div v-if="showDetailedStats" class="pt-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
						<!-- Statistiques par statut -->
						<div class="bg-white/10 dark:bg-white/10 rounded-lg p-3 space-y-2">
							<h4 class="font-semibold text-neutral-700 dark:text-neutral-300">Par statut</h4>
							<div class="flex items-center justify-between">
							<span class="flex items-center gap-1">
								<span
									class="material-symbols-rounded text-blue-500 text-sm">radio_button_unchecked</span>
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
						<div class="bg-white/10 dark:bg-neutral/10 rounded-lg p-3 space-y-2">
							<h4 class="font-semibold text-neutral-700 dark:text-neutral-300">Archivage</h4>
							<div class="flex items-center justify-between">
							<span class="flex items-center gap-1">
								<span class="material-symbols-rounded text-green-500 text-sm">visibility</span>
								Actives
							</span>
								<span class="font-medium">{{ themeStats.active }}</span>
							</div>
							<div class="flex items-center justify-between">
							<span class="flex items-center gap-1">
								<span class="material-symbols-rounded text-neutral-500 text-sm">archive</span>
								Archivées
							</span>
								<span class="font-medium">{{ themeStats.archived }}</span>
							</div>
						</div>

						<!-- Statistiques récentes -->
						<div class="bg-white/10 dark:bg-neutral/10 rounded-lg p-3 space-y-2 col-span-2 md:col-span-1">
							<h4 class="font-semibold text-neutral-700 dark:text-neutral-300">Derniers 7 jours</h4>
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
			<div class="flex-1">
				<div
					v-if="loading"
					class="flex items-center justify-center w-full h-42"
				>
					<span class="material-symbols-rounded text-neutral-400 !text-4xl animate-spin">
						progress_activity
					</span>
				</div>
				<div v-else-if="tasks.length === 0" class="p-8 text-center text-neutral-500 dark:text-neutral-400">
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
						@archived="handleTaskArchived"
						@deleted="handleTaskDeleted"
						@restored="handleTaskRestored"
						@updated="handleTaskUpdated"
					/>
				</div>
			</div>

			<!-- Pagination -->
			<div v-if="pagination.last_page > 1" class="p-4 border-t border-neutral-300 dark:border-neutral-700">
				<Paginator
					:first="(pagination.current_page - 1) * pagination.per_page"
					:pt="{root: '!rounded-full !bg-white/10 h-10 !p-0'}"
					:rows="pagination.per_page"
					:totalRecords="pagination.total"
					@page="setPage($event.page + 1); loadTasks()"
				/>
			</div>
		</div>
	</div>

</template>