<script setup lang="ts">
const username = ref<string>('')
const email = ref<string>('')
const password = ref<string>('')
const password_confirmation = ref<string>('')

const toast = useToast()
const {register} = useAuth()
const loading = ref(false)

const handleRegister = async () => {
	loading.value = true
	try {
		await register(username.value, email.value, password.value, password_confirmation.value)
		toast.add({
			severity: 'success',
			summary: 'Inscription réussie',
			detail: 'Bienvenue !',
			life: 3000
		})
		navigateTo('/')
	} catch (error: any) {
		const backendMessage = error?.data?.message || error.message || 'Erreur inconnue'
		toast.add({
			severity: 'error',
			summary: 'Erreur d\'inscription',
			detail: backendMessage,
			life: 3000
		})
	} finally {
		loading.value = false
	}
}
</script>

<template>
	<div>
		<Navbar
			:left-back-button="true"
			:right-login-button="false"
		/>

		<form
			class="min-h-screen w-full max-w-sm flex items-center justify-center flex-col m-auto space-y-6"
			@submit.prevent="handleRegister"
		>
			<h1 class="text-2xl font-bold text-center mb-4">Inscription</h1>
			<div class="w-full">
				<InputText
					v-model="username"
					placeholder="Nom d'utilisateur"
					class="w-full !px-4 !rounded-full"
				/>

			</div>
			<div class="w-full">

				<InputText
					v-model="email"
					placeholder="Email"
					class="w-full !px-4 !rounded-full"
				/>
			</div>
			<div class="w-full">

				<Password
					v-model="password"
					placeholder="Mot de passe"
					class="w-full"
					:inputClass="'w-full !px-4 !rounded-full'"
					toggleMask
				/>
			</div>
			<div class="w-full">

			<Password
					v-model="password_confirmation"
					placeholder="Confirmer le mot de passe"
					class="w-full"
					:inputClass="'w-full !px-4 !rounded-full'"
					toggleMask
				/>
			</div>
			<div class="flex justify-between items-center w-full">
				<NuxtLink
					class="p-button p-component p-button-info p-button-text !rounded-full"
					to="/login"
				>
					Déjà inscrit ? Connectez-vous
				</NuxtLink>
			</div>
			<Button
				type="submit"
				outlined
				rounded
				:disabled="!username || !email || !password || !password_confirmation || loading"
				class="w-full"
			>
				<span v-if="!loading" class="material-symbols-rounded">login</span>
				<span v-else class="material-symbols-rounded animate-spin">progress_activity</span>
				S'inscrire
			</Button>
		</form>
	</div>
</template>