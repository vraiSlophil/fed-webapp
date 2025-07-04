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
    const error = ref<string | null>(null)

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
        error.value = null

        try {
            const queryParams = buildQueryParams(customFilters)
            const url = `/api/tasks${queryParams ? `?${queryParams}` : ''}`

            const response = await useApiFetch(url, {
                method: HttpMethods.GET
            }) as { data: TaskResponse }

            tasks.value = response.data.tasks
            pagination.value = response.data.pagination
        } catch (err: any) {
            error.value = err.message || 'Erreur lors du chargement des tâches'
            console.error('Erreur fetchTasks:', err)
        } finally {
            loading.value = false
        }
    }

    // Créer une tâche
    const createTask = async (taskData: { theme_id: string; title: string; status?: 'todo' | 'doing' | 'done' }) => {
        loading.value = true
        error.value = null

        try {
            const response = await useApiFetch('/api/tasks', {
                method: HttpMethods.POST,
                body: JSON.stringify(taskData)
            }) as { data: { task: Task } }

            // Ajouter la nouvelle tâche à la liste
            tasks.value.unshift(response.data.task)

            return response.data.task
        } catch (err: any) {
            error.value = err.message || 'Erreur lors de la création de la tâche'
            console.error('Erreur createTask:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Mettre à jour une tâche
    const updateTask = async (taskId: string, taskData: { title?: string; status?: 'todo' | 'doing' | 'done' }) => {
        loading.value = true
        error.value = null

        try {
            const response = await useApiFetch(`/api/tasks/${taskId}`, {
                method: HttpMethods.PUT,
                body: JSON.stringify(taskData)
            }) as { data: { task: Task } }

            // Mettre à jour la tâche dans la liste
            const index = tasks.value.findIndex(t => t.task_id === taskId)
            if (index !== -1) {
                tasks.value[index] = response.data.task
            }

            return response.data.task
        } catch (err: any) {
            error.value = err.message || 'Erreur lors de la mise à jour de la tâche'
            console.error('Erreur updateTask:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Archiver une tâche
    const archiveTask = async (taskId: string) => {
        try {
            const response = await useApiFetch(`/api/tasks/${taskId}/archive`, {
                method: HttpMethods.POST
            }) as { data: { task: Task } }

            // Retirer la tâche de la liste si on n'affiche pas les archivées
            if (!filters.archived) {
                tasks.value = tasks.value.filter(t => t.task_id !== taskId)
            } else {
                // Sinon mettre à jour la tâche
                const index = tasks.value.findIndex(t => t.task_id === taskId)
                if (index !== -1) {
                    tasks.value[index] = response.data.task
                }
            }

            return response.data.task
        } catch (err: any) {
            error.value = err.message || 'Erreur lors de l\'archivage de la tâche'
            console.error('Erreur archiveTask:', err)
            throw err
        }
    }

    // Restaurer une tâche
    const restoreTask = async (taskId: string) => {
        try {
            const response = await useApiFetch(`/api/tasks/${taskId}/restore`, {
                method: HttpMethods.POST
            }) as { data: { task: Task } }

            const index = tasks.value.findIndex(t => t.task_id === taskId)
            if (index !== -1) {
                tasks.value[index] = response.data.task
            }

            return response.data.task
        } catch (err: any) {
            error.value = err.message || 'Erreur lors de la restauration de la tâche'
            console.error('Erreur restoreTask:', err)
            throw err
        }
    }

    // Marquer comme terminé
    const completeTask = async (taskId: string) => {
        try {
            const response = await useApiFetch(`/api/tasks/${taskId}/complete`, {
                method: HttpMethods.POST
            }) as { data: { task: Task } }

            const index = tasks.value.findIndex(t => t.task_id === taskId)
            if (index !== -1) {
                tasks.value[index] = response.data.task
            }

            return response.data.task
        } catch (err: any) {
            error.value = err.message || 'Erreur lors de la validation de la tâche'
            console.error('Erreur completeTask:', err)
            throw err
        }
    }

    // Marquer comme non terminé
    const uncompleteTask = async (taskId: string) => {
        try {
            const response = await useApiFetch(`/api/tasks/${taskId}/uncomplete`, {
                method: HttpMethods.POST
            }) as { data: { task: Task } }

            const index = tasks.value.findIndex(t => t.task_id === taskId)
            if (index !== -1) {
                tasks.value[index] = response.data.task
            }

            return response.data.task
        } catch (err: any) {
            error.value = err.message || 'Erreur lors de la dévalidation de la tâche'
            console.error('Erreur uncompleteTask:', err)
            throw err
        }
    }

    // Supprimer une tâche
    const deleteTask = async (taskId: string) => {
        try {
            await useApiFetch(`/api/tasks/${taskId}`, {
                method: HttpMethods.DELETE
            })

            // Retirer la tâche de la liste
            tasks.value = tasks.value.filter(t => t.task_id !== taskId)
        } catch (err: any) {
            error.value = err.message || 'Erreur lors de la suppression de la tâche'
            console.error('Erreur deleteTask:', err)
            throw err
        }
    }

    // Fonction pour changer le statut d'une tâche de manière cyclique
    const changeTaskStatus = async (taskId: string, currentStatus: 'todo' | 'doing' | 'done') => {
        let newStatus: 'todo' | 'doing' | 'done'

        // Cycle: todo -> doing -> done -> todo
        switch (currentStatus) {
            case 'todo':
                newStatus = 'doing'
                break
            case 'doing':
                newStatus = 'done'
                break
            case 'done':
                newStatus = 'todo'
                break
            default:
                newStatus = 'todo'
        }

        return await updateTask(taskId, { status: newStatus })
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

    // Computed pour les statistiques
    const taskStats = computed(() => {
        const total = tasks.value.length
        const todo = tasks.value.filter(t => t.status === 'todo').length
        const doing = tasks.value.filter(t => t.status === 'doing').length
        const done = tasks.value.filter(t => t.status === 'done').length
        const validated = tasks.value.filter(t => t.validated_at !== null).length

        return {
            total,
            todo,
            doing,
            done,
            validated,
            progress: total > 0 ? Math.round((done / total) * 100) : 0
        }
    })

    return {
        // État
        tasks: readonly(tasks),
        pagination: readonly(pagination),
        loading: readonly(loading),
        error: readonly(error),
        filters,

        // Options
        sortOptions,
        statusOptions,
        archiveOptions,

        // Actions
        fetchTasks,
        createTask,
        updateTask,
        archiveTask,
        restoreTask,
        completeTask,
        uncompleteTask,
        deleteTask,
        changeTaskStatus,

        // Filtres
        resetFilters,
        setThemeFilter,
        setSortOrder,
        setStatusFilter,
        setArchivedFilter,
        setSearchFilter,
        setPage,

        // Computed
        taskStats
    }
}