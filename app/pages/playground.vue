<script setup lang="ts">
import {useVuelidate} from '@vuelidate/core'
import {helpers, minLength, required} from '@vuelidate/validators'
import {useThemes} from '~/composables/useThemes'
import type {Theme} from "~/types/themes";

// États et validation (code existant...)
const formData = reactive({
	title: '',
	color: '#FBC531'
})

const rules = computed(() => ({
	title: {
		required: helpers.withMessage('Le titre est requis', required),
		minLength: helpers.withMessage('Le titre doit contenir au moins 3 caractères', minLength(3))
	},
	color: {
		required: helpers.withMessage('La couleur est requise', required),
		validHex: helpers.withMessage('Format hexadécimal invalide (ex: #FF5733)', (value: string) => {
			return /^#[0-9A-F]{6}$/i.test(value)
		})
	}
}))

const v$ = useVuelidate(rules, formData)
const createThemeDialogVisible = ref(false)
const contextMenu = ref()
const contextMenuPosition = ref({x: 0, y: 0})

const toast = useToast()

// Composables
const {user} = useAuth()
const {themes, loading, fetchThemes, createTheme} = useThemes()
const {
	applyPositionsToThemes,
	handlePositionChange,
	setThemeStored,
	getVisibleThemes
} = useMovableThemes()
const route = useRoute();

const avatarUrl = computed(() => {
	if (!user.value || !user.value.avatar_path) return '';
	const config = useRuntimeConfig();
	return `${config.public.BACKEND_URL}/api/media/${user.value.avatar_path}`;
});

// Utilisez themes.value (tableau simple) pour le computed
const visibleThemes = computed(() => getVisibleThemes(themes.value));


// Obtenir la route actuelle pour la passer en paramètre 'from'
const currentRoute = computed(() => {
	return route.name || ''
});

// Fonctions (code existant adapté...)
const fetchThemesWithSavedPositions = async () => {
	await fetchThemes()
	themes.value = applyPositionsToThemes(themes.value)
}

const handleThemeStored = (theme: Theme) => {
	// Mettre le thème en stored
	setThemeStored(themes.value, theme.theme_id, true)

	// Notification
	toast.add({
		severity: 'success',
		summary: 'Thème rangé',
		detail: `Le thème "${theme.title}" a été rangé`,
		life: 3000
	})
}

const handleThemePositionChange = (themeId: string, position: any) => {
	handlePositionChange(themes, themeId, position)
}

// Reste du code existant...
const contextMenuItems = ref([
	{
		label: 'Créer un thème',
		icon: 'add',
		command: () => {
			showCreateThemeDialog(true)
		}
	}
])

onMounted(async () => {
	await fetchThemesWithSavedPositions()
})

// Autres méthodes existantes...
const showCreateThemeDialog = (bool: boolean = true) => {
	createThemeDialogVisible.value = bool
	if (bool) {
		resetForm()
	}
}

const resetForm = () => {
	formData.title = ''
	formData.color = '#FBC531'
	v$.value.$reset()
}

const submitForm = async () => {
	const isValid = await v$.value.$validate()
	if (!isValid) return

	try {
		await createTheme(formData)
		showCreateThemeDialog(false)
		await fetchThemesWithSavedPositions()
		toast.add({
			severity: 'success',
			summary: 'Succès',
			detail: `Thème "${formData.title}" créé avec succès.`,
			life: 3000
		})
	} catch (error: any) {
		console.error(error)
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message,
			life: 3000
		})
	} finally {
		resetForm()
	}
}

const onContextMenu = (event: any) => {
	contextMenuPosition.value = {
		x: event.clientX,
		y: event.clientY
	} as any
	(contextMenu.value as any)?.show(event)
}

const closeContextMenu = (event: any) => {
	(contextMenu.value as any)?.hide(event)
}

watch(() => formData.color, (newVal) => {
	if (newVal && !newVal.startsWith('#')) {
		formData.color = `#${newVal}`
	}
})

</script>

<template>
	<div @click="closeContextMenu" class="overflow-hidden w-screen h-screen">
		<Navbar
			:left-back-button="false"
		>
			<template #right>
				<Button
					v-if="user"
					:query="{ from: currentRoute }"
					severity="secondary"
					rounded
					outlined
					class="flex justify-end items-center text-zinc-700 dark:text-zinc-300 gap-4"
					@click="navigateTo('/user')"
				>
					<Avatar
						v-if="avatarUrl"
						:image="avatarUrl"
						class="border-[1px] border-zinc-500"
						shape="circle"
					/>
					<Avatar
						v-else
						class="border-[1px] border-zinc-500"
						shape="circle"
					>
						<span class="material-symbols-rounded">account_circle</span>
					</Avatar>
					{{ user && user.first_name && user.last_name ? user.first_name + ' ' + user.last_name : user?.username }}
				</Button>
			</template>
			<template #left>
				<div class="flex justify-start items-center gap-4 flex-row mx-1.5">
					<ThemeStorage
						:themelist="themes"
						@reload="fetchThemesWithSavedPositions"
					/>
					<Button @click="fetchThemesWithSavedPositions" :loading="loading">
						<span v-if="loading" class="material-symbols-rounded animate-spin w-min">progress_activity</span>
						<span v-else class="material-symbols-rounded w-min">refresh</span>
					</Button>
				</div>
			</template>
		</Navbar>
		<!-- Zone principale -->
		<div
			class="absolute top-0 left-0 flex items-center justify-center h-full w-full m-0 overflow-hidden bg-white bg-[linear-gradient(rgba(128,128,128,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.1)_1px,transparent_1px),linear-gradient(rgba(128,128,128,0.1)_1px,transparent_1px)] bg-[size:20px_20px,100px_100px] dark:bg-black dark:bg-[linear-gradient(rgba(128,128,128,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.2)_1px,transparent_1px),linear-gradient(rgba(128,128,128,0.2)_1px,transparent_1px)] dark:bg-[size:20px_20px,100px_100px]"
			@contextmenu.prevent="onContextMenu"
			@click="closeContextMenu"
		>

<!--			<div class="fixed top-20 left-4 z-0 bg-black/80 text-white p-2 rounded text-xs">-->
<!--				<div>isDragging: {{ isDragging }}</div>-->
<!--				<div>draggedTheme: {{ draggedTheme?.title || 'null' }}</div>-->
<!--				<div>dropZoneVisible: {{ dropZoneVisible }}</div>-->
<!--				<div>isHovering: {{ isHovering }}</div>-->
<!--				<div>activeDropZone: {{ activeDropZone }}</div>-->

<!--				<div>Context Menu Position: {{ contextMenuPosition }}</div>-->
<!--				<div>Context Menu Visible: {{ contextMenu?.visible }}</div>-->
<!--				<div>Context Menu Items: {{ contextMenuItems }}</div>-->
<!--				<div>Visible Themes Count: {{ visibleThemes.length }}</div>-->
<!--				<div>All Themes Count: {{ themes.length }}</div>-->
<!--				<div>Loading: {{ loading }}</div>-->

<!--				<div>-->
<!--					{{ toRaw(themes) }}-->
<!--				</div>-->
<!--			</div>-->


			<!-- Menu contextuel -->
			<Menu ref="contextMenu" :model="contextMenuItems" popup class="!absolute !w-min !min-w-min"
				  :style="{ top: `${contextMenuPosition.y}px`, left: `${contextMenuPosition.x}px` }">
				<template #item="{ item, props }">
					<div @click="item.command && item.command(true)"
						 class="flex items-center p-2 gap-4 cursor-pointer text-nowrap">
						<span class="material-symbols-rounded">{{ item.icon }}</span>
						{{ item.label }}
					</div>
				</template>
			</Menu>

			<!-- Zone de drop -->
			<ThemeDropZone @drop-theme="handleThemeStored"/>

			<!-- États de chargement/vide -->
			<div v-if="loading && !themes.length" class="text-center">
				<span v-if="loading" class="material-symbols-rounded animate-spin">progress_activity</span>
				<span v-else class="material-symbols-rounded">refresh</span>
				<p class="mt-2">Chargement des thèmes...</p>
			</div>

			<div v-else-if="!themes.length" class="text-center">
				<i class="material-symbols-rounded text-2xl text-primary">info</i>
				<p class="mt-2">Aucun thème trouvé. Créez votre premier thème !</p>
			</div>

			<!-- Conteneur des thèmes -->
			<div v-else class="w-full h-full relative overflow-hidden">
				<MovableTheme
					v-for="theme in visibleThemes"
					:key="theme.theme_id"
					:theme="theme"
					@destroy="fetchThemesWithSavedPositions"
					@position-change="handleThemePositionChange"
					@storetheme="handleThemeStored"
				/>
			</div>
		</div>

		<!-- Dialog de création (code existant...) -->
		<Dialog v-model:visible="createThemeDialogVisible" header="Créer un nouveau thème" :modal="true"
				:closable="true">
			<form @submit.prevent="submitForm" class="space-y-4">
				<h2 class="text-lg font-semibold">Créer un nouveau thème</h2>
				<div>
					<label class="block mb-1">Titre</label>
					<InputText v-model="formData.title" class="w-full" placeholder="Nom du thème"
							   :class="{ 'p-invalid': v$.title.$error }"/>
					<small v-if="v$.title.$error" class="p-error">{{ v$.title.$errors[0]?.$message }}</small>
				</div>
				<div>
					<label class="block mb-1">Couleur</label>
					<div class="flex items-center gap-3">
						<ColorPicker v-model="formData.color"/>
						<InputText class="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
								   v-model="formData.color" placeholder="#FBC531"/>
					</div>
					<small v-if="v$.color.$error" class="p-error">{{ v$.color.$errors[0]?.$message }}</small>
				</div>
			</form>
			<template #footer>
				<Button label="Annuler" @click="showCreateThemeDialog(false); closeContextMenu" class="p-button-text"/>
				<Button label="Créer" @click="submitForm" :loading="loading"/>
			</template>
		</Dialog>
	</div>
</template>