<script lang="ts" setup>

// use admin.ts middleware
definePageMeta({
	middleware: 'admin'
})

import type {
	User,
	Role,
	UserResponse,
	UserSpecificMetrics,
	UsersMetrics, UserDetailsResponse
} from '~/types/user'

interface AdminStats {
	total_users: number
	active_users: number
	blocked_users: number
	verified_users: number
	recent_registrations: number
}

const activeTab = ref<number>(0)
const users = ref<User[]>([])
const selectedUser = ref<User | null>(null)
const userMetrics = ref<UserSpecificMetrics | null>(null)
const roles = ref<Role[]>([])
const globalStats = ref<UsersMetrics | null>(null)
const loading = ref(false)
const totalUsers = ref(0)
const currentPage = ref(1)

// Filtres
const searchQuery = ref('')
const selectedRole = ref<number | null>(null)
const selectedStatus = ref<string>('')

// Formulaires
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const createForm = ref({
	username: '',
	email: '',
	password: '',
	password_confirmation: '',
	first_name: '',
	last_name: '',
	role_power: 1,
	avatar: null as File | null
})

const editForm = ref({
	username: '',
	email: '',
	password: '',
	password_confirmation: '',
	first_name: '',
	last_name: '',
	role_power: 1,
	avatar: null as File | null
})

const avatarPreview = ref<string | null>(null)

// Ajouter ces nouvelles variables
const deleteDialogVisible = ref(false)
const userToDelete = ref<User | null>(null)

const toast = useToast()

// Modifier la fonction deleteUser pour inclure la confirmation
const confirmDeleteUser = (user: User) => {
	userToDelete.value = user
	deleteDialogVisible.value = true
}


// Charger les utilisateurs
const loadUsers = async () => {
	loading.value = true
	try {
		const config = useRuntimeConfig()
		const params = new URLSearchParams()
		if (searchQuery.value) params.append('search', searchQuery.value)
		if (selectedRole.value) params.append('role', selectedRole.value.toString())
		if (selectedStatus.value) params.append('status', selectedStatus.value)
		params.append('page', currentPage.value.toString())

		const response = (await useApiFetch(`/api/admin/users?${params.toString()}`) as any).data as UserResponse
		users.value = response.users.map(user => {
			return {
				...user,
				avatar_path: user.avatar_path ? `${config.public.BACKEND_URL}/api/media/${user.avatar_path}` : null
			}
		})
		roles.value = response.roles.map(role => {
			return {
				...role,
				name: role.name.charAt(0).toUpperCase() + role.name.slice(1)
			}
		})
		globalStats.value = response.stats
		totalUsers.value = response.stats.total_users
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			life: 3000,
			detail: error.message || 'Erreur lors du chargement des utilisateurs'
		})
	} finally {
		loading.value = false
	}
}

// Charger les détails d'un utilisateur
const loadUserDetails = async (user: User) => {
	try {
		const response = (await useApiFetch(`/api/admin/users/${user.user_id}`) as any).data as UserDetailsResponse
		selectedUser.value = (() => {
			const userData = response.user
			return {
				...userData,
				avatar_path: userData.avatar_path ? `${useRuntimeConfig().public.BACKEND_URL}/api/media/${userData.avatar_path}` : null
			}
		})()
		userMetrics.value = response.additional_stats
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			life: 3000,
			detail: error.message || 'Erreur lors du chargement des détails'
		})
	}
}

// // Charger les métriques d'un utilisateur
// const loadUserMetrics = async (userId: string) => {
// 	try {
// 		userMetrics.value = await useApiFetch(`/api/admin/users/${userId}/metrics`)
// 	} catch (error: any) {
// 		toast.add({
// 			severity: 'error',
// 			summary: 'Erreur',
// 			life: 3000,
// 			detail: error.message || 'Erreur lors du chargement des métriques'
// 		})
// 	}
// }

// Créer un utilisateur
const createUser = async () => {
	try {
		const formData = new FormData()
		Object.entries(createForm.value).forEach(([key, value]) => {
			if (value !== null && value !== '') {
				formData.append(key, value as string | Blob)
			}
		})

		await useApiFetch('/api/admin/users', {
			method: HttpMethods.POST,
			body: formData
		})

		toast.add({
			severity: 'success',
			summary: 'Succès',
			life: 3000,
			detail: 'Utilisateur créé avec succès'
		})

		showCreateDialog.value = false
		resetCreateForm()
		await loadUsers()
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			life: 3000,
			detail: error.message || 'Erreur lors de la création'
		})
	}
}

// Modifier un utilisateur
const updateUser = async () => {
	if (!selectedUser.value) return

	try {
		const formData = new FormData()
		Object.entries(editForm.value).forEach(([key, value]) => {
			if (value !== null && value !== '') {
				formData.append(key, value as string | Blob)
			}
		})

		await useApiFetch(`/api/admin/users/${selectedUser.value.user_id}`, {
			method: HttpMethods.POST,
			body: formData
		})

		toast.add({
			severity: 'success',
			summary: 'Succès',
			life: 3000,
			detail: 'Utilisateur modifié avec succès'
		})

		showEditDialog.value = false
		await loadUsers()
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			life: 3000,
			detail: error.message || 'Erreur lors de la modification'
		})
	}
}

// Créer une nouvelle fonction pour effectuer la suppression après confirmation
const handleDeleteUser = async () => {
	if (!userToDelete.value) return

	try {
		await useApiFetch(`/api/admin/users/${userToDelete.value.user_id}`, {
			method: HttpMethods.DELETE
		})

		toast.add({
			severity: 'success',
			summary: 'Succès',
			detail: 'Utilisateur supprimé avec succès',
			life: 3000
		})

		await loadUsers()
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			life: 3000,
			detail: error.message || 'Erreur lors de la suppression'
		})
	} finally {
		deleteDialogVisible.value = false
		userToDelete.value = null
	}
}


// Bloquer un utilisateur
const blockUser = async (user: User) => {
	try {
		await useApiFetch(`/api/admin/users/${user.user_id}/block`, {
			method: HttpMethods.POST
		})

		toast.add({
			severity: 'success',
			summary: 'Succès',
			life: 3000,
			detail: 'Utilisateur bloqué avec succès'
		})

		await loadUsers()
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			life: 3000,
			detail: error.message || 'Erreur lors du blocage'
		})
	}
}

// Débloquer un utilisateur
const unblockUser = async (user: User) => {
	try {
		await useApiFetch(`/api/admin/users/${user.user_id}/unblock`, {
			method: HttpMethods.POST
		})

		toast.add({
			severity: 'success',
			summary: 'Succès',
			life: 3000,
			detail: 'Utilisateur débloqué avec succès'
		})

		await loadUsers()
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			life: 3000,
			detail: error.message || 'Erreur lors du déblocage'
		})
	}
}

// Fonction pour gérer le changement de fichier
const handleFileChange = (event: Event, formType: 'create' | 'edit') => {
	const target = event.target as HTMLInputElement

	if (target.files && target.files.length > 0) {
		const file = target.files[0]

		// Vérifier que c'est bien une image
		if (!file.type.startsWith('image/')) {
			toast.add({
				severity: 'error',
				summary: 'Erreur',
				detail: 'Le fichier doit être une image',
				life: 3000
			})
			return
		}

		// Créer une URL pour la prévisualisation
		avatarPreview.value = URL.createObjectURL(file)

		// Mettre à jour le formulaire approprié
		if (formType === 'create') {
			createForm.value.avatar = file
		} else {
			editForm.value.avatar = file
		}
	}
}

// Pour nettoyer l'URL de prévisualisation quand on ferme le formulaire
const cleanupPreview = () => {
	if (avatarPreview.value) {
		URL.revokeObjectURL(avatarPreview.value)
		avatarPreview.value = null
	}
}


// Utilitaires
const resetCreateForm = () => {
	createForm.value = {
		username: '',
		email: '',
		password: '',
		password_confirmation: '',
		first_name: '',
		last_name: '',
		role_power: 1,
		avatar: null
	}
	cleanupPreview()
}

const prepareEditForm = (user: User) => {
	editForm.value = {
		username: user.username,
		email: user.email,
		password: '',
		password_confirmation: '',
		first_name: user.first_name || '',
		last_name: user.last_name || '',
		role_power: user.role_power,
		avatar: null
	}
	selectedUser.value = user
	showEditDialog.value = true

	// Si l'utilisateur a déjà un avatar, l'utiliser comme prévisualisation
	if (user.avatar_path) {
		avatarPreview.value = user.avatar_path
	} else {
		avatarPreview.value = null
	}
}


const getRoleLabel = (power: number) => {
	const role = roles.value.find(r => r.power === power)
	return role?.name || `Rôle ${power}`
}

const onPageChange = (event: any) => {
	currentPage.value = event.page + 1
	loadUsers()
}

const switchToUserDetails = (user: User) => {
	loadUserDetails(user)
	activeTab.value = 1
}

// Watchers pour les filtres
let filterTimeout: ReturnType<typeof setTimeout> | null = null

watch([searchQuery, selectedRole, selectedStatus], () => {
	if (filterTimeout) clearTimeout(filterTimeout)
	filterTimeout = setTimeout(() => {
		currentPage.value = 1
		loadUsers()
	}, 500)
})

watch(showCreateDialog, (newVal) => {
	if (!newVal) cleanupPreview()
})

watch(showEditDialog, (newVal) => {
	if (!newVal) cleanupPreview()
})

// Chargement initial
onMounted(() => {
	loadUsers()
})
</script>


<template>
	<div class="p-8">
		<div
			class="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-min text-nowrap flex items-center justify-center">
			<span class="material-symbols-rounded text-blue-500 mr-2">arrow_back</span>
			<NuxtLink class="text-blue-500 hover:underline flex justify-center items-center" to="/">
				Retour à l'accueil
			</NuxtLink>
		</div>
		<div class="w-min min-w-7xl mx-auto">
			<!-- Header -->
			<div class="flex items-center justify-between mb-8">
				<div class="flex items-center">

					<h1 class="text-3xl font-bold text-gray-900 dark:text-white">
						Administration
					</h1>
				</div>
			</div>

			<!-- Tabs -->
			<LazyTabs v-model:value="activeTab"
					  class="mb-6 border-[1px] border-slate-200 dark:border-zinc-700 rounded-3xl overflow-hidden">
				<TabList>
					<Tab :value="0" class="flex justify-center items-center">
						<span class="material-symbols-rounded mr-2">group</span>
						Utilisateurs
					</Tab>
					<Tab :value="1" class="flex justify-center items-center">
						<span class="material-symbols-rounded mr-2">info</span>
						Détails Utilisateur
					</Tab>
				</TabList>
				<TabPanels>
					<TabPanel :value="0">
						<!-- Statistiques globales -->
						<div
							:class="globalStats ? 'blur-none' : 'blur-sm'"
							class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
						>
							<Card class="border-[1px] border-slate-200 dark:border-zinc-700">

								<template #content>
									<div class="flex items-center">
										<span class="material-symbols-rounded !text-4xl text-blue-600 mr-3">
											group
										</span>
										<div>
											<div class="text-2xl font-bold text-gray-900 dark:text-white">
												{{ globalStats?.total_users || 0 }}
											</div>
											<div class="text-sm text-gray-600 dark:text-gray-400">
												Total utilisateurs
											</div>
										</div>
									</div>
								</template>
							</Card>

							<Card class="border-[1px] border-slate-200 dark:border-zinc-700">
								<template #content>
									<div class="flex items-center">
										<span class="material-symbols-rounded !text-4xl text-green-600 mr-3">
											group
										</span>
										<div>
											<div class="text-2xl font-bold text-gray-900 dark:text-white">
												{{ globalStats?.active_users || 0 }}
											</div>
											<div class="text-sm text-gray-600 dark:text-gray-400">
												Actifs
											</div>
										</div>
									</div>
								</template>
							</Card>

							<Card class="border-[1px] border-slate-200 dark:border-zinc-700">
								<template #content>
									<div class="flex items-center">
										<span class="material-symbols-rounded !text-4xl text-red-600 mr-3">
											block
										</span>
										<div>
											<div class="text-2xl font-bold text-gray-900 dark:text-white">
												{{ globalStats?.blocked_users || 0 }}
											</div>
											<div class="text-sm text-gray-600 dark:text-gray-400">
												Bloqués
											</div>
										</div>
									</div>
								</template>
							</Card>

							<Card class="border-[1px] border-slate-200 dark:border-zinc-700">
								<template #content>
									<div class="flex items-center">
										<span class="material-symbols-rounded !text-4xl text-yellow-600 mr-3">
											verified_user
										</span>
										<div>
											<div class="text-2xl font-bold text-gray-900 dark:text-white">
												{{ globalStats?.verified_users || 0 }}
											</div>
											<div class="text-sm text-gray-600 dark:text-gray-400">
												Vérifiés
											</div>
										</div>
									</div>
								</template>
							</Card>

							<Card class="border-[1px] border-slate-200 dark:border-zinc-700">
								<template #content>
									<div class="flex items-center">
										<span class="material-symbols-rounded !text-4xl text-purple-600 mr-3">
											access_time
										</span>
										<div>
											<div class="text-2xl font-bold text-gray-900 dark:text-white">
												{{ globalStats?.created_last_7_days || 0 }}
											</div>
											<div class="text-sm text-gray-600 dark:text-gray-400">
												Créés ces 7 derniers jours
											</div>
										</div>
									</div>
								</template>
							</Card>

							<Card class="border-[1px] border-slate-200 dark:border-zinc-700">
								<template #content>
									<div class="flex items-center">
										<span class="material-symbols-rounded !text-4xl text-pink-500 mr-3">
											verified_user
										</span>
										<div>
											<div class="text-2xl font-bold text-gray-900 dark:text-white">
												{{ globalStats?.verified_last_7_days || 0 }}
											</div>
											<div class="text-sm text-gray-600 dark:text-gray-400">
												Comptes validés ces 7 derniers jours
											</div>
										</div>
									</div>
								</template>
							</Card>
						</div>

						<!-- Filtres et actions -->
						<Card class="mb-6 border-[1px] border-slate-200 dark:border-zinc-700">
							<template #content>
								<div class="flex flex-wrap items-center gap-4">
										<IconField class="flex-1 relative max-w-lg min-w-sm">
											<span
												class="material-symbols-rounded text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2">
												search
											</span>
											<InputText
												v-model="searchQuery"
												class="w-full h-11.5 pl-10 pr-4 py-2 text-sm flex items-center justify-between"
												placeholder="Rechercher par nom, email..."
											/>
										</IconField>
									<Select
										v-model="selectedRole"
										:options="roles"
										class="flex-1 h-11.5 flex justify-center items-center"
										option-label="name"
										option-value="power"
										placeholder="Filtrer par rôle"
										show-clear
									/>

									<Select
										v-model="selectedStatus"
										:options="[
											{ label: 'Actifs', value: 'active' },
											{ label: 'Bloqués', value: 'blocked' }
										]"
										class="flex-1 h-11.5 flex justify-center items-center"
										option-label="label"
										option-value="value"
										placeholder="Filtrer par statut"
										show-clear
									/>

									<Button
										class="flex-1 h-11.5"
										severity="primary"
										@click="showCreateDialog = true"
									>
										<span class="material-symbols-rounded mr-2">add</span>
										Créer un utilisateur
									</Button>
								</div>
							</template>
						</Card>

						<!-- Table des utilisateurs -->
						<Card class="border-[1px] border-slate-200 dark:border-zinc-700">
							<template #content>
								<div
									v-if="loading"
									class="flex items-center justify-center w-full h-42"
								>
									<span class="material-symbols-rounded text-gray-400 !text-4xl animate-spin">
										progress_activity
									</span>
								</div>
								<DataTable
									v-else
									:rows="20"
									:total-records="totalUsers"
									:value="users"
									lazy
									paginator
									@page="onPageChange"
								>
									<Column field="username" header="Nom d'utilisateur" sortable>
										<template #body="slotProps">
											<div class="flex items-center">
												<Avatar
													v-if="slotProps.data.avatar_path"
													:image="slotProps.data.avatar_path"
													class="mr-2"
													shape="circle"
													size="small"
												/>
												<Avatar
													v-else
													:label="slotProps.data.username.charAt(0).toUpperCase()"
													class="mr-2"
													shape="circle"
													size="small"
												/>
												<span class="font-medium">{{ slotProps.data.username }}</span>
											</div>
										</template>
									</Column>

									<Column field="email" header="Email" sortable/>

									<Column field="first_name" header="Prénom">
										<template #body="slotProps">
											{{ slotProps.data.first_name || '-' }}
										</template>
									</Column>

									<Column field="last_name" header="Nom">
										<template #body="slotProps">
											{{ slotProps.data.last_name || '-' }}
										</template>
									</Column>

									<Column field="role_power" header="Rôle">
										<template #body="slotProps">
											<Tag
												:severity="slotProps.data.role_power >= 100 ? 'danger' : 'info'"
												:value="getRoleLabel(slotProps.data.role_power)"
											/>
										</template>
									</Column>

									<Column header="Statut">
										<template #body="slotProps">
											<Tag
												:severity="slotProps.data.blocked_at ? 'danger' : 'success'"
												:value="slotProps.data.blocked_at ? 'Bloqué' : 'Actif'"
											/>
										</template>
									</Column>

									<Column field="created_at" header="Créé le">
										<template #body="slotProps">
											{{ new Date(slotProps.data.created_at).toLocaleDateString('fr-FR') }}
										</template>
									</Column>

									<Column header="Actions">
										<template #body="slotProps">
											<div class="flex gap-2">
												<Button
													v-tooltip.bottom="'Voir les détails'"
													class="w-10 h-10 p-0"
													severity="info"
													size="small"
													@click="switchToUserDetails(slotProps.data)"

												>
												<span
													class="material-symbols-rounded text-sm"
												>
													visibility
												</span>
												</Button>
<!--												<Button-->
<!--													size="small"-->
<!--													severity="secondary"-->
<!--													class="w-10 h-10 p-0"-->
<!--													@click="loadUserMetrics(slotProps.data.user_id)"-->
<!--													v-tooltip.bottom="'Voir les métriques'"-->
<!--												>-->
<!--													<span class="material-symbols-rounded text-sm">analytics</span>-->
<!--												</Button>-->
												<Button
													v-tooltip.bottom="'Modifier'"
													class="w-10 h-10 p-0"
													severity="warning"
													size="small"
													@click="prepareEditForm(slotProps.data)"
												>
													<span class="material-symbols-rounded text-sm">edit</span>
												</Button>
												<Button
													v-if="!slotProps.data.blocked_at"
													v-tooltip.bottom="'Bloquer'"
													class="w-10 h-10 p-0"
													severity="danger"
													size="small"
													@click="blockUser(slotProps.data)"
												>
													<span class="material-symbols-rounded text-sm">block</span>
												</Button>
												<Button
													v-else
													v-tooltip.bottom="'Débloquer'"
													class="w-10 h-10 p-0"
													severity="success"
													size="small"
													@click="unblockUser(slotProps.data)"
												>
													<span class="material-symbols-rounded text-sm">check_circle</span>
												</Button>
												<Button
													v-tooltip.bottom="'Supprimer'"
													class="w-10 h-10 p-0"
													severity="danger"
													size="small"
													@click="confirmDeleteUser(slotProps.data)"
												>
													<span class="material-symbols-rounded text-sm">delete</span>
												</Button>
											</div>
										</template>
									</Column>
								</DataTable>
							</template>
						</Card>
					</TabPanel>

					<TabPanel :value="1" v-if="selectedUser">
						<div v-if="selectedUser" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<!-- Informations de base -->
							<Card class="border-[1px] border-slate-200 dark:border-zinc-700">
								<template #title>
									<div class="flex items-center">
										<span class="material-symbols-rounded mr-2 text-gray-600 dark:text-gray-300">
											info
										</span>
										Informations de base
									</div>
								</template>
								<template #content>
									<div class="space-y-4">
										<div class="flex items-center justify-center mb-4">
											<Avatar
												v-if="selectedUser.avatar_path"
												:image="selectedUser.avatar_path"
												shape="circle"
												size="xlarge"
											/>
											<Avatar
												v-else
												:label="selectedUser.username.charAt(0).toUpperCase()"
												shape="circle"
												size="xlarge"
											/>
										</div>

										<div class="grid grid-cols-2 gap-4">
											<div>
												<label
													class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
													ID Utilisateur
												</label>
												<div class="text-sm text-gray-600 dark:text-gray-400">
													{{ selectedUser.user_id }}
												</div>
											</div>

											<div>
												<label
													class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
													Nom d'utilisateur
												</label>
												<div class="text-sm text-gray-600 dark:text-gray-400">
													{{ selectedUser.username }}
												</div>
											</div>

											<div>
												<label
													class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
													Email
												</label>
												<div class="text-sm text-gray-600 dark:text-gray-400">
													{{ selectedUser.email }}
												</div>
											</div>

											<div>
												<label
													class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
													Email vérifié
												</label>
												<Tag
													:severity="selectedUser.email_verified_at ? 'success' : 'warning'"
													:value="selectedUser.email_verified_at ? 'Vérifié' : 'Non vérifié'"
												/>
											</div>

											<div>
												<label
													class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
													Prénom
												</label>
												<div class="text-sm text-gray-600 dark:text-gray-400">
													{{ selectedUser.first_name || '-' }}
												</div>
											</div>

											<div>
												<label
													class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
													Nom
												</label>
												<div class="text-sm text-gray-600 dark:text-gray-400">
													{{ selectedUser.last_name || '-' }}
												</div>
											</div>

											<div>
												<label
													class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
													Rôle
												</label>
												<Tag
													:severity="selectedUser.role_power >= 100 ? 'danger' : 'info'"
													:value="getRoleLabel(selectedUser.role_power)"
												/>
											</div>

											<div>
												<label
													class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
													Statut
												</label>
												<Tag
													:severity="selectedUser.blocked_at ? 'danger' : 'success'"
													:value="selectedUser.blocked_at ? 'Bloqué' : 'Actif'"
												/>
											</div>

											<div>
												<label
													class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
													Dernière connexion
												</label>
												<div class="text-sm text-gray-600 dark:text-gray-400">
													{{
														selectedUser.last_login_at ? new Date(selectedUser.last_login_at).toLocaleString('fr-FR') : 'Jamais'
													}}
												</div>
											</div>

											<div>
												<label
													class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
													IP dernière connexion
												</label>
												<div class="text-sm text-gray-600 dark:text-gray-400">
													{{ selectedUser.last_login_ip || '-' }}
												</div>
											</div>

											<div>
												<label
													class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
													Email vérifié le
												</label>
												<div class="text-sm text-gray-600 dark:text-gray-400">
													{{
														selectedUser.email_verified_at ? new Date(selectedUser.email_verified_at).toLocaleString('fr-FR') : 'Non vérifié'
													}}
												</div>
											</div>

											<div>
												<label
													class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
													Bloqué le
												</label>
												<div class="text-sm text-gray-600 dark:text-gray-400">
													{{
														selectedUser.blocked_at ? new Date(selectedUser.blocked_at).toLocaleString('fr-FR') : '-'
													}}
												</div>
											</div>

											<div>
												<label
													class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
													Créé le
												</label>
												<div class="text-sm text-gray-600 dark:text-gray-400">
													{{
														selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString('fr-FR') : '-'
													}}
												</div>
											</div>

											<div>
												<label
													class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
													Dernière modification
												</label>
												<div class="text-sm text-gray-600 dark:text-gray-400">
													{{
														selectedUser.updated_at ? new Date(selectedUser.updated_at).toLocaleString('fr-FR') : '-'
													}}
												</div>
											</div>
										</div>
									</div>
								</template>
							</Card>

							<!-- Métriques détaillées -->
							<Card class="border-[1px] border-slate-200 dark:border-zinc-700">
								<template #title>
									<div class="flex items-center">
										<span class="material-symbols-rounded mr-2 text-gray-600 dark:text-gray-300">
											analytics
										</span>
										Métriques et statistiques
									</div>
								</template>
								<template #content>
									<div class="space-y-6">
										<!-- Stats de base -->
										<div>
											<h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
												Activité générale</h4>
											<div class="grid grid-cols-2 gap-4">
												<div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
													<div class="text-2xl font-bold text-blue-600">
														{{ userMetrics.themes_count }}
													</div>
													<div class="text-sm text-gray-600 dark:text-gray-400">Thèmes créés
													</div>
												</div>
												<div
													class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
													<div class="text-2xl font-bold text-green-600">
														{{ userMetrics.tasks_count }}
													</div>
													<div class="text-sm text-gray-600 dark:text-gray-400">Tâches
														totales
													</div>
												</div>
												<div
													class="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
													<div class="text-2xl font-bold text-purple-600">
														{{ userMetrics.completed_tasks_count }}
													</div>
													<div class="text-sm text-gray-600 dark:text-gray-400">Tâches
														terminées
													</div>
												</div>
												<div
													class="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
													<div class="text-2xl font-bold text-orange-600">
														{{ userMetrics.completion_rate_percentage }}%
													</div>
													<div class="text-sm text-gray-600 dark:text-gray-400">Taux de
														completion
													</div>
												</div>
											</div>
										</div>

										<!-- Collaboration -->
										<div>
											<h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
												Collaboration</h4>
											<div class="grid grid-cols-2 gap-4">
												<div class="text-center p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
													<div class="text-2xl font-bold text-cyan-600">
														{{ userMetrics.themes_as_member }}
													</div>
													<div class="text-sm text-gray-600 dark:text-gray-400">Thèmes
														membre
													</div>
												</div>
												<div
													class="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
													<div class="text-2xl font-bold text-yellow-600">
														{{ userMetrics.pending_invitations }}
													</div>
													<div class="text-sm text-gray-600 dark:text-gray-400">Invitations en
														attente
													</div>
												</div>
											</div>
										</div>

										<!-- Temps et activité -->
										<div>
											<h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
												Temps et activité</h4>
											<div class="grid grid-cols-2 gap-4">
												<div class="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
													<div class="text-lg font-bold text-gray-700 dark:text-gray-300">
														{{ userMetrics.account_age_days }}
													</div>
													<div class="text-sm text-gray-600 dark:text-gray-400">Jours
														d'ancienneté
													</div>
												</div>
												<div
													class="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
													<div class="text-lg font-bold text-indigo-600">
														{{ userMetrics.days_since_last_login ?? 'N/A' }}
													</div>
													<div class="text-sm text-gray-600 dark:text-gray-400">Jours depuis
														dernière connexion
													</div>
												</div>
											</div>
											<div class="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
												<div
													class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
													Ancienneté du compte
												</div>
												<div class="text-xs text-gray-600 dark:text-gray-400">
													{{ userMetrics.account_age_human }}
												</div>
											</div>
											<div class="mt-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
												<div
													class="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">
													Dernière activité
												</div>
												<div class="text-xs text-gray-600 dark:text-gray-400">
													{{ new Date(userMetrics.last_activity).toLocaleString('fr-FR') }}
												</div>
											</div>
										</div>

										<!-- Activité récente -->
										<div>
											<h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
												Activité récente</h4>
											<div class="grid grid-cols-3 gap-3">
												<div class="text-center p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
													<div class="text-lg font-bold text-rose-600">
														{{ userMetrics.recent_activity.tasks_last_7_days }}
													</div>
													<div class="text-xs text-gray-600 dark:text-gray-400">Tâches 7j
													</div>
												</div>
												<div
													class="text-center p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
													<div class="text-lg font-bold text-violet-600">
														{{ userMetrics.recent_activity.themes_last_7_days }}
													</div>
													<div class="text-xs text-gray-600 dark:text-gray-400">Thèmes 7j
													</div>
												</div>
												<div class="text-center p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
													<div class="text-lg font-bold text-teal-600">
														{{ userMetrics.recent_activity.active_days_last_30 }}
													</div>
													<div class="text-xs text-gray-600 dark:text-gray-400">Jours actifs
														30j
													</div>
												</div>
											</div>
										</div>

										<!-- Stats avancées -->
										<div>
											<h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
												Statistiques avancées</h4>
											<div class="grid grid-cols-2 gap-4">
												<div
													class="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
													<div class="text-lg font-bold text-amber-600">
														{{ userMetrics.average_tasks_per_theme.toFixed(1) }}
													</div>
													<div class="text-sm text-gray-600 dark:text-gray-400">Tâches par
														thème (moy.)
													</div>
												</div>
												<div class="text-center p-4 bg-lime-50 dark:bg-lime-900/20 rounded-lg">
													<div class="text-lg font-bold text-lime-600">
														{{ userMetrics.validated_tasks_count }}
													</div>
													<div class="text-sm text-gray-600 dark:text-gray-400">Tâches
														validées
													</div>
												</div>
												<div class="text-center p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
													<div class="text-lg font-bold text-stone-600">
														{{ userMetrics.archived_tasks_count }}
													</div>
													<div class="text-sm text-gray-600 dark:text-gray-400">Tâches
														archivées
													</div>
												</div>
											</div>
										</div>

										<!-- Statut du compte -->
										<div>
											<h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
												Statut du compte</h4>
											<div class="grid grid-cols-2 gap-4">
												<div :class="userMetrics.is_blocked ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'"
													 class="p-4 border rounded-lg">
													<div class="flex items-center">
														<span :class="userMetrics.is_blocked ? 'text-red-600' : 'text-green-600'"
															  class="material-symbols-rounded !text-lg mr-2">
															{{ userMetrics.is_blocked ? 'block' : 'check_circle' }}
														</span>
														<span :class="userMetrics.is_blocked ? 'text-red-800 dark:text-red-300' : 'text-green-800 dark:text-green-300'"
															  class="font-medium">
															{{
																userMetrics.is_blocked ? 'Compte bloqué' : 'Compte actif'
															}}
														</span>
													</div>
													<div v-if="userMetrics.blocked_since"
														 class="text-xs mt-1 text-red-600 dark:text-red-400">
														Bloqué {{ userMetrics.blocked_since }}
													</div>
												</div>
												<div :class="userMetrics.is_email_verified ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' : 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'"
													 class="p-4 border rounded-lg">
													<div class="flex items-center">
														<span :class="userMetrics.is_email_verified ? 'text-blue-600' : 'text-orange-600'"
															  class="material-symbols-rounded !text-lg mr-2">
															{{ userMetrics.is_email_verified ? 'verified' : 'error' }}
														</span>
														<span :class="userMetrics.is_email_verified ? 'text-blue-800 dark:text-blue-300' : 'text-orange-800 dark:text-orange-300'"
															  class="font-medium">
															{{
																userMetrics.is_email_verified ? 'Email vérifié' : 'Email non vérifié'
															}}
														</span>
													</div>
													<div v-if="userMetrics.verified_since"
														 class="text-xs mt-1 text-blue-600 dark:text-blue-400">
														Vérifié {{ userMetrics.verified_since }}
													</div>
												</div>
											</div>
										</div>
									</div>
								</template>
							</Card>
						</div>

						<div v-else class="text-center p-8">
							<span class="material-symbols-rounded text-gray-400 !text-6xl mb-4">
								people
							</span>
							<p class="text-gray-600 dark:text-gray-400">
								Sélectionnez un utilisateur pour voir ses détails
							</p>
						</div>
					</TabPanel>
				</TabPanels>
			</LazyTabs>
		</div>

		<!-- Dialog de création -->
		<Dialog
			v-model:visible="showCreateDialog"
			:style="{ width: '32rem' }"
			header="Créer un nouvel utilisateur"
			modal
		>
			<form class="space-y-4" @submit.prevent="createUser">
				<div>
					<div class="mb-2 w-min m-auto">
						<Avatar
							v-if="avatarPreview"
							:image="avatarPreview"
							shape="circle"
							size="xlarge"
						/>
						<Avatar
							v-else-if="createForm.username"
							:label="createForm.username.charAt(0).toUpperCase()"
							shape="circle"
							size="xlarge"
						/>
						<Avatar
							v-else
							shape="circle"
							size="xlarge"
						>
							<span class="material-symbols-rounded !text-4xl">
								person
							</span>
						</Avatar>
					</div>
					<label class="block text-sm font-medium mb-2">Avatar</label>
					<FileUpload
						:auto="true"
						:maxFileSize="2000000"
						:showCancelButton="false"
						:showUploadButton="false"
						accept="image/*"
						chooseLabel="Choisir un avatar"
						class="w-full"
						customUpload
						mode="basic"
						@select="(e) => handleFileChange({target: {files: e.files}}, 'create')"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium mb-2">Nom d'utilisateur *</label>
					<InputText v-model="createForm.username" class="w-full" required/>
				</div>

				<div>
					<label class="block text-sm font-medium mb-2">Email *</label>
					<InputText v-model="createForm.email" class="w-full" required type="email"/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium mb-2">Prénom</label>
						<InputText v-model="createForm.first_name" class="w-full"/>
					</div>
					<div>
						<label class="block text-sm font-medium mb-2">Nom</label>
						<InputText v-model="createForm.last_name" class="w-full"/>
					</div>
				</div>

				<div>
					<label class="block text-sm font-medium mb-2">Rôle *</label>
					<Select
						v-model="createForm.role_power"
						:options="roles"
						class="w-full"
						option-label="name"
						option-value="power"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium mb-2">Mot de passe *</label>
					<Password v-model="createForm.password" :input-class="'w-full'" :pt="{root: 'w-full'}" required
							  toggle-mask/>
				</div>

				<div>
					<label class="block text-sm font-medium mb-2">Confirmer le mot de passe *</label>
					<Password v-model="createForm.password_confirmation" :input-class="'w-full'" :pt="{root: 'w-full'}" required
							  toggle-mask/>
				</div>

				<div class="flex justify-end gap-2 pt-4">
					<Button
						label="Annuler"
						severity="secondary"
						@click="showCreateDialog = false"
					/>
					<Button
						label="Créer"
						type="submit"
					/>
				</div>
			</form>
		</Dialog>

		<!-- Dialog de modification -->
		<Dialog
			v-model:visible="showEditDialog"
			:style="{ width: '32rem' }"
			header="Modifier l'utilisateur"
			modal
		>
			<form class="space-y-4" @submit.prevent="updateUser">
				<div>
					<div class="mb-2 w-min m-auto">
						<Avatar
							v-if="avatarPreview"
							:image="avatarPreview"
							shape="circle"
							size="xlarge"
						/>
						<Avatar
							v-else-if="editForm.username"
							:label="editForm.username.charAt(0).toUpperCase()"
							shape="circle"
							size="xlarge"
						/>
						<Avatar
							v-else
							shape="circle"
							size="xlarge"
						>
							<span class="material-symbols-rounded !text-4xl">
								person
							</span>
						</Avatar>
					</div>
					<label class="block text-sm font-medium mb-2">Avatar</label>
					<FileUpload
						:auto="true"
						:maxFileSize="2000000"
						:showCancelButton="false"
						:showUploadButton="false"
						accept="image/*"
						chooseLabel="Choisir un avatar"
						class="w-full"
						customUpload
						mode="basic"
						@select="(e) => handleFileChange({target: {files: e.files}}, 'edit')"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium mb-2">Nom d'utilisateur *</label>
					<InputText v-model="editForm.username" class="w-full" required/>
				</div>

				<div>
					<label class="block text-sm font-medium mb-2">Email *</label>
					<InputText v-model="editForm.email" class="w-full" required type="email"/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium mb-2">Prénom</label>
						<InputText v-model="editForm.first_name" class="w-full"/>
					</div>
					<div>
						<label class="block text-sm font-medium mb-2">Nom</label>
						<InputText v-model="editForm.last_name" class="w-full"/>
					</div>
				</div>

				<div>
					<label class="block text-sm font-medium mb-2">Rôle *</label>
					<Select
						v-model="editForm.role_power"
						:options="roles"
						class="w-full"
						option-label="name"
						option-value="power"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium mb-2">Nouveau mot de passe (optionnel)</label>
					<Password v-model="editForm.password" :inputClass="'w-full'" :pt="{root: 'w-full'}" toggle-mask/>
				</div>

				<div v-if="editForm.password">
					<label class="block text-sm font-medium mb-2">Confirmer le nouveau mot de passe</label>
					<Password v-model="editForm.password_confirmation" :input-class="'w-full'" :pt="{root: 'w-full'}"
							  toggle-mask/>
				</div>

				<div class="flex justify-end gap-2 pt-4">
					<Button
						label="Annuler"
						severity="secondary"
						@click="showEditDialog = false"
					/>
					<Button
						label="Modifier"
						type="submit"
					/>
				</div>
			</form>
		</Dialog>
		<Dialog
			v-model:visible="deleteDialogVisible"
			:modal="true"
			:style="{ width: '30rem' }"
			header="Confirmer la suppression"
		>
			<div class="confirmation-content flex items-center gap-3 m-4">
				<span class="material-symbols-rounded text-yellow-500 text-2xl">warning</span>
				<span>
					Êtes-vous sûr de vouloir supprimer l'utilisateur
					<strong>{{ userToDelete?.username }}</strong> ?
					<br>
					<span class="text-red-500 text-sm mt-2 block">
				  	Cette action est irréversible et supprimera toutes les données associées à cet utilisateur.
					</span>
      			</span>
			</div>
			<template #footer>
				<Button
					label="Annuler"
					outlined
					@click="deleteDialogVisible = false"
				/>
				<Button
					:loading="loading"
					label="Supprimer"
					severity="danger"
					@click="handleDeleteUser"
				/>
			</template>
		</Dialog>
	</div>
</template>