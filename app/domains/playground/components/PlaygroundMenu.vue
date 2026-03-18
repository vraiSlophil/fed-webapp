<script lang="ts" setup>
import type { CreatePlaygroundPayload } from '~/types/playground';
import { useColors } from '~/domains/shared/composables/useColors';
import { usePlaygrounds } from '~/domains/playground/composables/usePlaygrounds';

const {
    playgrounds,
    currentPlayground,
    loading,
    error,
    fetchPlaygrounds,
    createPlayground,
    updatePlayground,
    deletePlayground,
    setDefaultPlayground,
} = usePlaygrounds();
const { getTextColor } = useColors();
const toast = useToast();
const router = useRouter();

const dialogVisible = ref(false);

const deletePlaygroundDialogVisible = ref(false);
const playgroundToDelete = reactive<{
    playground_id: string;
    name: string;
}>({
    playground_id: '',
    name: '',
});
const editPlaygroundDialogVisible = ref(false);
const editPlaygroundData = reactive<CreatePlaygroundPayload & { playground_id?: string }>({
    name: '',
    slug: '',
    icon: '',
    color: '',
    background_color: '',
    is_default: false,
});
const newPlaygroundDialogVisible = ref(false);
const newPlaygroundData = reactive<CreatePlaygroundPayload>({
    name: '',
    slug: '',
    icon: '',
    color: '',
    background_color: '',
    is_default: false,
});

const checkColor = (color: string) => {
    if (!color) return '#000000';
    if (!/^[0-9A-F]{6}$/i.test(color)) {
        return '#000000';
    } else if (color.length > 7) {
        return color.slice(0, 7);
    }
    if (/^[0-9A-F]{6}$/i.test(color)) {
        return '#' + color;
    }
    return color;
};

const handleCreatePlayground = async () => {
    try {
        if (!newPlaygroundData.name || !newPlaygroundData.slug) {
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Le nom et le slug sont requis.',
                life: 3000,
            });
            return;
        }
        if (newPlaygroundData.color) {
            newPlaygroundData.color = checkColor(newPlaygroundData.color);
        }
        if (newPlaygroundData.background_color) {
            newPlaygroundData.background_color = checkColor(newPlaygroundData.background_color);
        }
        createPlayground({ ...newPlaygroundData }).then(() => {
            fetchPlaygrounds();
            newPlaygroundDialogVisible.value = false;
            Object.keys(newPlaygroundData).forEach((key) => {
                // @ts-ignore
                newPlaygroundData[key] = key === 'is_default' ? false : '';
            });
            toast.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Playground créé avec succès.',
                life: 3000,
            });
        });
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Une erreur est survenue lors de la création du playground.',
            life: 3000,
        });
        console.error(e);
    } finally {
        newPlaygroundDialogVisible.value = false;
    }
};

const handleLoadPlaygroud = async (playgroundId: string) => {
    try {
        const playground = playgrounds.value.find((p) => p.playground_id === playgroundId);
        if (!playground) {
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Playground introuvable.',
                life: 3000,
            });
            return;
        }
        const target = playground.slug || playground.playground_id;
        await router.push(`/playground/${target}`);
        toast.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Playground chargé avec succès.',
            life: 3000,
        });
        dialogVisible.value = false;
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Une erreur est survenue lors du chargement du playground.',
            life: 3000,
        });
        console.error(e);
    }
};
const handleOpenEditDialog = (playground: any) => {
    editPlaygroundData.playground_id = playground.playground_id;
    editPlaygroundData.name = playground.name;
    editPlaygroundData.slug = playground.slug;
    editPlaygroundData.icon = playground.icon;
    editPlaygroundData.color = playground.color;
    editPlaygroundData.background_color = playground.background_color;
    editPlaygroundData.is_default = playground.is_default;
    editPlaygroundDialogVisible.value = true;
};

const handleUpdatePlayground = async () => {
    try {
        if (!editPlaygroundData.playground_id || !editPlaygroundData.name) {
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Le nom est requis.',
                life: 3000,
            });
            return;
        }
        if (editPlaygroundData.color) {
            editPlaygroundData.color = checkColor(editPlaygroundData.color);
        }
        if (editPlaygroundData.background_color) {
            editPlaygroundData.background_color = checkColor(editPlaygroundData.background_color);
        }
        await updatePlayground(editPlaygroundData.playground_id, {
            ...editPlaygroundData,
        });
        await fetchPlaygrounds(); // Recharger la liste
        editPlaygroundDialogVisible.value = false;
        toast.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Playground mis à jour avec succès.',
            life: 3000,
        });
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Une erreur est survenue lors de la mise à jour.',
            life: 3000,
        });
        console.error(e);
    }
};

watch(
    () => editPlaygroundData.name,
    (newName: string) => {
        editPlaygroundData.slug = newName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },
);
const handleDeletePlayground = async (playgroundId: string) => {
    try {
        await deletePlayground(playgroundId);
        await fetchPlaygrounds(); // Recharger la liste
        toast.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Playground supprimé avec succès.',
            life: 3000,
        });
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Une erreur est survenue lors de la suppression.',
            life: 3000,
        });
        console.error(e);
    }
};

const handleSetAsDefault = async (playgroundId: string) => {
    try {
        await setDefaultPlayground(playgroundId);
        await fetchPlaygrounds(); // Recharger la liste
        toast.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Playground défini comme par défaut.',
            life: 3000,
        });
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Une erreur est survenue.',
            life: 3000,
        });
        console.error(e);
    }
};

// watch(() => newPlaygroundData.color, (newColor) => {
// 	if (newColor) newPlaygroundData.color = checkColor(newColor);
//
// });
//
// watch(() => newPlaygroundData.background_color, (newColor) => {
// 	if (newColor) newPlaygroundData.background_color = checkColor(newColor);
// });

watch(
    () => newPlaygroundData.name,
    (newName: string) => {
        newPlaygroundData.slug = newName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },
);
</script>

<template>
    <Button
        class="playground-button w-10 h-10"
        outlined
        rounded
        data-testid="playground-menu-toggle"
        @click="dialogVisible = !dialogVisible"
    >
        <span class="material-symbols-rounded"> select_window_2 </span>
    </Button>
    <Dialog
        v-model:visible="dialogVisible"
        :closable="true"
        :modal="true"
        data-testid="playground-menu-dialog"
        :pt="{
            content: {
                style: {
                    // flex avec flex wrap pour que les playgrounds s'affichent en grille
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1rem',
                },
            },
        }"
        header="Gestion des Playgrounds"
    >
        <div
            v-for="playground in playgrounds"
            :key="playground.playground_id"
            class="flex justify-between items-center flex-col w-min p-2 gap-4 border-[1px] border-neutral-500/30 rounded-2xl"
        >
            <div
                :style="
                    `background-color: ${playground.background_color ?? 'none'};` +
                    `background-image: linear-gradient(${(playground.color ?? '#AAAAAA') + '1A'} 1px, transparent 1px), linear-gradient(90deg, ${(playground.color ?? '#AAAAAA') + '1A'} 1px, transparent 1px), linear-gradient(90deg, ${(playground.color ?? '#AAAAAA') + '1A'} 1px, transparent 1px), linear-gradient(${(playground.color ?? '#AAAAAA') + '1A'} 1px, transparent 1px);`
                "
                class="relative aspect-32/9 w-96 rounded-xl flex items-center justify-center overflow-hidden bg-[size:10px_10px,50px_50px] bg-white dark:bg-black"
            >
                <div
                    :style="{
                        color: getTextColor(playground.background_color || '#000000'),
                    }"
                    class="flex items-center gap-4"
                >
                    <span class="material-symbols-rounded">{{ playground.icon }}</span>
                    <div class="flex flex-col">
                        <span class="font-medium">{{ playground.name }}</span>
                    </div>
                    <span
                        class="absolute bottom-2 left-2 px-3 py-1 bg-[var(--p-dialog-background)] text-sm text-white font-bold border-[1px] border-amber-500/30 rounded-full"
                    >
                        Thème{{
                            (playground.themes_count! > 1 ? 's' : '') +
                            ' : ' +
                            playground.themes_count
                        }}
                    </span>
                    <span
                        v-if="playground.is_default"
                        class="material-symbols-rounded absolute bottom-2 right-2 p-1.5 bg-[var(--p-dialog-background)] text-sm text-white font-bold border-[1px] border-amber-500/30 rounded-full"
                    >
                        home
                    </span>
                </div>
            </div>
            <div>
                <div class="flex items-center gap-2">
                    <Button
                        v-if="!playground.is_default"
                        class="w-10 h-10"
                        outlined
                        rounded
                        title="Définir comme Playground par défaut"
                        :data-testid="`playground-menu-set-default-${playground.playground_id}`"
                        @click="() => handleSetAsDefault(playground.playground_id)"
                    >
                        <span class="material-symbols-rounded">home</span>
                    </Button>
                    <Button
                        :disabled="
                            !!currentPlayground &&
                            currentPlayground.playground_id === playground.playground_id
                        "
                        class="w-10 h-10"
                        outlined
                        rounded
                        title="Charger le Playground"
                        :data-testid="`playground-menu-load-${playground.playground_id}`"
                        @click="() => handleLoadPlaygroud(playground.playground_id)"
                    >
                        <span class="material-symbols-rounded">open_in_new</span>
                    </Button>
                    <Button
                        class="w-10 h-10"
                        outlined
                        rounded
                        title="Modifier le Playground"
                        :data-testid="`playground-menu-edit-${playground.playground_id}`"
                        @click="() => handleOpenEditDialog(playground)"
                    >
                        <span class="material-symbols-rounded">edit</span>
                    </Button>
                    <Button
                        :disabled="playground.is_default"
                        class="w-10 h-10"
                        outlined
                        rounded
                        title="Supprimer le Playground"
                        :data-testid="`playground-menu-delete-${playground.playground_id}`"
                        @click="
                            () => {
                                deletePlaygroundDialogVisible = !deletePlaygroundDialogVisible;
                                Object.assign(playgroundToDelete, {
                                    playground_id: playground.playground_id,
                                    name: playground.name,
                                });
                            }
                        "
                    >
                        <span class="material-symbols-rounded">delete</span>
                    </Button>
                </div>
            </div>
        </div>
        <div
            class="flex justify-between items-center flex-col w-min p-2 gap-4 border-[1px] border-neutral-500/30 rounded-2xl"
        >
            <div class="aspect-32/9 w-96 rounded-xl flex items-center justify-center">
                <div class="flex flex-col">
                    <span class="font-medium">Créer un playground</span>
                </div>
            </div>

            <Button
                class="w-10 h-10 col-span-2 mx-auto"
                outlined
                rounded
                title="Créer un nouveau Playground"
                data-testid="playground-menu-create-open"
                @click="newPlaygroundDialogVisible = true"
            >
                <span class="material-symbols-rounded">add</span>
            </Button>
        </div>

        <Dialog
            v-model:visible="newPlaygroundDialogVisible"
            class="w-1/3"
            header="Créer un nouveau Playground"
            data-testid="playground-create-dialog"
        >
            <form
                class="space-y-4"
                data-testid="playground-create-form"
                @submit.prevent="handleCreatePlayground"
            >
                <div>
                    <label class="block mb-1">Nom</label>
                    <InputText
                        v-model="newPlaygroundData.name"
                        class="w-full"
                        placeholder="Nom du playground"
                        data-testid="playground-create-name"
                    />
                </div>
                <div>
                    <label class="block mb-1">Slug</label>
                    <InputText
                        v-model="newPlaygroundData.slug"
                        class="w-full"
                        placeholder="Slug du playground"
                        data-testid="playground-create-slug"
                    />
                </div>
                <div>
                    <label class="block mb-1">Icône (Material Symbols)</label>
                    <InputText
                        v-model="newPlaygroundData.icon"
                        class="w-full"
                        placeholder="Icône du playground"
                    />
                </div>
                <div>
                    <label class="block mb-1">Couleur</label>
                    <div class="flex items-center gap-3">
                        <ColorPicker v-model="newPlaygroundData.color" />
                        <InputText v-model="newPlaygroundData.color" />
                    </div>
                </div>
                <div>
                    <label class="block mb-1">Couleur de fond</label>
                    <div class="flex items-center gap-3">
                        <ColorPicker v-model="newPlaygroundData.background_color" />
                        <InputText v-model="newPlaygroundData.background_color" />
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox v-model="newPlaygroundData.is_default" />
                    <label>Définir comme Playground par défaut</label>
                </div>
            </form>
            <template #footer>
                <Button
                    class="p-button-text"
                    label="Annuler"
                    @click="newPlaygroundDialogVisible = false"
                />
                <Button
                    label="Créer"
                    data-testid="playground-create-submit"
                    @click="handleCreatePlayground"
                />
            </template>
        </Dialog>
        <Dialog
            v-model:visible="editPlaygroundDialogVisible"
            class="w-1/3"
            header="Modifier le Playground"
            data-testid="playground-edit-dialog"
        >
            <form
                class="space-y-4"
                data-testid="playground-edit-form"
                @submit.prevent="handleUpdatePlayground"
            >
                <div>
                    <label class="block mb-1">Nom</label>
                    <InputText
                        v-model="editPlaygroundData.name"
                        class="w-full"
                        placeholder="Nom du playground"
                        data-testid="playground-edit-name"
                    />
                </div>
                <div>
                    <label class="block mb-1">Slug</label>
                    <InputText
                        v-model="editPlaygroundData.slug"
                        class="w-full"
                        placeholder="Slug du playground"
                        data-testid="playground-edit-slug"
                    />
                </div>
                <div>
                    <label class="block mb-1">Icône (Material Symbols)</label>
                    <InputText
                        v-model="editPlaygroundData.icon"
                        class="w-full"
                        placeholder="Icône du playground"
                    />
                </div>
                <div>
                    <label class="block mb-1">Couleur</label>
                    <div class="flex items-center gap-3">
                        <ColorPicker v-model="editPlaygroundData.color" />
                        <InputText v-model="editPlaygroundData.color" />
                    </div>
                </div>
                <div>
                    <label class="block mb-1">Couleur de fond</label>
                    <div class="flex items-center gap-3">
                        <ColorPicker v-model="editPlaygroundData.background_color" />
                        <InputText v-model="editPlaygroundData.background_color" />
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox v-model="editPlaygroundData.is_default" />
                    <label>Définir comme Playground par défaut</label>
                </div>
            </form>
            <template #footer>
                <Button
                    class="p-button-text"
                    label="Annuler"
                    @click="editPlaygroundDialogVisible = false"
                />
                <Button
                    label="Mettre à jour"
                    data-testid="playground-edit-submit"
                    @click="handleUpdatePlayground"
                />
            </template>
        </Dialog>
        <Dialog
            v-model:visible="deletePlaygroundDialogVisible"
            :closable="true"
            :modal="true"
            header="Confirmer la suppression du playground"
            data-testid="playground-delete-dialog"
        >
            <div class="confirmation-content flex items-center gap-3 m-4">
                <span class="material-symbols-rounded text-yellow-500 text-2xl">warning</span>
                <span
                    >Êtes-vous sûr de vouloir supprimer le playground
                    <strong>{{ playgroundToDelete.name }}</strong> ?</span
                >
            </div>
            <template #footer>
                <Button
                    label="Annuler"
                    rounded
                    text
                    @click="deletePlaygroundDialogVisible = false"
                />
                <Button
                    :loading="loading"
                    label="Supprimer"
                    outlined
                    rounded
                    severity="danger"
                    data-testid="playground-delete-confirm"
                    @click="
                        () => {
                            handleDeletePlayground(playgroundToDelete.playground_id);
                            deletePlaygroundDialogVisible = false;
                        }
                    "
                />
            </template>
        </Dialog>
    </Dialog>
</template>

<style scoped></style>
