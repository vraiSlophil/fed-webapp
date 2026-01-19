<script lang="ts" setup>
import type { Task } from '~/types/task';
import type { Theme } from '~/types/theme';
import { useThemePermissions } from '~/domains/themes/composables/useThemePermissions';
import { useTask } from '~/domains/tasks/composables/useTask';

const props = defineProps<{
    task: Task;
    theme: Theme;
}>();

const emit = defineEmits<{
    (e: 'updated', task: Task): void;
    (e: 'deleted', taskId: string): void;
    (e: 'archived', task: Task): void;
    (e: 'restored', task: Task): void;
}>();

const toast = useToast();

// Utiliser le composable de permissions
const { isOwner, canEditTask, canDeleteTask, canValidateTask } = useThemePermissions(
    toRef(props, 'theme'),
);

// Composable pour cette tâche
const {
    task,
    loading,
    isCompleted,
    isArchived,
    canEdit: taskCanEdit, // Renommé pour éviter la confusion
    getStatusLabel,
    getStatusSeverity,
    updateTitle,
    changeStatus,
    toggleCompletion,
    toggleArchive,
    deleteTask,
} = useTask(props.task);

const canEdit = computed(() => {
    // L'utilisateur peut éditer si:
    // 1. La tâche n'est pas archivée (logique interne à la tâche)
    // 2. ET l'utilisateur a la permission d'éditer les tâches dans ce thème
    return taskCanEdit.value && canEditTask.value;
});

// État pour l'édition du titre
const isEditingTitle = ref(false);
const editedTitle = ref('');
const titleInputRef = ref<HTMLInputElement>();

// Démarrer l'édition du titre
const startTitleEdit = async () => {
    if (!canEdit.value) return;

    editedTitle.value = task.value.title;
    isEditingTitle.value = true;
};

// Confirmer l'édition du titre
const confirmTitleEdit = async () => {
    if (!editedTitle.value.trim()) {
        cancelTitleEdit();
        return;
    }
    try {
        await updateTitle(editedTitle.value);
        emit('updated', task.value);
        toast.add({
            severity: 'success',
            summary: 'Titre modifié',
            detail: 'Le titre de la tâche a été mis à jour avec succès.',
            life: 3000,
        });
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.message,
            life: 3000,
        });
    } finally {
        isEditingTitle.value = false;
    }
};

// Annuler l'édition du titre
const cancelTitleEdit = () => {
    editedTitle.value = task.value.title;
    isEditingTitle.value = false;
};

// Gérer le changement de statut
const handleStatusChange = async () => {
    if (!canEdit.value) return;

    try {
        await changeStatus();
        emit('updated', task.value);
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.message,
            life: 3000,
        });
    }
};

// Gérer la completion
const handleToggleCompletion = async () => {
    if (!canEdit.value) return;

    try {
        await toggleCompletion();
        emit('updated', task.value);
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.message,
            life: 3000,
        });
    }
};

// Gérer l'archivage/restauration
const handleToggleArchive = async () => {
    if (!isOwner.value) return;

    try {
        const wasArchived = isArchived.value;
        await toggleArchive();
        if (wasArchived) {
            emit('restored', task.value);
        } else {
            emit('archived', task.value);
        }
        emit('updated', task.value);
        toast.add({
            severity: 'success',
            summary: wasArchived ? 'Tâche restaurée' : 'Tâche archivée',
            detail: `La tâche a été ${wasArchived ? 'restaurée' : 'archivée'} avec succès.`,
            life: 3000,
        });
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.message,
            life: 3000,
        });
    }
};

// Gérer la suppression
const handleDelete = async () => {
    if (!canDeleteTask.value) return;

    try {
        await deleteTask();
        emit('deleted', task.value.task_id);
        toast.add({
            severity: 'success',
            summary: 'Tâche supprimée',
            detail: 'La tâche a été supprimée avec succès.',
            life: 3000,
        });
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.message,
            life: 3000,
        });
    }
};

// Confirmer la suppression
const showDeleteConfirm = ref(false);

const confirmDelete = () => {
    if (!canDeleteTask.value) return;
    showDeleteConfirm.value = true;
};

const handleConfirmDelete = async () => {
    showDeleteConfirm.value = false;
    await handleDelete();
};

const cancelDelete = () => {
    showDeleteConfirm.value = false;
};
</script>

<template>
    <div
        :class="{ 'opacity-60': isArchived }"
        class="p-4 hover:bg-white/20 dark:hover:bg-black/20 transition-colors border-b border-neutral-300 dark:border-neutral-700 last:border-b-0"
    >
        <!-- Contenu principal de la tâche -->
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1">
                <!-- Checkbox de completion -->
                <button
                    v-if="canValidateTask"
                    :class="
                        isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400'
                    "
                    :disabled="!canEdit || loading"
                    :title="isCompleted ? 'Marquer comme non terminé' : 'Marquer comme terminé'"
                    class="flex items-center justify-center w-6.5 h-6.5 rounded-full border-2 transition-colors flex-shrink-0 cursor-pointer"
                    @click="handleToggleCompletion"
                >
                    <span v-if="loading" class="animate-spin flex items-center justify-center">
                        <span class="material-symbols-rounded !text-[18px]">progress_activity</span>
                    </span>
                    <span v-else-if="isCompleted" class="material-symbols-rounded text-sm"
                        >check</span
                    >
                </button>

                <!-- Titre de la tâche -->
                <div class="flex-1 min-w-0">
                    <!-- Mode affichage -->
                    <div v-if="!isEditingTitle" class="flex-1">
                        <h3
                            :class="isCompleted ? 'line-through text-neutral-500' : ''"
                            :title="canEdit ? 'Double-cliquez pour modifier' : ''"
                            class="font-medium max-w-58 px-3 py-1 mr-8truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            @dblclick="canEdit ? startTitleEdit() : null"
                        >
                            {{ task.title }}
                        </h3>
                    </div>

                    <!-- Mode édition -->
                    <div v-else class="flex-1">
                        <InputText
                            v-model="editedTitle"
                            :disabled="loading"
                            :style="{
                                paddingLeft: '0.75rem',
                                paddingRight: '0.75rem',
                                paddingTop: '0.25rem',
                                paddingBottom: '0.25rem',
                                marginRight: '2rem',
                                borderRadius: '0.375rem',
                                outline: 'none',
                                border: 'none',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                            }"
                            autofocus
                            class="w-full font-medium"
                            @keyup.enter="confirmTitleEdit"
                            @keyup.esc="cancelTitleEdit"
                        />
                    </div>

                    <!-- Tags et métadonnées -->
                    <div class="flex items-center gap-2 mt-1 flex-wrap">
                        <!-- Tag de statut -->
                        <Tag
                            v-if="!isEditingTitle"
                            :class="{ 'cursor-pointer': canEdit }"
                            :severity="getStatusSeverity(task.status)"
                            :value="getStatusLabel(task.status)"
                            @click="canEdit ? handleStatusChange() : null"
                        />

                        <!-- Badge archivé -->
                        <Tag v-if="isArchived" :severity="'secondary'"> Archivé </Tag>

                        <!-- Date de création -->
                        <span
                            v-if="task.created_at"
                            class="text-xs text-neutral-400 dark:text-neutral-500"
                        >
                            {{
                                new Date(task.created_at).toLocaleString('fr-FR', {
                                    dateStyle: 'short',
                                    timeStyle: 'short',
                                })
                            }}
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
                        :disabled="loading"
                        class="w-10 h-10 p-2"
                        outlined
                        rounded
                        severity="secondary"
                        title="Modifier le titre"
                        @click="startTitleEdit"
                    >
                        <span class="material-symbols-rounded text-sm">edit</span>
                    </Button>
                    <Button
                        v-if="isEditingTitle"
                        :disabled="loading"
                        class="w-10 h-10 p-2"
                        outlined
                        rounded
                        severity="secondary"
                        title="Confirmer la modification"
                        @click="confirmTitleEdit"
                    >
                        <span class="material-symbols-rounded text-sm">check</span>
                    </Button>
                </div>

                <div>
                    <!-- Bouton archiver/restaurer -->
                    <Button
                        v-if="isOwner && !isEditingTitle"
                        :disabled="loading"
                        :title="isArchived ? 'Restaurer' : 'Archiver'"
                        class="w-10 h-10 p-2"
                        outlined
                        rounded
                        severity="secondary"
                        @click="handleToggleArchive"
                    >
                        <span class="material-symbols-rounded text-sm">
                            {{ isArchived ? 'unarchive' : 'archive' }}
                        </span>
                    </Button>
                    <!-- Bouton annuler la modification -->
                    <Button
                        v-if="isEditingTitle"
                        :disabled="loading"
                        class="w-10 h-10 p-2"
                        outlined
                        rounded
                        severity="secondary"
                        title="Annuler la modification"
                        @click="cancelTitleEdit"
                    >
                        <span class="material-symbols-rounded text-sm">close</span>
                    </Button>
                </div>

                <!-- Bouton supprimer -->
                <Button
                    v-if="canDeleteTask"
                    :disabled="loading"
                    class="w-10 h-10 p-2 text-red-500 hover:text-red-600"
                    outlined
                    rounded
                    severity="secondary"
                    title="Supprimer"
                    @click="confirmDelete"
                >
                    <span class="material-symbols-rounded text-sm">delete</span>
                </Button>
            </div>
        </div>
        <!-- Dialog de confirmation de suppression -->
        <Dialog
            v-model:visible="showDeleteConfirm"
            :header="'Confirmer la suppression'"
            :modal="true"
            :style="{ width: '450px' }"
        >
            <div class="flex items-center gap-2 m-2">
                <span class="material-symbols-rounded text-yellow-500">warning</span>
                <span>Êtes-vous sûr de vouloir supprimer cette tâche ?</span>
            </div>
            <template #footer>
                <Button class="p-button-text" label="Non" @click="cancelDelete" />
                <Button
                    :loading="loading"
                    class="p-button-danger"
                    label="Oui"
                    @click="handleConfirmDelete"
                />
            </template>
        </Dialog>
    </div>
</template>
