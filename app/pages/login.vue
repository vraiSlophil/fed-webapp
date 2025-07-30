<script setup lang="ts">
const email = ref<string>('')
const password = ref<string>('')

const toast = useToast()
const {login} = useAuth()

const handleLogin = async () => {
	try {
		await login(email.value, password.value)
		toast.add({
			severity: 'success',
			summary: 'Connexion réussie',
			detail: 'Bienvenue !',
			life: 3000
		})
		navigateTo('/')
	} catch (error: any) {
		const backendMessage = error?.data?.message || error.message || 'Erreur inconnue'
		toast.add({
			severity: 'error',
			summary: 'Erreur de connexion',
			detail: backendMessage,
			life: 3000
		})
	}
}
</script>

<template>

	<div class="flex min-h-screen items-center justify-center flex-col ">
		<div class="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-min text-nowrap flex items-center justify-center">
			<span class="material-symbols-rounded text-blue-500 mr-2">arrow_back</span>
			<NuxtLink class="text-blue-500 hover:underline flex justify-center items-center" to="/">
				Retour à l'accueil
			</NuxtLink>
		</div>

		<form
			class=" p-8 rounded shadow-md w-full max-w-sm space-y-6"
			@submit.prevent="handleLogin"
		>
			<h1 class="text-2xl font-bold text-center mb-4">Connexion</h1>
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
					:feedback="false"
					toggleMask

				/>
			</div>
			<div class="flex justify-between items-center">
				<NuxtLink
					class="text-blue-500 hover:underline"
					to="/forgot-password"
				>
					Mot de passe oublié ?
				</NuxtLink>
				<NuxtLink
					class="text-blue-500 hover:underline"
					to="/register"
				>
					S'inscrire
				</NuxtLink>
			</div>
			<Button
				type="submit"
				class="w-full"
			>
				Se connecter
			</Button>
		</form>
	</div>
</template>
