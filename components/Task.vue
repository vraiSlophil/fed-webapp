<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { Task } from '~/types/task'
import { useTask } from '~/composables/useTask'

const props = defineProps<{
	task: Task
}>()

const emit = defineEmits<{
	(e: 'updated', task: Task): void
	(e: 'deleted', taskId: string): void
	(e: 'archived', task: Task): void
	(e: 'restored', task: Task): void
}>()

const toast = useToast();
// Composable pour cette tâche
const {
	task,
	loading,
	isCompleted,
	isArchived,
	canEdit,
	getStatusLabel,
	getStatusSeverity,
	updateTitle,
	changeStatus,
	toggleCompletion,
	toggleArchive,
	deleteTask
} = useTask(props.task)

// État pour l'édition du titre
const isEditingTitle = ref(false)
const editedTitle = ref('')
const titleInputRef = ref<HTMLInputElement>()

// Démarrer l'édition du titre
const startTitleEdit = async () => {
	if (!canEdit.value) return

	editedTitle.value = task.value.title
	isEditingTitle.value = true
}

// Confirmer l'édition du titre
const confirmTitleEdit = async () => {
	if (!editedTitle.value.trim()) {
		cancelTitleEdit()
		return
	}
	try {
		await updateTitle(editedTitle.value)
		emit('updated', task.value)
		toast.add({
			severity: 'success',
			summary: 'Titre modifié',
			detail: 'Le titre de la tâche a été mis à jour avec succès.',
			life: 3000
		})
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message,
			life: 3000
		})
	} finally {
		isEditingTitle.value = false
	}
}

// Annuler l'édition du titre
const cancelTitleEdit = () => {
	editedTitle.value = task.value.title
	isEditingTitle.value = false
}

// Gérer le changement de statut
const handleStatusChange = async () => {
	if (!canEdit.value) return

	try {
		await changeStatus()
		emit('updated', task.value)
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message,
			life: 3000
		})
	}
}

// Gérer la completion
const handleToggleCompletion = async () => {
	if (!canEdit.value) return

	try {
		await toggleCompletion()
		emit('updated', task.value)
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message,
			life: 3000
		})
	}

}

// Gérer l'archivage/restauration
const handleToggleArchive = async () => {
	try {
		const wasArchived = isArchived.value
		await toggleArchive()
		if (wasArchived) {
			emit('restored', task.value)
		} else {
			emit('archived', task.value)
		}
		emit('updated', task.value)
		toast.add({
			severity: 'success',
			summary: wasArchived ? 'Tâche restaurée' : 'Tâche archivée',
			detail: `La tâche a été ${wasArchived ? 'restaurée' : 'archivée'} avec succès.`,
			life: 3000
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

// Gérer la suppression
const handleDelete = async () => {
	try {
		await deleteTask()
		emit('deleted', task.value.task_id)
		toast.add({
			severity: 'success',
			summary: 'Tâche supprimée',
			detail: 'La tâche a été supprimée avec succès.',
			life: 3000
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

// Confirmer la suppression
const showDeleteConfirm = ref(false)

const confirmDelete = () => {
	showDeleteConfirm.value = true
}

const handleConfirmDelete = async () => {
	showDeleteConfirm.value = false
	await handleDelete()
}

const cancelDelete = () => {
	showDeleteConfirm.value = false
}
</script>

<template>
	<div
		class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b dark:border-gray-700 last:border-b-0"
		:class="{ 'opacity-60': isArchived }"
	>
		<!-- Contenu principal de la tâche -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3 flex-1">
				<!-- Checkbox de completion -->
				<button
					@click="handleToggleCompletion"
					class="flex items-center justify-center w-6.5 h-6.5 rounded-full border-2 transition-colors flex-shrink-0 cursor-pointer"
					:class="isCompleted
						? 'bg-green-500 border-green-500 text-white'
						: 'border-gray-300 dark:border-gray-600 hover:border-gray-400'"
					:disabled="!canEdit || loading"
					:title="isCompleted ? 'Marquer comme non terminé' : 'Marquer comme terminé'"
				>
					<span v-if="loading" class="animate-spin flex items-center justify-center">
						<span class="material-symbols-rounded !text-[18px]">progress_activity</span>
					</span>
					<span v-else-if="isCompleted" class="material-symbols-rounded text-sm">check</span>
				</button>

				<!-- Titre de la tâche -->
				<div class="flex-1 min-w-0">
					<!-- Mode affichage -->
					<div v-if="!isEditingTitle" class="flex-1">
						<h3
							@dblclick="startTitleEdit"
							class="font-medium max-w-58 px-3 py-1 mr-8truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors "
							:class="isCompleted ? 'line-through text-gray-500' : ''"
							:title="canEdit ? 'Double-cliquez pour modifier' : ''"
						>
							{{ task.title }}
						</h3>
					</div>

					<!-- Mode édition -->
					<div v-else class="flex-1">
						<InputText
							v-model="editedTitle"
							@keyup.enter="confirmTitleEdit"
							@keyup.esc="cancelTitleEdit"
							class="w-full font-medium"
							:style="{
								paddingLeft: '0.75rem',
								paddingRight: '0.75rem',
								paddingTop: '0.25rem',
								paddingBottom: '0.25rem',
								marginRight: '2rem',
								borderRadius: '0.375rem',
								outline: 'none',
								border: 'none',
								backgroundColor: 'rgba(255,255,255,0.1)'
							}"
							:disabled="loading"
						/>
					</div>

					<!-- Tags et métadonnées -->
					<div class="flex items-center gap-2 mt-1 flex-wrap">
						<!-- Tag de statut -->
						<Tag
							@click="handleStatusChange"
							:severity="getStatusSeverity(task.status)"
							:disabled="!canEdit || loading"
							class="cursor-pointer"
						>
							{{ getStatusLabel(task.status) }}
						</Tag>

						<!-- Badge archivé -->
						<Tag
							v-if="isArchived"
							:severity="'secondary'"
						>
							Archivé
						</Tag>

						<!-- Date de création -->
						<span v-if="task.created_at" class="text-xs text-gray-400 dark:text-gray-500">
							{{ new Date(task.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) }}
						</span>
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex items-center gap-1 ml-3">
				<!-- Bouton éditer titre -->
				<div>
					<Button
						v-if="canEdit && !isEditingTitle"
						@click="startTitleEdit"
						text
						size="small"
						class="p-2"
						title="Modifier le titre"
						:disabled="loading"
					>
						<span class="material-symbols-rounded text-sm">edit</span>
					</Button>
					<Button
						v-if="isEditingTitle"
						@click="confirmTitleEdit"
						text
						size="small"
						class="p-2"
						title="Confirmer la modification"
						:disabled="loading"
					>
						<span class="material-symbols-rounded text-sm">check</span>
					</Button>
				</div>

				<div>
					<!-- Bouton archiver/restaurer -->
					<Button
						v-if="!isEditingTitle"
						@click="handleToggleArchive"
						text
						size="small"
						class="p-2"
						:title="isArchived ? 'Restaurer' : 'Archiver'"
						:disabled="loading"
					>
						<span class="material-symbols-rounded text-sm">
							{{ isArchived ? 'unarchive' : 'archive' }}
						</span>
					</Button>
					<!-- Bouton annuler la modification -->
					<Button
						v-if="isEditingTitle"
						@click="cancelTitleEdit"
						text
						size="small"
						class="p-2"
						title="Annuler la modification"
						:disabled="loading"
					>
						<span class="material-symbols-rounded text-sm">close</span>
					</Button>
				</div>

				<!-- Bouton supprimer -->
				<Button
					@click="confirmDelete"
					text
					size="small"
					class="p-2 text-red-500 hover:text-red-600"
					title="Supprimer"
					:disabled="loading"
				>
					<span class="material-symbols-rounded text-sm">delete</span>
				</Button>
			</div>
		</div>
		<!-- Confirmation de suppression -->
		<div v-if="showDeleteConfirm" class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
			<div class="flex items-center justify-between">
				<span class="text-sm text-red-800 dark:text-red-200">
					Êtes-vous sûr de vouloir supprimer cette tâche ?
				</span>
				<div class="flex gap-2">
					<Button
						@click="handleConfirmDelete"
						size="small"
						severity="danger"
						:loading="loading"
					>
						Supprimer
					</Button>
					<Button
						@click="cancelDelete"
						size="small"
						outlined
						:disabled="loading"
					>
						Annuler
					</Button>
				</div>
			</div>
		</div>
	</div>
</template>