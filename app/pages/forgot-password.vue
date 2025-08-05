<script setup lang="ts">
import {ref} from 'vue'
import {HttpMethods} from '~/utils/httpMethods'

const loading = ref(false)
const toast = useToast()
const email = ref('')

const submit = async () => {
	loading.value = true
	try {
		await useApiFetch('/api/forgot-password', {
			method: HttpMethods.POST,
			body: JSON.stringify({email: email.value})
		})
		toast.add({
			severity: 'success',
			summary: 'Succès',
			detail: 'Un email de réinitialisation a été envoyé.',
			life: 3000
		})
		email.value = ''
	} catch (e: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: e?.data?.message || 'Erreur lors de l’envoi.',
			life: 4000
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
			class="w-full max-w-sm min-h-screen flex items-center justify-center flex-col m-auto space-y-6"
			@submit.prevent="submit"
		>
			<h1 class="text-2xl font-bold text-center mb-4">Mot de passe oublié</h1>
			<div class="w-full">
				<InputText
					v-model="email"
					type="email"
					placeholder="Votre email"
					class="w-full !px-4 !rounded-full"
				/>
			</div>
			<Button
				outlined
				rounded
				type="submit"
				:disabled="!email || loading"
				class="w-full"
			>
				<span v-if="!loading" class="material-symbols-rounded">send</span>
				<span v-else class="material-symbols-rounded animate-spin">progress_activity</span>
				Envoyer le lien de réinitialisation
			</Button>
		</form>
	</div>
</template>
