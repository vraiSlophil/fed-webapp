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

const dialogVisible = ref(false);
const newPlaygroundData = reactive<CreatePlaygroundPayload>({
	name: '',
	slug: '',
	icon: '',
	color: '',
	background_color: '',
	is_default: false
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
			class="w-max flex place-content-center mb-4 p-4 gap-4 border-[1px] rounded-full"
		>
			<div class="flex items-center gap-4">
				<span class="material-symbols-rounded">dns</span>
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

<!--		<Button-->
<!--			class="w-10 h-10 col-span-2 mx-auto"-->
<!--			outlined-->
<!--			rounded-->
<!--			title="Créer un nouveau Playground"-->
<!--			@click="() => createPlayground()"-->
<!--		>-->
<!--			<span class="material-symbols-rounded">add</span>-->
<!--		</Button>-->

	</Dialog>
</template>

<style scoped>

</style>