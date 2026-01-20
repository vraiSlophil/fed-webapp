<script lang="ts" setup>
import { useColors } from '~/domains/shared/composables/useColors';
import { useMovableThemes } from '~/domains/playground/composables/useMovableThemes';

const props = defineProps<{
    themelist: Theme[];
}>();

const emit = defineEmits(['reload']);

const { getTextColor } = useColors();
const { getStoredThemes, setThemeStored } = useMovableThemes();
const toast = useToast();

// Référence au popover
const storedThemesRef = ref();

// Computed pour récupérer les thèmes stockés
const storedThemes = computed(() => getStoredThemes(props.themelist));

const togglePanel = (event: any) => {
    // Basculer l'affichage du popover
    storedThemesRef.value?.toggle(event);
};

const restoreTheme = (theme: Theme) => {
    // Mettre stored à false
    if (setThemeStored(props.themelist, theme.theme_id, false)) {
        // Forcer le rechargement de l'affichage
        // emit('reload');

        // Notification
        toast.add({
            severity: 'success',
            summary: 'Thème restauré',
            detail: `Le thème "${theme.title}" a été remis sur le tableau`,
            life: 3000,
        });
    }
};

watch(
    storedThemes,
    () => {
        // console.log('getStoredThemes in ThemeStorage');
        // console.table(toRaw(storedThemes.value));
    },
    { immediate: true },
);
</script>

<template>
    <div>
        <!-- Bouton pour ouvrir/fermer -->
        <Button outlined rounded class="w-10 h-10 relative !overflow-visible" @click="togglePanel">
            <span class="material-symbols-rounded">inventory_2</span>

            <span
                v-if="storedThemes.length > 0"
                class="pointer-events-none text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center absolute -top-1 -right-1"
            >
                {{ storedThemes.length }}
            </span>
        </Button>

        <!-- Panel de thèmes rangés -->
        <Popover
            ref="storedThemesRef"
            class="grid overflow-hidden bg-white dark:bg-neutral-800 shadow-lg p-2 mb-4 min-w-64"
        >
            <h3
                class="flex items-center gap-2 mb-4 px-4 py-2 w-full bg-[var(--p-popover-background)] text-lg font-semibold border-b dark:border-neutral-700"
            >
                <span class="material-symbols-rounded">inventory_2</span>
                Thèmes rangés
            </h3>

            <div v-if="storedThemes.length === 0" class="text-center py-4 text-neutral-500">
                Aucun thème rangé
            </div>

            <div v-else class="max-h-80 overflow-y-auto space-y-4 rounded-lg">
                <Theme
                    v-for="theme in storedThemes"
                    :key="theme.theme_id"
                    :theme="theme"
                    variant="stored"
                >
                    <template #stored-actions="{ theme, textColor }">
                        <Button
                            :style="{
                                color: textColor,
                                borderColor: textColor,
                            }"
                            class="h-10 w-10 rounded-full"
                            outlined
                            severity="secondary"
                            title="Remettre sur le tableau"
                            @click="restoreTheme(theme)"
                        >
                            <span class="material-symbols-rounded">add</span>
                        </Button>
                    </template>
                </Theme>
            </div>
        </Popover>
    </div>
</template>
