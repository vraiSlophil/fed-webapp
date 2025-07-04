import type { Task } from '~/types/task'
import { useApiFetch } from '~/composables/useApiFetch'
import { HttpMethods } from '~/utils/httpMethods'

export const useTask = (initialTask: Task) => {
    const task = ref<Task>(initialTask)
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Computed pour les propriétés de la tâche
    const isCompleted = computed(() => !!task.value.validated_at)
    const isArchived = computed(() => !!task.value.archived_at)
    const canEdit = computed(() => !isArchived.value)

    // Cycle de statuts
    const getNextStatus = (currentStatus: 'todo' | 'doing' | 'done'): 'todo' | 'doing' | 'done' => {
        switch (currentStatus) {
            case 'todo':
                return 'doing'
            case 'doing':
                return 'done'
            case 'done':
                return 'todo'
            default:
                return 'todo'
        }
    }

    // Styles pour les tags de statut
    const getStatusStyle = (status: 'todo' | 'doing' | 'done') => {
        const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium transition-all duration-200'
        const clickableClasses = canEdit.value ? 'cursor-pointer' : 'cursor-default'

        const statusClasses = {
            'todo': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800',
            'doing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800',
            'done': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
        }

        return `${baseClasses} ${statusClasses[status]} ${clickableClasses}`
    }

    // Obtenir le label du statut
    const getStatusLabel = (status: 'todo' | 'doing' | 'done') => {
        const labels = {
            'todo': 'À faire',
            'doing': 'En cours',
            'done': 'Terminé'
        }
        return labels[status]
    }

    const getStatusSeverity = (status: 'todo' | 'doing' | 'done') => {
        const severityMap: Record<string, string> = {
            'todo': 'info',
            'doing': 'warning',
            'done': 'success'
        }
        return severityMap[status] || 'info'
    }

    // Mettre à jour la tâche localement
    const updateLocalTask = (updates: Partial<Task>) => {
        task.value = { ...task.value, ...updates }
    }

    // Mettre à jour le titre
    const updateTitle = async (newTitle: string) => {
        if (!newTitle.trim() || newTitle.trim() === task.value.title) return false

        loading.value = true
        error.value = null

        try {
            const response = await useApiFetch(`/api/tasks/${task.value.task_id}`, {
                method: HttpMethods.PUT,
                body: JSON.stringify({ title: newTitle.trim() })
            }) as { data: { task: Task } }

            updateLocalTask(response.data.task)
            return true
        } catch (err: any) {
            error.value = err.message || 'Erreur lors de la mise à jour du titre'
            console.error('Erreur updateTitle:', err)
            return false
        } finally {
            loading.value = false
        }
    }

    // Changer le statut
    const changeStatus = async () => {
        if (!canEdit.value) return false

        const newStatus = getNextStatus(task.value.status)
        loading.value = true
        error.value = null

        try {
            const response = await useApiFetch(`/api/tasks/${task.value.task_id}`, {
                method: HttpMethods.PUT,
                body: JSON.stringify({ status: newStatus })
            }) as { data: { task: Task } }

            updateLocalTask(response.data.task)
            return true
        } catch (err: any) {
            error.value = err.message || 'Erreur lors du changement de statut'
            console.error('Erreur changeStatus:', err)
            return false
        } finally {
            loading.value = false
        }
    }

    // Basculer la completion (validation)
    const toggleCompletion = async () => {
        if (!canEdit.value) return false

        loading.value = true
        error.value = null

        try {
            const endpoint = isCompleted.value ? 'uncomplete' : 'complete'
            const response = await useApiFetch(`/api/tasks/${task.value.task_id}/${endpoint}`, {
                method: HttpMethods.POST
            }) as { data: { task: Task } }

            updateLocalTask(response.data.task)
            return true
        } catch (err: any) {
            error.value = err.message || 'Erreur lors de la validation'
            console.error('Erreur toggleCompletion:', err)
            return false
        } finally {
            loading.value = false
        }
    }

    // Archiver/Restaurer
    const toggleArchive = async () => {
        loading.value = true
        error.value = null

        try {
            const endpoint = isArchived.value ? 'restore' : 'archive'
            const response = await useApiFetch(`/api/tasks/${task.value.task_id}/${endpoint}`, {
                method: HttpMethods.POST
            }) as { data: { task: Task } }

            updateLocalTask(response.data.task)
            return true
        } catch (err: any) {
            error.value = err.message || 'Erreur lors de l\'archivage'
            console.error('Erreur toggleArchive:', err)
            return false
        } finally {
            loading.value = false
        }
    }

    // Supprimer
    const deleteTask = async () => {
        loading.value = true
        error.value = null

        try {
            await useApiFetch(`/api/tasks/${task.value.task_id}`, {
                method: HttpMethods.DELETE
            })
            return true
        } catch (err: any) {
            error.value = err.message || 'Erreur lors de la suppression'
            console.error('Erreur deleteTask:', err)
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        // État
        task: readonly(task),
        loading: readonly(loading),
        error: readonly(error),

        // Computed
        isCompleted,
        isArchived,
        canEdit,

        // Méthodes utilitaires
        getNextStatus,
        getStatusStyle,
        getStatusLabel,
        getStatusSeverity,

        // Actions
        updateLocalTask,
        updateTitle,
        changeStatus,
        toggleCompletion,
        toggleArchive,
        deleteTask
    }
}