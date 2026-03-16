<script lang="ts" setup>
import { useVuelidate } from '@vuelidate/core';
import { helpers, minLength, required } from '@vuelidate/validators';
import Navbar from '~/domains/shared/components/Navbar.vue';
import ThemeStorage from '~/domains/themes/components/ThemeStorage.vue';
import PlaygroundMenu from '~/domains/playground/components/PlaygroundMenu.vue';
import ThemeDropZone from '~/domains/playground/components/ThemeDropZone.vue';
import MovableTheme from '~/domains/playground/components/MovableTheme.vue';
import type { CreateThemePayload, Theme } from '~/types/theme';
import { usePlaygrounds } from '~/domains/playground/composables/usePlaygrounds';
import { useThemes } from '~/domains/themes/composables/useThemes';
import { useMovableThemes } from '~/domains/playground/composables/useMovableThemes';

const route = useRoute();
const idOrSlug = computed(() => route.params.id as string | undefined);

const toast = useToast();

const { createTheme } = useThemes();
const {
    // applyPositionsToThemes,
    handlePositionChange,
    setThemeStored,
    getVisibleThemes,
} = useMovableThemes();
const {
    playgrounds,
    currentPlayground,
    playgroundThemes,
    themesPagination,
    loading: playgroundLoading,
    error,
    fetchPlaygrounds,
    fetchPlaygroundMetaByIdOrSlug,
    fetchPlaygroundThemesPage,
    preloadAllThemesInBackground,
    reloadCurrentPlayground,
} = usePlaygrounds();

const formData = reactive<CreateThemePayload>({
    title: '',
    color: '#FBC531',
    playground_id: '',
});

const rules = computed(() => ({
    title: {
        required: helpers.withMessage('Le titre est requis', required),
        minLength: helpers.withMessage(
            'Le titre doit contenir au moins 3 caractères',
            minLength(3),
        ),
    },
    color: {
        required: helpers.withMessage('La couleur est requise', required),
        validHex: helpers.withMessage(
            'Format hexadécimal invalide (ex: #FF5733)',
            (value: string) => {
                return /^#[0-9A-F]{6}$/i.test(value);
            },
        ),
    },
}));

const v$ = useVuelidate(rules, formData);
const createThemeDialogVisible = ref(false);
const contextMenu = ref();
const contextMenuPosition = ref({ x: 0, y: 0 });
const isCurrentPlaygroundInitialized = ref(false);
const loading = computed(() => playgroundLoading.value || !isCurrentPlaygroundInitialized.value);

const themes = computed<Theme[]>(() => playgroundThemes.value);
const visibleThemes = computed(() => getVisibleThemes(themes.value));

const handleThemeStored = (theme: Theme) => {
    setThemeStored(themes.value, theme.theme_id, true);
    toast.add({
        severity: 'success',
        summary: 'Thème rangé',
        detail: `Le thème "${theme.title}" a été rangé`,
        life: 3000,
    });
};

const handleThemePositionChange = (themeId: string, position: any) => {
    handlePositionChange(themeId, position);
};

const contextMenuItems = ref([
    {
        label: 'Créer un thème',
        icon: 'add',
        command: () => {
            showCreateThemeDialog(true);
        },
    },
]);

const showCreateThemeDialog = (bool: boolean = true) => {
    createThemeDialogVisible.value = bool;
    if (bool) {
        resetForm();
    }
};

const resetForm = () => {
    formData.title = '';
    formData.color = '#FBC531';
    v$.value.$reset();
};

const handleNewTheme = async () => {
    const isValid = await v$.value.$validate();
    if (!isValid) return;

    try {
        formData.playground_id = currentPlayground.value?.playground_id || '';
        await createTheme(formData);
        showCreateThemeDialog(false);
        await reloadCurrentPlayground();

        toast.add({
            severity: 'success',
            summary: 'Succès',
            detail: `Thème "${formData.title}" créé avec succès.`,
            life: 3000,
        });
    } catch (error: any) {
        console.error(error);
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.message,
            life: 3000,
        });
    } finally {
        resetForm();
    }
};

const onContextMenu = (event: any) => {
    contextMenuPosition.value = {
        x: event.clientX,
        y: event.clientY,
    };
    contextMenu.value?.show(event);
};

const closeContextMenu = () => {
    contextMenu.value?.hide();
};

const initPlayground = async () => {
    await fetchPlaygrounds();

    try {
        if (idOrSlug.value) {
            await fetchPlaygroundMetaByIdOrSlug(idOrSlug.value);
        } else {
            const defaultPlayground = playgrounds.value.find((p) => p.is_default);
            if (defaultPlayground) {
                await fetchPlaygroundMetaByIdOrSlug(defaultPlayground.playground_id);
            }
        }

        if (!currentPlayground.value) {
            throw new Error('Playground introuvable');
        }

        await fetchPlaygroundThemesPage(currentPlayground.value.playground_id, 1, 20);
        // applyPositionsToThemes()

        await preloadAllThemesInBackground();
    } catch (e: any) {
        console.error(e);
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: e.message || 'Erreur lors du chargement du playground',
            life: 3000,
        });
    } finally {
        isCurrentPlaygroundInitialized.value = true;
    }
};

onMounted(async () => {
    await initPlayground();
});

watch(
    () => formData.color,
    (newVal) => {
        if (newVal && !newVal.startsWith('#')) {
            formData.color = `#${newVal}`;
        }
    },
);

watch(
    () => route.params.id,
    async (newVal, oldVal) => {
        if (newVal === oldVal) return;
        isCurrentPlaygroundInitialized.value = false;
        await initPlayground();
    },
);
</script>

<template>
    <div class="overflow-hidden w-screen h-screen">
        <div class="w-full h-full" @click="closeContextMenu">
            <Navbar :left-back-button="false" :right-login-button="true">
                <template #left>
                    <div class="flex justify-start items-center gap-4 flex-row mx-1.5">
                        <ThemeStorage
                            :themelist="themes"
                            @reload="() => reloadCurrentPlayground()"
                        />
                        <Button
                            :disabled="loading"
                            class="w-10 h-10"
                            outlined
                            rounded
                            @click="() => reloadCurrentPlayground()"
                        >
                            <span v-if="loading" class="material-symbols-rounded animate-spin w-min"
                                >progress_activity</span
                            >
                            <span v-else class="material-symbols-rounded w-min">refresh</span>
                        </Button>
                        <PlaygroundMenu />
                    </div>
                </template>
            </Navbar>

            <div class="flex items-center justify-center w-full h-full">
                <span class="material-symbols-rounded animate-spin text-4xl"
                    >progress_activity</span
                >
            </div>
            <div
                :class="'absolute top-0 left-0 flex items-center justify-center h-full w-full m-0 overflow-hidden bg-[size:20px_20px,100px_100px] bg-white dark:bg-black'"
                :style="
                    `background-color: ${currentPlayground?.background_color ?? 'none'};` +
                    `background-image: linear-gradient(${(currentPlayground?.color ?? '#AAAAAA') + '1A'} 1px, transparent 1px), linear-gradient(90deg, ${(currentPlayground?.color ?? '#AAAAAA') + '1A'} 1px, transparent 1px), linear-gradient(90deg, ${(currentPlayground?.color ?? '#AAAAAA') + '1A'} 1px, transparent 1px), linear-gradient(${(currentPlayground?.color ?? '#AAAAAA') + '1A'} 1px, transparent 1px);`
                "
                @click="closeContextMenu"
                @contextmenu.prevent="onContextMenu"
            >
                <Menu
                    ref="contextMenu"
                    :model="contextMenuItems"
                    :style="{
                        top: `${contextMenuPosition.y}px`,
                        left: `${contextMenuPosition.x}px`,
                    }"
                    class="!absolute !w-min !min-w-min"
                    popup
                >
                    <template #item="{ item }">
                        <div
                            class="flex items-center p-2 gap-4 cursor-pointer text-nowrap"
                            @click="item.command && item.command({} as any)"
                        >
                            <span class="material-symbols-rounded">{{ item.icon }}</span>
                            {{ item.label }}
                        </div>
                    </template>
                </Menu>

                <ThemeDropZone @drop-theme="handleThemeStored" />

                <div v-if="!themes.length" class="text-center">
                    <i class="material-symbols-rounded text-2xl text-primary">info</i>
                    <p class="mt-2">Aucun thème trouvé. Créez votre premier thème !</p>
                </div>

                <div v-else class="w-full h-full relative overflow-hidden">
                    <MovableTheme
                        v-for="theme in visibleThemes"
                        :key="theme.theme_id"
                        :theme="theme"
                        @destroy="() => reloadCurrentPlayground()"
                        @storetheme="handleThemeStored"
                        @position-change="handleThemePositionChange"
                    />
                </div>
            </div>

            <Dialog
                v-model:visible="createThemeDialogVisible"
                :closable="true"
                :modal="true"
                header="Créer un nouveau thème"
            >
                <form class="space-y-4" @submit.prevent="handleNewTheme">
                    <h2 class="text-lg font-semibold">Créer un nouveau thème</h2>
                    <div>
                        <label class="block mb-1">Titre</label>
                        <InputText
                            v-model="formData.title"
                            :class="{ 'p-invalid': v$.title.$error }"
                            class="w-full"
                            placeholder="Nom du thème"
                        />
                        <small v-if="v$.title.$error" class="p-error">{{
                            v$.title.$errors[0]?.$message
                        }}</small>
                    </div>
                    <div>
                        <label class="block mb-1">Couleur</label>
                        <div class="flex items-center gap-3">
                            <ColorPicker v-model="formData.color" />
                            <InputText
                                v-model="formData.color"
                                class="font-mono bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded"
                                placeholder="#FBC531"
                            />
                        </div>
                        <small v-if="v$.color.$error" class="p-error">{{
                            v$.color.$errors[0]?.$message
                        }}</small>
                    </div>
                </form>
                <template #footer>
                    <Button
                        class="p-button-text"
                        label="Annuler"
                        @click="showCreateThemeDialog(false)"
                    />
                    <Button :loading="loading" label="Créer" @click="handleNewTheme" />
                </template>
            </Dialog>
        </div>
    </div>
</template>

<style scoped></style>
