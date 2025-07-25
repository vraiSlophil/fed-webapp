<script setup lang="ts">
const username = ref<string>('')
const email = ref<string>('')
const password = ref<string>('')
const password_confirmation = ref<string>('')

const toast = useToast()
const {register} = useAuth()

const handleRegister = async () => {
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
	}
}
</script>

<template>
	<div class="flex min-h-screen items-center justify-center flex-col">
		<div class="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-min text-nowrap flex items-center justify-center">
			<span class="material-symbols-rounded text-blue-500 mr-2">arrow_back</span>
			<NuxtLink class="text-blue-500 hover:underline flex justify-center items-center" to="/">
				Retour à l'accueil
			</NuxtLink>
		</div>
		<form
			class="p-8 rounded shadow-md w-full max-w-sm space-y-6"
			@submit.prevent="handleRegister"
		>
			<h1 class="text-2xl font-bold text-center mb-4">Inscription</h1>
			<div>
				<InputText
					v-model="username"
					type="text"
					placeholder="Nom d'utilisateur"
					class="w-full"
				/>
			</div>
			<div>
				<InputText
					v-model="email"
					type="email"
					placeholder="Email"
					class="w-full"
				/>
			</div>
			<div>
				<Password
					v-model="password"
					placeholder="Mot de passe"
					class="w-full"
					:inputClass="'w-full'"
					toggleMask
				/>
			</div>
			<div>
				<Password
					v-model="password_confirmation"
					placeholder="Confirmer le mot de passe"
					class="w-full"
					:inputClass="'w-full'"
					toggleMask
				/>
			</div>
			<div class="flex justify-between items-center">
				<NuxtLink
					class="text-blue-500 hover:underline"
					to="/login"
				>
					Déjà inscrit ? Connectez-vous
				</NuxtLink>
			</div>
			<Button
				type="submit"
				class="w-full"
			>
				S'inscrire
			</Button>
		</form>
	</div>
</template>