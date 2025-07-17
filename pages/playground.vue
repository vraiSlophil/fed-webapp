<script setup lang="ts">
import {useVuelidate} from '@vuelidate/core'
import {helpers, minLength, required} from '@vuelidate/validators'
import {useThemes} from '~/composables/useThemes'

// État
const formData = reactive({
	title: '',
	color: '#FBC531'
})

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
const highestZIndex = ref(1)

const toast = useToast();
// Initialisation du composable de thèmes
const {
	themes,
	loading,
	fetchThemes,
	createTheme
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
		await createTheme(formData)
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
// Fonction pour gérer les changements de position des thèmes
const handlePositionChange = (themeId: string, position: { x: number, y: number, width: number, zIndex: number }) => {
  // Incrémenter le z-index le plus élevé
  highestZIndex.value += 1

  // Mettre à jour la position avec le nouveau z-index
  const themeIndex = themes.value.findIndex(t => t.theme_id === themeId)
  if (themeIndex !== -1) {
    themes.value[themeIndex].position = {
      ...position,
      zIndex: highestZIndex.value
    }
  }
}

</script>

<template>
	<div>
		<div class="flex items-center justify-center mb-4 w-full">
			<span class="material-symbols-rounded text-blue-500 mr-2">arrow_back</span>
			<NuxtLink class="text-blue-500 hover:underline flex justify-center items-center" to="/">
				Retour à l'accueil
			</NuxtLink>
		</div>
		<div
			class="flex items-center justify-center flex-col w-128 bg-white/10 dark:bg-black/10 rounded-2xl">
			<div class="p-8 w-full max-w-lg space-y-8">
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

				</div>
			</div>
		</div>
		<div
			class="
				flex items-center justify-center
				h-[90vh] w-[90vw] mx-[5vw] my-[5vh]
				bg-white
				bg-[linear-gradient(rgba(128,128,128,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.1)_1px,transparent_1px),linear-gradient(rgba(128,128,128,0.1)_1px,transparent_1px)]
				bg-[size:20px_20px,100px_100px]
			  	dark:bg-black
				dark:bg-[linear-gradient(rgba(128,128,128,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.2)_1px,transparent_1px),linear-gradient(rgba(128,128,128,0.2)_1px,transparent_1px)]
				dark:bg-[size:20px_20px,100px_100px]
			"
		>
			<div v-if="loading && !themes.length" class="text-center">
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
				<p class="mt-2">Chargement des thèmes...</p>
			</div>
			<div v-else-if="!themes.length" class="text-center">
				<i class="material-symbols-rounded text-2xl text-primary">info</i>
				<p class="mt-2">Aucun thème trouvé. Créez votre premier thème !</p>
			</div>
			<div
				v-else
				class="w-full h-full relative overflow-hidden"
			>
				<Draggable
					v-for="theme in themes"
					:key="theme.theme_id"
					:x="theme.position?.x || 0"
					:y="theme.position?.y || 0"
					:width="theme.position?.width || 450"
					:z-index="theme.position?.zIndex || 1"
					:parent="true"
					:draggable="true"
					:resizable-x="true"
					:resizable-y="false"
					:no-drag-elements="['button', 'a', 'input', '[data-no-drag]']"
					@dragend="handlePositionChange(theme.theme_id, {
						x: $event.x,
						y: $event.y,
						width: $event.width,
						zIndex: theme.position?.zIndex || 1
					});"
				>
					<Theme
						:theme="theme"
						@destroy="fetchThemes"
						@update:position="handlePositionChange"
					/>
				</Draggable>
			</div>
		</div>
	</div>
</template>