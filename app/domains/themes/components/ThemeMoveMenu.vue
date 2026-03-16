<script lang="ts" setup>
import type { Theme } from '~/types/theme';
import type { Playground } from '~/types/playground';
import { usePlaygrounds } from '~/domains/playground/composables/usePlaygrounds';
import { useThemes } from '~/domains/themes/composables/useThemes';
import { useThemePermissions } from '~/domains/themes/composables/useThemePermissions';
import { useAuth } from '~/domains/auth/composables/useAuth';
import { useColors } from '~/domains/shared/composables/useColors';

const props = defineProps<{
    theme: Theme;
    visible: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'moved', theme: Theme, targetPlayground: Playground): void;
}>();

const { playgrounds, loading: playgroundsLoading, fetchPlaygrounds } = usePlaygrounds();
const { moveThemeToPlayground, loading: themeLoading } = useThemes();
const { isOwner } = useThemePermissions(toRef(props, 'theme'));
const { user } = useAuth();
const { getTextColor } = useColors();
const toast = useToast();

const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value),
});

const loading = computed(() => playgroundsLoading.value || themeLoading.value);

// Charger les playgrounds au montage si pas encore chargés
onMounted(async () => {
    if (playgrounds.value.length === 0) {
        await fetchPlaygrounds();
    }
});

const isCurrentPlayground = (playground: Playground) => {
    // Pour le propriétaire, vérifier le playground_id du thème
    if (isOwner.value) {
        return playground.playground_id === props.theme.playground_id;
    }
    // Pour un membre invité, vérifier le target_playground_id dans les permissions
    return playground.playground_id === props.theme.permissions?.target_playground_id;
};

const handleMoveTheme = async (targetPlayground: Playground) => {
    if (isCurrentPlayground(targetPlayground)) return;

    try {
        await moveThemeToPlayground(props.theme.theme_id, targetPlayground.playground_id, {
            isOwner: isOwner.value,
            userId: user.value?.user_id,
        });

        toast.add({
            severity: 'success',
            summary: 'Succès',
            detail: `Thème "${props.theme.title}" déplacé vers "${targetPlayground.name}".`,
            life: 3000,
        });

        emit('moved', props.theme, targetPlayground);
        dialogVisible.value = false;
    } catch (error: any) {
        console.error(error);
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.message || 'Erreur lors du déplacement du thème.',
            life: 3000,
        });
    }
};
</script>

<template>
    <Dialog
        v-model:visible="dialogVisible"
        :closable="true"
        :modal="true"
        :pt="{
            content: {
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1rem',
                },
            },
        }"
        header="Déplacer vers un Playground"
    >
        <div v-if="loading" class="col-span-2 flex justify-center items-center py-8">
            <ProgressSpinner style="width: 50px; height: 50px" stroke-width="4" />
        </div>

        <template v-else>
            <div
                v-for="playground in playgrounds"
                :key="playground.playground_id"
                :class="[
                    'flex justify-between items-center flex-col w-min p-2 gap-4 border-[1px] rounded-2xl transition-all duration-200',
                    isCurrentPlayground(playground)
                        ? 'border-neutral-500/30 opacity-50 cursor-not-allowed'
                        : 'border-neutral-500/30 hover:border-primary-500 cursor-pointer hover:shadow-lg',
                ]"
                @click="handleMoveTheme(playground)"
            >
                <div
                    :style="`background-color: ${playground.background_color ?? 'none'}; background-image: linear-gradient(${(playground.color ?? '#AAAAAA') + '1A'} 1px, transparent 1px), linear-gradient(90deg, ${(playground.color ?? '#AAAAAA') + '1A'} 1px, transparent 1px), linear-gradient(90deg, ${(playground.color ?? '#AAAAAA') + '1A'} 1px, transparent 1px), linear-gradient(${(playground.color ?? '#AAAAAA') + '1A'} 1px, transparent 1px);`"
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
                            v-if="isCurrentPlayground(playground)"
                            class="absolute bottom-2 right-2 px-3 py-1 bg-[var(--p-dialog-background)] text-sm text-white font-bold border-[1px] border-primary-500/50 rounded-full"
                        >
                            Actuel
                        </span>
                    </div>
                </div>
            </div>

            <div
                v-if="playgrounds.length === 0"
                class="col-span-2 text-center py-8 text-neutral-500"
            >
                Aucun playground disponible.
            </div>
        </template>
    </Dialog>
</template>
