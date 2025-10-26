<script lang="ts" setup>
import {useVuelidate} from '@vuelidate/core'
import {helpers, minLength, required} from '@vuelidate/validators'
import type {CreateThemePayload, Theme} from "~/types/theme";
import {usePlaygrounds} from "~/composables/usePlaygrounds";

const toast = useToast()

// Composables
const {user} = useAuth()
const {createTheme} = useThemes()
const {
	applyPositionsToThemes,
	handlePositionChange,
	setThemeStored,
	getVisibleThemes
} = useMovableThemes()
const {
	playgrounds,
	currentPlayground,
	loading: playgroundLoading,
	error,
	fetchPlaygrounds,
	fetchPlayground
} = usePlaygrounds()
const route = useRoute()

// États et validation
const formData = reactive<CreateThemePayload>({
	title: '',
	color: '#FBC531',
	playground_id: ''
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

// const currentPlaygroundCompleteData = ref<PlaygroundCompleteData | null>(null)
const isCurrentPlaygroundInitialized = ref(false)
const loading = computed(() => playgroundLoading.value)

// Themes récupérés depuis le playground
const themes = computed(() => currentPlayground.value?.themes ?? [])

const visibleThemes = computed(() => getVisibleThemes(themes.value))

// Watch currentPlayground pour recharger les données complètes
watch(
	() => currentPlayground.value?.playground.playground_id,
	async (newPlaygroundId, oldPlaygroundId) => {
		if (!isCurrentPlaygroundInitialized.value) return

		if (newPlaygroundId && newPlaygroundId !== oldPlaygroundId) {
			await reloadCurrentPlayground()
		} else if (!newPlaygroundId) {
			currentPlayground.value = null
		}
	}
)

const avatarUrl = computed(() => {
	if (!user.value || !user.value.avatar_path) return ''
	const config = useRuntimeConfig()
	return `${config.public.BACKEND_URL}/api/media/${user.value.avatar_path}`
})

const currentRoute = computed(() => route.name || '')

// Recharge les données du playground
const reloadCurrentPlayground = async (playground_id?: string) => {
	const id = playground_id ?? currentPlayground.value?.playground.playground_id
	if (!id) return
	await fetchPlayground(id)
	applyPositionsToThemes()
}

const handleThemeStored = (theme: Theme) => {
	setThemeStored(themes.value, theme.theme_id, true)
	toast.add({
		severity: 'success',
		summary: 'Thème rangé',
		detail: `Le thème "${theme.title}" a été rangé`,
		life: 3000
	})
}

const handleThemePositionChange = (themeId: string, position: any) => {
	handlePositionChange(themeId, position)
}

const contextMenuItems = ref([
	{
		label: 'Créer un thème',
		icon: 'add',
		command: () => {
			showCreateThemeDialog(true)
		}
	}
])

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

const handleNewTheme = async () => {
	const isValid = await v$.value.$validate()
	if (!isValid) return

	try {
		formData.playground_id = currentPlayground.value?.playground.playground_id || ''
		await createTheme(formData)
		showCreateThemeDialog(false)
		await reloadCurrentPlayground()

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
	}
	contextMenu.value?.show(event)
}

const closeContextMenu = (event: any) => {
	contextMenu.value?.hide(event)
}

onMounted(async () => {
	await fetchPlaygrounds()

	if (!currentPlayground.value && playgrounds.value.length) {
		const defaultPlayground = playgrounds.value.find(p => p.is_default)
		if (defaultPlayground) {
			await reloadCurrentPlayground(defaultPlayground.playground_id)
		}
	}
	else if (currentPlayground.value) {
		applyPositionsToThemes()
	}

	isCurrentPlaygroundInitialized.value = true
})

watch(() => formData.color, (newVal) => {
	if (newVal && !newVal.startsWith('#')) {
		formData.color = `#${newVal}`
	}
})
</script>

<template>
	<div class="overflow-hidden w-screen h-screen" @click="closeContextMenu">
		<Navbar
			:left-back-button="false"
			:right-login-button="true"
		>
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
						<span v-if="loading"
							  class="material-symbols-rounded animate-spin w-min">progress_activity</span>
						<span v-else class="material-symbols-rounded w-min">refresh</span>
					</Button>
					<PlaygroundMenu/>
				</div>
			</template>
		</Navbar>

		<div
			:class="'absolute top-0 left-0 flex items-center justify-center h-full w-full m-0 overflow-hidden bg-[size:20px_20px,100px_100px] bg-white dark:bg-black'"
			:style="`background-color: ${ currentPlayground?.playground.background_color ?? 'none' };` + `background-image: linear-gradient(${(currentPlayground?.playground.color ?? '#AAAAAA') + '1A'} 1px, transparent 1px), linear-gradient(90deg, ${(currentPlayground?.playground.color ?? '#AAAAAA') + '1A'} 1px, transparent 1px), linear-gradient(90deg, ${(currentPlayground?.playground.color ?? '#AAAAAA') + '1A'} 1px, transparent 1px), linear-gradient(${(currentPlayground?.playground.color ?? '#AAAAAA') + '1A'} 1px, transparent 1px);`"
			@click="closeContextMenu"
			@contextmenu.prevent="onContextMenu"
		>

<pre class="fixed top-28 left-1/40 z-1 w-19/20 max-h-200 overflow-y-scroll bg-black/60 text-white p-2 rounded text-xs">
Context Menu Position: {{ contextMenuPosition }}
Context Menu Visible: {{ contextMenu?.visible }}
Context Menu Items: {{ contextMenuItems }}
Visible Themes Count: {{ visibleThemes.length }}
All Themes Count: {{ themes.length }}
Themes: {{ toRaw(themes) }}
Playgrounds: {{ toRaw(playgrounds) }}
Current Playground: {{ currentPlayground }}
Visible Themes: {{ visibleThemes.length }}
All Themes: {{ themes.length }}
Loading: {{ loading }}
Current Playground: {{ currentPlayground?.playground.name }}
</pre>

			<Menu ref="contextMenu" :model="contextMenuItems" :style="{ top: `${contextMenuPosition.y}px`, left: `${contextMenuPosition.x}px` }" class="!absolute !w-min !min-w-min"
				  popup>
				<template #item="{ item, props }">
					<div class="flex items-center p-2 gap-4 cursor-pointer text-nowrap"
						 @click="item.command()">
						<span class="material-symbols-rounded">{{ item.icon }}</span>
						{{ item.label }}
					</div>
				</template>
			</Menu>

			<ThemeDropZone @drop-theme="handleThemeStored"/>

			<div v-if="loading && !themes.length" class="text-center">
				<span class="material-symbols-rounded animate-spin">progress_activity</span>
				<p class="mt-2">Chargement des thèmes...</p>
			</div>

			<div v-else-if="!themes.length" class="text-center">
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

		<Dialog v-model:visible="createThemeDialogVisible" :closable="true" :modal="true"
				header="Créer un nouveau thème">
			<form class="space-y-4" @submit.prevent="handleNewTheme">
				<h2 class="text-lg font-semibold">Créer un nouveau thème</h2>
				<div>
					<label class="block mb-1">Titre</label>
					<InputText v-model="formData.title" :class="{ 'p-invalid': v$.title.$error }" class="w-full"
							   placeholder="Nom du thème"/>
					<small v-if="v$.title.$error" class="p-error">{{ v$.title.$errors[0]?.$message }}</small>
				</div>
				<div>
					<label class="block mb-1">Couleur</label>
					<div class="flex items-center gap-3">
						<ColorPicker v-model="formData.color"/>
						<InputText v-model="formData.color"
								   class="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded" placeholder="#FBC531"/>
					</div>
					<small v-if="v$.color.$error" class="p-error">{{ v$.color.$errors[0]?.$message }}</small>
				</div>
			</form>
			<template #footer>
				<Button class="p-button-text" label="Annuler" @click="showCreateThemeDialog(false)"/>
				<Button :loading="loading" label="Créer" @click="handleNewTheme"/>
			</template>
		</Dialog>
	</div>
</template>