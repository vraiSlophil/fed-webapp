<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, helpers } from '@vuelidate/validators'
import { useThemes } from '~/composables/useThemes'
import type { Theme } from '~/types/themes'

// État
const formData = reactive({
	title: '',
	color: '#FBC531'
})

const deleteDialogVisible = ref(false)
const selectedTheme = ref<Theme | null>(null)
const apiResponse = ref<any>(null)

// Validation du formulaire
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

// Initialisation du composable de thèmes
const {
	themes,
	loading,
	error,
	fetchThemes,
	createTheme,
	updateTheme,
	deleteTheme: removeTheme
} = useThemes()

// Chargement initial
onMounted(async () => {
	await fetchThemes()
})

watch(
	() => formData.color,
	(newVal, oldVal) => {
		if (newVal && !newVal.startsWith('#')) {
			formData.color = `#${newVal}`
		}
	}
)

// Méthodes du formulaire
const resetForm = () => {
	formData.title = ''
	formData.color = '#FBC531'
	v$.value.$reset()
}

const submitForm = async () => {
	const isValid = await v$.value.$validate()
	if (!isValid) return

	try {
		const newTheme = await createTheme(formData)
		apiResponse.value = { action: 'create', theme: newTheme }
		resetForm()
	} catch (err) {
		console.error(err)
	}
}

// Gestion de la mise à jour
const handleUpdate = async (themeId: string, data: { title?: string, color?: string }) => {
	try {
		const updatedTheme = await updateTheme(themeId, data)
		apiResponse.value = { action: 'update', theme: updatedTheme }
	} catch (err) {
		console.error(err)
	}
}

// Gestion de la suppression
const confirmDelete = (theme: Theme) => {
	selectedTheme.value = theme
	deleteDialogVisible.value = true
}

const deleteTheme = async () => {
	if (selectedTheme.value) {
		try {
			await removeTheme(selectedTheme.value.theme_id)
			apiResponse.value = { action: 'delete', themeId: selectedTheme.value.theme_id }
			deleteDialogVisible.value = false
			selectedTheme.value = null
		} catch (err) {
			console.error(err)
		}
	}
}
</script>

<template>
	<div class="flex min-h-screen items-center justify-center flex-col">
		<!-- Header avec navigation -->
		<div class="flex items-center justify-center mb-4 w-full">
			<span class="material-symbols-rounded text-blue-500 mr-2">arrow_back</span>
			<NuxtLink class="text-blue-500 hover:underline flex justify-center items-center" to="/">
				Retour à l'accueil
			</NuxtLink>
		</div>

		<div class="p-8 rounded shadow-md w-full max-w-lg space-y-8">
			<h1 class="text-2xl font-bold text-center mb-4">Gestion des thèmes</h1>

			<!-- Formulaire de création -->
			<form @submit.prevent="submitForm" class="space-y-4">
				<h2 class="text-lg font-semibold">Créer un nouveau thème</h2>

				<div>
					<label class="block mb-1">Titre</label>
					<InputText
						v-model="formData.title"
						class="w-full"
						placeholder="Nom du thème"
						:class="{ 'p-invalid': v$.title.$error }"
					/>
					<small v-if="v$.title.$error" class="p-error">
						{{ v$.title.$errors[0].$message }}
					</small>
				</div>

				<div>
					<label class="block mb-1">Couleur</label>
					<div class="flex items-center gap-3">
						<ColorPicker
							v-model="formData.color"
						/>
						<InputText
							class="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
							v-model="formData.color"
							placeholder="#FBC531"
						/>
					</div>
					<small v-if="v$.color.$error" class="p-error">
						{{ v$.color.$errors[0].$message }}
					</small>
				</div>

				<Button type="submit" class="w-full" :loading="loading">Créer un thème</Button>
			</form>

			<!-- Liste des thèmes -->
			<div class="space-y-4 mt-6 pt-6 border-t">
				<div class="flex justify-between items-center">
					<h2 class="text-lg font-semibold">Mes thèmes</h2>
					<Button
						@click="fetchThemes"
						:loading="loading"
					>
						<span
							v-if="loading"
							class="material-symbols-rounded animate-spin">
							progress_activity
						</span>
						<span
							v-else
							class="material-symbols-rounded">
							refresh
						</span>
					</Button>
				</div>

				<div v-if="loading && !themes.length" class="p-4 text-center">
					<i class="pi pi-spin pi-spinner text-2xl"></i>
					<p class="mt-2">Chargement des thèmes...</p>
				</div>

				<div v-else-if="!themes.length" class="p-4 text-center">
					<i class="pi pi-info-circle text-2xl text-primary"></i>
					<p class="mt-2">Aucun thème trouvé. Créez votre premier thème !</p>
				</div>

				<div v-else>
					<Theme
						v-for="theme in themes"
						:key="theme.theme_id"
						:theme="theme"
						@update="handleUpdate"
						@delete="confirmDelete"
					/>
				</div>
			</div>

			<!-- Informations de l'API (optionnel) -->
			<div v-if="apiResponse" class="mt-6 pt-6 border-t">
				<h2 class="text-lg font-semibold mb-2">Dernière réponse API</h2>
				<div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-auto max-h-60">
					<pre class="text-xs font-mono">{{ JSON.stringify(apiResponse, null, 2) }}</pre>
				</div>
			</div>
		</div>

		<!-- Dialog de confirmation de suppression -->
		<Dialog
			v-model:visible="deleteDialogVisible"
			header="Confirmer la suppression"
			:style="{ width: '30rem' }"
			:modal="true"
		>
			<div class="confirmation-content flex items-center gap-3 m-4">
				<span class="material-symbols-rounded text-yellow-500 text-2xl">warning</span>
				<span>Êtes-vous sûr de vouloir supprimer le thème <strong>{{ selectedTheme?.title }}</strong> ?</span>
			</div>
			<template #footer>
				<Button
					label="Non"
					outlined
					@click="deleteDialogVisible = false"
				/>
				<Button
					label="Oui"
					severity="danger"
					@click="deleteTheme"
					:loading="loading"
				/>
			</template>
		</Dialog>
	</div>
</template>