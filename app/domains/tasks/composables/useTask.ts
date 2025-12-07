import type { Task } from '~/types/task'
import { useApiFetch } from '~/composables/useApiFetch'
import { HttpMethods } from '~/utils/httpMethods'

export const useTask = (initialTask: Task) => {
    const task = ref<Task>(initialTask)
    const loading = ref(false)

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
                return 'todo'
            case 'done':
                return 'todo'
            default:
                return 'todo'
        }
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

        try {
            const response = await useApiFetch(`/api/tasks/${task.value.task_id}`, {
                method: HttpMethods.PATCH,
                body: JSON.stringify({ title: newTitle.trim() })
            }) as { data: { task: Task } }

            updateLocalTask(response.data.task)
            return true
        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || 'Erreur lors de la mise à jour du titre de la tâche');
        } finally {
            loading.value = false
        }
    }

    // Changer le statut
    const changeStatus = async () => {
        if (!canEdit.value) return false

        const newStatus = getNextStatus(task.value.status)
        loading.value = true

        try {
            const response = await useApiFetch(`/api/tasks/${task.value.task_id}`, {
                method: HttpMethods.PATCH,
                body: JSON.stringify({ status: newStatus })
            }) as { data: { task: Task } }

            updateLocalTask(response.data.task)
            return true
        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || `Erreur lors du changement de statut`)
        } finally {
            loading.value = false
        }
    }

    // Basculer la completion (validation)
    const toggleCompletion = async () => {
        if (!canEdit.value) return false

        loading.value = true

        try {
            const endpoint = isCompleted.value ? 'uncomplete' : 'complete'
            const response = await useApiFetch(`/api/tasks/${task.value.task_id}/${endpoint}`, {
                method: HttpMethods.POST
            }) as { data: { task: Task } }

            updateLocalTask(response.data.task)
            return true
        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || 'Erreur lors de la validation de la tâche');
        } finally {
            loading.value = false
        }
    }

    // Archiver/Restaurer
    const toggleArchive = async () => {
        loading.value = true

        try {
            const endpoint = isArchived.value ? 'restore' : 'archive'
            const response = await useApiFetch(`/api/tasks/${task.value.task_id}/${endpoint}`, {
                method: HttpMethods.POST
            }) as { data: { task: Task } }

            updateLocalTask(response.data.task)
            return true
        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || 'Erreur lors de l\'archivage de la tâche');
        } finally {
            loading.value = false
        }
    }

    // Supprimer
    const deleteTask = async () => {
        loading.value = true

        try {
            await useApiFetch(`/api/tasks/${task.value.task_id}`, {
                method: HttpMethods.DELETE
            })
            return true
        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || 'Erreur lors de la suppression de la tâche');
        } finally {
            loading.value = false
        }
    }

    return {
        // État
        task: readonly(task),
        loading: readonly(loading),

        // Computed
        isCompleted,
        isArchived,
        canEdit,

        // Méthodes utilitaires
        getNextStatus,
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