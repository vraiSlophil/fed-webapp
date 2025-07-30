import { useApiFetch } from '~/composables/useApiFetch'
import type {Task, TaskFilters, TaskPagination, TaskResponse} from "~/types/task";
import { HttpMethods } from '~/utils/httpMethods'

export const useTasks = () => {
    const tasks = ref<Task[]>([])
    const pagination = ref<TaskPagination>({
        total: 0,
        per_page: 15,
        current_page: 1,
        last_page: 1,
        from: null,
        to: null
    })
    const loading = ref(false)

    // Filtres réactifs
    const filters = reactive<TaskFilters>({
        theme_id: undefined,
        status: undefined,
        statuses: undefined,
        archived: false,
        validated: undefined,
        search: '',
        sort: 'desc',
        page: 1,
        per_page: 15
    })

    // Options de tri
    const sortOptions = [
        { label: 'Plus récent', value: 'desc', icon: 'arrow_downward' },
        { label: 'Plus ancien', value: 'asc', icon: 'arrow_upward' }
    ]

    // Options de filtrage par statut
    const statusOptions = [
        { label: 'Tous', value: undefined, icon: 'all_inclusive' },
        { label: 'À faire', value: 'todo', icon: 'radio_button_unchecked' },
        { label: 'En cours', value: 'doing', icon: 'schedule' },
        { label: 'Terminé', value: 'done', icon: 'check_circle' }
    ]

    // Options de filtrage pour les tâches archivées
    const archiveOptions = [
        { label: 'Actives', value: false, icon: 'visibility' },
        { label: 'Archivées', value: true, icon: 'archive' }
    ]

    // Construire les paramètres de requête
    const buildQueryParams = (customFilters?: Partial<TaskFilters>) => {
        const params = new URLSearchParams()
        const currentFilters = { ...filters, ...customFilters }

        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                    params.append(key, value.join(','))
                } else {
                    params.append(key, value.toString())
                }
            }
        })

        return params.toString()
    }

    // Charger les tâches
    const fetchTasks = async (customFilters?: Partial<TaskFilters>) => {
        loading.value = true

        try {
            const queryParams = buildQueryParams(customFilters)
            const url = `/api/tasks${queryParams ? `?${queryParams}` : ''}`

            const response = await useApiFetch(url, {
                method: HttpMethods.GET
            }) as { data: TaskResponse }

            tasks.value = response.data.tasks
            pagination.value = response.data.pagination
        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || 'Erreur lors du chargement des tâches');
        } finally {
            loading.value = false
        }
    }

    // Créer une tâche
    const createTask = async (taskData: { theme_id: string; title: string; status?: 'todo' | 'doing' | 'done' }) => {
        loading.value = true

        try {
            const response = await useApiFetch('/api/tasks', {
                method: HttpMethods.POST,
                body: JSON.stringify(taskData)
            }) as { data: { task: Task } }

            // Ajouter la nouvelle tâche à la liste
            tasks.value.unshift(response.data.task)

            return response.data.task
        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || 'Erreur lors de la création de la tâche');
        } finally {
            loading.value = false
        }
    }

    // Réinitialiser les filtres
    const resetFilters = () => {
        Object.assign(filters, {
            theme_id: undefined,
            status: undefined,
            statuses: undefined,
            archived: false,
            validated: undefined,
            search: '',
            sort: 'desc',
            page: 1,
            per_page: 15
        })
    }

    // Filtrer par thème
    const setThemeFilter = (themeId: string) => {
        filters.theme_id = themeId
        filters.page = 1
    }

    // Changer le tri
    const setSortOrder = (sortOrder: 'asc' | 'desc') => {
        filters.sort = sortOrder
        filters.page = 1
    }

    // Changer le statut
    const setStatusFilter = (status?: 'todo' | 'doing' | 'done') => {
        filters.status = status
        filters.page = 1
    }

    // Changer le filtre d'archivage
    const setArchivedFilter = (archived: boolean) => {
        filters.archived = archived
        filters.page = 1
    }

    // Rechercher
    const setSearchFilter = (search: string) => {
        filters.search = search
        filters.page = 1
    }

    // Changer la page
    const setPage = (page: number) => {
        filters.page = page
    }

    return {
        // État
        tasks: readonly(tasks),
        pagination: readonly(pagination),
        loading: readonly(loading),

        // Options
        sortOptions,
        statusOptions,
        archiveOptions,

        // Actions
        fetchTasks,
        createTask,

        // Filtres
        resetFilters,
        setThemeFilter,
        setSortOrder,
        setStatusFilter,
        setArchivedFilter,
        setSearchFilter,
        setPage,

    }
}