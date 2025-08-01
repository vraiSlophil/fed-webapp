<script setup lang="ts">
import {ref, computed, watch} from 'vue'
import {useAuth} from '~/composables/useAuth'
import {HttpMethods} from '~/utils/httpMethods'

const route = useRoute();
const router = useRouter();
const from = route.query.from as string ?? '';

const {user, fetchUser, logout} = useAuth()
const toast = useToast()

const loading = ref(false)
const editMode = ref(false)
const profileForm = ref({
	username: '',
	email: '',
	first_name: '',
	last_name: ''
})

const passwordForm = ref({
	current_password: '',
	password: '',
	password_confirmation: ''
})

const avatarUploading = ref(false)
const avatarUrl = ref('')

watch(user, (u) => {
	if (u) {
		profileForm.value = {
			username: u.username || '',
			email: u.email || '',
			first_name: u.first_name || '',
			last_name: u.last_name || ''
		}
		avatarUrl.value = u.avatar_path || ''
	}
}, {immediate: true})

const getAvatarUrl = computed(() => {
	if (!avatarUrl.value) return ''
	const config = useRuntimeConfig()
	return `${config.public.BACKEND_URL}/api/media/${avatarUrl.value}`
})

const handleLogout = () => {
	loading.value = true
	logout().then(() => {
		toast.add({
			severity: 'success',
			summary: 'Déconnexion réussie',
			detail: 'Vous avez été déconnecté avec succès.',
			life: 3000
		})
		navigateTo('/')
	}).catch((error) => {
		toast.add({
			severity: 'error',
			summary: 'Erreur de déconnexion',
			detail: error?.message || 'Une erreur est survenue lors de la déconnexion.',
			life: 4000
		})
	}).finally(() => {
		loading.value = false
	})
}

const handleProfileUpdate = async () => {
	loading.value = true
	try {
		await useApiFetch('/api/profile/update', {
			method: HttpMethods.POST,
			body: JSON.stringify(profileForm.value)
		})
		toast.add({
			severity: 'success',
			summary: 'Profil mis à jour',
			detail: 'Vos informations ont été enregistrées.',
			life: 3000
		})
		await fetchUser()
		editMode.value = false
	} catch (e: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: e?.data?.message || 'Erreur lors de la mise à jour.',
			life: 4000
		})
	} finally {
		loading.value = false
	}
}

const handlePasswordUpdate = async () => {
	loading.value = true
	try {
		await useApiFetch('/api/profile/password', {
			method: HttpMethods.POST,
			body: JSON.stringify(passwordForm.value)
		})
		toast.add({
			severity: 'success',
			summary: 'Mot de passe modifié',
			detail: 'Votre mot de passe a été changé.',
			life: 3000
		})
		passwordForm.value = {current_password: '', password: '', password_confirmation: ''}
	} catch (e: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: e?.data?.message || 'Erreur lors du changement de mot de passe.',
			life: 4000
		})
	} finally {
		loading.value = false
	}
}

const handleAvatarUpload = async (event: any) => {
	const file = event.files[0]
	if (!file) return
	avatarUploading.value = true
	try {
		const formData = new FormData()
		formData.append('avatar', file)
		await useApiFetch('/api/profile/avatar', {
			method: HttpMethods.POST,
			body: formData
		})
		toast.add({
			severity: 'success',
			summary: 'Avatar mis à jour',
			detail: 'Votre avatar a été changé.',
			life: 3000
		})
		await fetchUser()
	} catch (e: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: e?.data?.message || 'Erreur lors du changement d’avatar.',
			life: 4000
		})
	} finally {
		avatarUploading.value = false
	}
}

const goBack = () => {
	if (from) {
		// Si on a un paramètre 'from', rediriger vers cette page
		navigateTo(`/${from}`)
	} else {
		// Sinon, utiliser l'historique du navigateur ou rediriger vers l'accueil
		if (window.history.length > 1) {
			router.go(-1)
		} else {
			navigateTo('/')
		}
	}
}

const formatLastLogin = computed(() => {
	if (!user.value?.last_login_at) return ''
	return new Date(user.value.last_login_at).toLocaleString('fr-FR', {
	// 	date précise et lisible pour un humain

		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false

	})
})
</script>

<template>
	<div class="flex min-h-screen items-center justify-center flex-col">
		<Navbar>
			<template #left>
				<div class="flex justify-start items-center">
					<Button
						severity="secondary"
						outlined
						rounded
						@click="goBack"
					>
						<span class="material-symbols-rounded">arrow_back_ios_new</span>
						Retour
					</Button>
				</div>
			</template>
			<template #right>
				<div></div>
			</template>
		</Navbar>
		<section v-if="user" class="w-screen max-w-5xl">
			<h1 class="text-2xl font-bold text-center mb-4">Profil utilisateur</h1>
			<div class="grid grid-cols-2 gap-6">
				<div>
					<div class="flex flex-col items-center space-y-2 mb-8">
						<img v-if="avatarUrl" :src="getAvatarUrl" class="w-24 h-24 rounded-full object-cover border"
							 alt="Avatar"/>
						<div v-else
							 class="w-24 h-24 rounded-full bg-blue-200 flex items-center justify-center text-3xl font-bold text-blue-700">
							{{ (user.first_name || user.username || user.email).charAt(0).toUpperCase() }}
						</div>
						<FileUpload
							severity="secondary"
							mode="basic"
							name="avatar"
							accept="image/jpeg,image/png,image/jpg,image/gif"
							:auto="true"
							:customUpload="true"
							:chooseLabel="avatarUploading ? 'Chargement...' : 'Changer d\'avatar'"
							:disabled="avatarUploading"
							@uploader="handleAvatarUpload"
							class="p-button-outlined !w-full !rounded-full my-4"
							:pt="{root: '!w-full'}"
						/>
					</div>
					<form class="space-y-4" @submit.prevent="handleProfileUpdate">
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label class="block mb-1">Nom d'utilisateur</label>
								<InputText v-model="profileForm.username" class="w-full !px-4 !rounded-full"/>
							</div>
							<div>
								<label class="block mb-1">Email</label>
								<InputText v-model="profileForm.email" class="w-full !px-4 !rounded-full"/>
							</div>
							<div>
								<label class="block mb-1">Prénom</label>
								<InputText v-model="profileForm.first_name" class="w-full !px-4 !rounded-full"/>
							</div>
							<div>
								<label class="block mb-1">Nom</label>
								<InputText v-model="profileForm.last_name" class="w-full !px-4 !rounded-full"/>
							</div>
						</div>
						<Button
							outlined
							rounded
							type="submit"
							class="w-full"
							:loading="loading"
						>
							<span v-if="!loading" class="material-symbols-rounded">save</span>
							<span v-else class="material-symbols-rounded animate-spin">progress_activity</span>
							Enregistrer les modifications
						</Button>
					</form>
				</div>
				<div>
					<form class="space-y-4" @submit.prevent="handlePasswordUpdate">
						<h2 class="text-lg font-semibold">Changer le mot de passe</h2>
						<div>
							<label class="block mb-1">Mot de passe actuel</label>
							<Password v-model="passwordForm.current_password" class="w-full" :inputClass="'w-full !px-4 !rounded-full'" toggleMask/>
						</div>
						<div>
							<label class="block mb-1">Nouveau mot de passe</label>
							<Password v-model="passwordForm.password" class="w-full" :inputClass="'w-full !px-4 !rounded-full'" toggleMask/>
						</div>
						<div>
							<label class="block mb-1">Confirmer le nouveau mot de passe</label>
							<Password v-model="passwordForm.password_confirmation" class="w-full" :inputClass="'w-full !px-4 !rounded-full'" toggleMask/>
						</div>
						<Button
							outlined
							rounded
							type="submit"
							class="w-full"
							:loading="loading"
						>
							<span v-if="!loading" class="material-symbols-rounded">lock_reset</span>
							<span v-else class="material-symbols-rounded animate-spin">progress_activity</span>
							Changer le mot de passe
						</Button>
					</form>
					<div class="mt-8 text-sm text-gray-600 space-y-1">
						<div v-if="user.last_login_at">
							Dernière connexion : <span class="font-medium">{{ formatLastLogin }}</span>
						</div>
						<div v-if="user.last_login_ip">
							IP de dernière connexion : <span class="font-mono">{{ user.last_login_ip }}</span>
						</div>
					</div>
					<div class="w-full flex justify-center">
						<Button
							severity="secondary"
							outlined
							rounded
							@click="handleLogout"
							class="m-4"
						>
							<span class="material-symbols-rounded">
								logout
							</span>
							Se déconnecter
						</Button>
					</div>
				</div>
			</div>
		</section>
		<div v-else>Chargement...</div>
	</div>
</template>

<style scoped>

</style>
