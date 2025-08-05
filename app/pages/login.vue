<script setup lang="ts">
const email = ref<string>('')
const password = ref<string>('')

const toast = useToast()
const {login} = useAuth()

const loading = ref(false)

const handleLogin = async () => {
	loading.value = true
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
			@submit.prevent="handleLogin"
		>
			<h1 class="text-2xl font-bold text-center mb-4">Connexion</h1>
			<div class="w-full">
				<InputText
					v-model="email"
					type="email"
					placeholder="Email"
					class="w-full !rounded-full !px-4"
				/>
			</div>
			<div class="w-full">
				<Password
					v-model="password"
					placeholder="Mot de passe"
					class="w-full"
					:inputClass="'w-full !px-4 !rounded-full'"
					:feedback="false"
					toggleMask
				/>
			</div>
			<div class="flex justify-between items-center w-full">
				<NuxtLink
					class="p-button p-component p-button-info p-button-text !rounded-full"
					to="/forgot-password"
				>
					Mot de passe oublié ?
				</NuxtLink>
				<NuxtLink
					class="p-button p-component p-button-info p-button-text !rounded-full"
					to="/register"
				>
					S'inscrire
				</NuxtLink>
			</div>
			<Button
				type="submit"
				outlined
				rounded
				:disabled="!email || !password || loading"
				class="w-full"
			>
				<span v-if="!loading" class="material-symbols-rounded">login</span>
				<span v-else class="material-symbols-rounded animate-spin">progress_activity</span>
				Se connecter
			</Button>
		</form>
	</div>
</template>
