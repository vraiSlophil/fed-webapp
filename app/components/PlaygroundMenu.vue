<script lang="ts" setup>

import type {CreatePlaygroundPayload} from "~/types/playground";

const {
	playgrounds,
	currentPlayground,
	loading,
	error,
	fetchPlaygrounds,
	createPlayground,
	fetchPlayground,
	updatePlayground,
	updateThemeInPlayground,
	deletePlayground,
	setDefaultPlayground,
	fetchPlaygroundStats
} = usePlaygrounds();
const toast = useToast();

const dialogVisible = ref(false);

const newPlaygroundDialogVisible = ref(false);
const newPlaygroundData = reactive<CreatePlaygroundPayload>({
	name: '',
	slug: '',
	icon: '',
	color: '',
	background_color: '',
	is_default: false
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
			toast.add({severity: 'error', summary: 'Erreur', detail: 'Le nom et le slug sont requis.', life: 3000});
			return;
		}
		if (newPlaygroundData.color) {
			newPlaygroundData.color = checkColor(newPlaygroundData.color);
		}
		if (newPlaygroundData.background_color) {
			newPlaygroundData.background_color = checkColor(newPlaygroundData.background_color);
		}
		createPlayground({...newPlaygroundData}).then(() => {
			fetchPlaygrounds();
			newPlaygroundDialogVisible.value = false;
			Object.keys(newPlaygroundData).forEach(key => {
				// @ts-ignore
				newPlaygroundData[key] = key === 'is_default' ? false : '';
			});
			toast.add({severity: 'success', summary: 'Succès', detail: 'Playground créé avec succès.', life: 3000});
		});
	} catch (e) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: 'Une erreur est survenue lors de la création du playground.',
			life: 3000
		});
		console.error(e);
	} finally {
		newPlaygroundDialogVisible.value = false;
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

watch(() => newPlaygroundData.name, (newName: string) => {
	newPlaygroundData.slug = newName
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
});

</script>

<template>
	<Button
		class="w-10 h-10"
		outlined
		rounded
		@click="dialogVisible = true"
	>
		<span class="material-symbols-rounded">
			select_window_2
		</span>
	</Button>
	{{ dialogVisible }}
	<Dialog
		v-model:visible="dialogVisible"
		class="grid-cols-2"
	>
		<div
			v-for="playground in playgrounds"
			:key="playground.playground_id"
			:style="{borderColor: playground.color + '66' || '#00000066'}"
			class="flex justify-between items-center mb-4 p-4 gap-4 border-[1px] rounded-full"
		>
			<div class="flex items-center gap-4">
				<span class="material-symbols-rounded">{{ playground.icon }}</span>
				<div class="flex flex-col">
					<span class="font-medium">{{ playground.name }}</span>
					<span class="text-sm text-gray-500">Thèmes : {{ playground.themes_count }}</span>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<Button
					:disabled="playground.is_default"
					class="w-10 h-10"
					outlined
					rounded
					title="Définir comme Playground par défaut"
					@click="() => setDefaultPlayground(playground.playground_id)"
				>
					<span class="material-symbols-rounded">check_circle</span>
				</Button>
				<Button
					:disabled="(currentPlayground && currentPlayground.playground.playground_id === playground.playground_id) as boolean"
					class="w-10 h-10"
					outlined
					rounded
					title="Charger le Playground"
					@click="() => fetchPlayground(playground.playground_id)"
				>
					<span class="material-symbols-rounded">login</span>
				</Button>
				<Button
					:disabled="playground.is_default"
					class="w-10 h-10"
					outlined
					rounded
					title="Supprimer le Playground"
					@click="() => deletePlayground(playground.playground_id)"
				>
					<span class="material-symbols-rounded">delete</span>
				</Button>

			</div>
		</div>

		<Button
			class="w-10 h-10 col-span-2 mx-auto"
			outlined
			rounded
			title="Créer un nouveau Playground"
			@click="newPlaygroundDialogVisible = true"
		>
			<span class="material-symbols-rounded">add</span>
		</Button>

		<Dialog
			v-model:visible="newPlaygroundDialogVisible"
			class="w-1/3"
			header="Créer un nouveau Playground"
		>
			<form class="space-y-4" @submit.prevent="handleCreatePlayground">
				<div>
					<label class="block mb-1">Nom</label>
					<InputText v-model="newPlaygroundData.name" class="w-full" placeholder="Nom du playground"/>
				</div>
				<div>
					<label class="block mb-1">Slug</label>
					<InputText v-model="newPlaygroundData.slug" class="w-full" placeholder="Slug du playground"/>
				</div>
				<div>
					<label class="block mb-1">Icône (Material Symbols)</label>
					<InputText v-model="newPlaygroundData.icon" class="w-full" placeholder="Icône du playground"/>
				</div>
				<div>
					<label class="block mb-1">Couleur</label>
					<div class="flex items-center gap-3">
						<ColorPicker v-model="newPlaygroundData.color"/>
						<InputText v-model="newPlaygroundData.color"/>
					</div>
				</div>
				<div>
					<label class="block mb-1">Couleur de fond</label>
					<div class="flex items-center gap-3">
						<ColorPicker v-model="newPlaygroundData.background_color"/>
						<InputText v-model="newPlaygroundData.background_color"/>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<Checkbox v-model="newPlaygroundData.is_default"/>
					<label>Définir comme Playground par défaut</label>
				</div>
			</form>
			<template #footer>
				<Button class="p-button-text" label="Annuler" @click="newPlaygroundDialogVisible = false"/>
				<Button label="Créer" @click="handleCreatePlayground"/>
			</template>


		</Dialog>
	</Dialog>
</template>

<style scoped>

</style>