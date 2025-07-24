<script setup lang="ts">
import type {Theme} from '~/types/themes';
import {useColors} from '~/composables/useColors';

const props = defineProps<{
  themelist: Theme[]
}>();

const emit = defineEmits(['reload']);

const {getTextColor} = useColors();
const {getStoredThemes, setThemeStored} = useMovableThemes();
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
    emit('reload');

    // Notification
    toast.add({
      severity: 'success',
      summary: 'Thème restauré',
      detail: `Le thème "${theme.title}" a été remis sur le tableau`,
      life: 3000
    });
  }
};

watch(storedThemes, () => {
	console.log('getStoredThemes in ThemeStorage');
	console.table(toRaw(storedThemes.value));

}, { immediate: true });

</script>

<template>
	<div class="fixed bottom-4 right-4 z-50 flex flex-col items-end">
		<!-- Bouton pour ouvrir/fermer -->
		<Button
			@click="togglePanel"
			class="rounded-full p-3 flex items-center justify-center"
		>
			<span class="material-symbols-rounded">inventory_2</span>
			<span v-if="storedThemes.length > 0" class="ml-1 text-xs font-bold">
				{{ storedThemes.length }}
			</span>
		</Button>

		<!-- Panel de thèmes rangés -->
		<Popover
			ref="storedThemesRef"
			class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 mb-4 min-w-64 max-h-80 overflow-y-auto"
		>
			<h3 class="text-lg font-semibold mb-3 flex items-center gap-2 border-b pb-2 dark:border-gray-700">
				<span class="material-symbols-rounded">inventory_2</span>
				Thèmes rangés
			</h3>

			<div v-if="storedThemes.length === 0" class="text-center py-4 text-gray-500">
				Aucun thème rangé
			</div>

			<ul v-else class="space-y-2">
				<li
					v-for="theme in storedThemes"
					:key="theme.theme_id"
					class="rounded-lg overflow-hidden flex items-center justify-between p-2 pl-6 mt-4 w-64"
					:style="{
						backgroundColor: theme.color,
						color: getTextColor(theme.color)
				  	}"
				>
					<span class="font-medium truncate">{{ theme.title }}</span>
					<Button
						@click="restoreTheme(theme)"
						class="p-2 rounded-full"
						text
						:style="{ color: getTextColor(theme.color) }"
						title="Remettre sur le tableau"
					>
						<span class="material-symbols-rounded">add</span>
					</Button>
				</li>
			</ul>
		</Popover>
	</div>
</template>