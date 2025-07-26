<script setup lang="ts">
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

const toast = useToast()

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
		selectedUser.value = response.user
		userMetrics.value = response.additional_stats
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message || 'Erreur lors du chargement des détails'
		})
	}
}

// Charger les métriques d'un utilisateur
const loadUserMetrics = async (userId: string) => {
	try {
		userMetrics.value = await useApiFetch(`/api/admin/users/${userId}/metrics`)
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message || 'Erreur lors du chargement des métriques'
		})
	}
}

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
			detail: 'Utilisateur créé avec succès'
		})

		showCreateDialog.value = false
		resetCreateForm()
		await loadUsers()
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
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
			method: HttpMethods.PUT,
			body: formData
		})

		toast.add({
			severity: 'success',
			summary: 'Succès',
			detail: 'Utilisateur modifié avec succès'
		})

		showEditDialog.value = false
		await loadUsers()
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message || 'Erreur lors de la modification'
		})
	}
}

// Supprimer un utilisateur
const deleteUser = async (user: User) => {
	try {
		await useApiFetch(`/api/admin/users/${user.user_id}`, {
			method: HttpMethods.DELETE
		})

		toast.add({
			severity: 'success',
			summary: 'Succès',
			detail: 'Utilisateur supprimé avec succès'
		})

		await loadUsers()
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message || 'Erreur lors de la suppression'
		})
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
			detail: 'Utilisateur bloqué avec succès'
		})

		await loadUsers()
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
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
			detail: 'Utilisateur débloqué avec succès'
		})

		await loadUsers()
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message || 'Erreur lors du déblocage'
		})
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
}

const getRoleLabel = (power: number) => {
	const role = roles.value.find(r => r.power === power)
	return role?.name || `Rôle ${power}`
}

const onPageChange = (event: any) => {
	currentPage.value = event.page + 1
	loadUsers()
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
			<LazyTabs value="0"
					  class="mb-6 border-[1px] border-slate-200 dark:border-zinc-700 rounded-3xl overflow-hidden">
				<TabList>
					<Tab value="0" class="flex justify-center items-center">
						<span class="material-symbols-rounded mr-2">group</span>
						Utilisateurs
					</Tab>
					<Tab value="1" class="flex justify-center items-center">
						<span class="material-symbols-rounded mr-2">info</span>
						Détails Utilisateur
					</Tab>
				</TabList>
				<TabPanels
					:active-index="activeTab"
					@update:activeIndex="activeTab = $event"
				>
					<TabPanel value="0">
						<!-- Statistiques globales -->
						<div
							class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
							:class="globalStats ? 'blur-none' : 'blur-sm'"
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
										<span class="material-symbols-rounded !text-4xl text-pink-600 mr-3">
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
											placeholder="Rechercher par nom, email..."
											class="w-full h-11.5 pl-10 pr-4 py-2 text-sm flex items-center justify-between"
										/>
									</IconField>
									<Select
										v-model="selectedRole"
										:options="roles"
										option-label="name"
										option-value="power"
										placeholder="Filtrer par rôle"
										show-clear
										class="flex-1 h-11.5"
									/>

									<Select
										v-model="selectedStatus"
										:options="[
											{ label: 'Actifs', value: 'active' },
											{ label: 'Bloqués', value: 'blocked' }
										]"
										option-label="label"
										option-value="value"
										placeholder="Filtrer par statut"
										show-clear
										class="flex-1 h-11.5"
									/>

									<Button
										@click="showCreateDialog = true"
										class="flex-1 h-11.5"
										severity="primary"
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
									:value="users"
									paginator
									:rows="20"
									:total-records="totalUsers"
									lazy
									@page="onPageChange"
								>
									<Column field="username" header="Nom d'utilisateur" sortable>
										<template #body="slotProps">
											<div class="flex items-center">
												<Avatar
													v-if="slotProps.data.avatar_path"
													:image="slotProps.data.avatar_path"
													size="small"
													shape="circle"
													class="mr-2"
												/>
												<Avatar
													v-else
													:label="slotProps.data.username.charAt(0).toUpperCase()"
													size="small"
													shape="circle"
													class="mr-2"
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
												:value="getRoleLabel(slotProps.data.role_power)"
												:severity="slotProps.data.role_power >= 100 ? 'danger' : 'info'"
											/>
										</template>
									</Column>

									<Column header="Statut">
										<template #body="slotProps">
											<Tag
												:value="slotProps.data.blocked_at ? 'Bloqué' : 'Actif'"
												:severity="slotProps.data.blocked_at ? 'danger' : 'success'"
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
													size="small"
													severity="info"
													class="w-10 h-10 p-0"
													@click="loadUserDetails(slotProps.data)"
													v-tooltip.bottom="'Voir les détails'"

												>
												<span
													class="material-symbols-rounded text-sm"
												>
													visibility
												</span>
												</Button>
												<Button
													size="small"
													severity="secondary"
													class="w-10 h-10 p-0"
													@click="loadUserMetrics(slotProps.data.user_id)"
													v-tooltip.bottom="'Voir les métriques'"
												>
													<span class="material-symbols-rounded text-sm">analytics</span>
												</Button>
												<Button
													size="small"
													severity="warning"
													class="w-10 h-10 p-0"
													@click="prepareEditForm(slotProps.data)"
													v-tooltip.bottom="'Modifier'"
												>
													<span class="material-symbols-rounded text-sm">edit</span>
												</Button>
												<Button
													v-if="!slotProps.data.blocked_at"
													size="small"
													severity="danger"
													class="w-10 h-10 p-0"
													@click="blockUser(slotProps.data)"
													v-tooltip.bottom="'Bloquer'"
												>
													<span class="material-symbols-rounded text-sm">block</span>
												</Button>
												<Button
													v-else
													size="small"
													severity="success"
													class="w-10 h-10 p-0"
													@click="unblockUser(slotProps.data)"
													v-tooltip.bottom="'Débloquer'"
												>
													<span class="material-symbols-rounded text-sm">check_circle</span>
												</Button>
												<Button
													size="small"
													severity="danger"
													class="w-10 h-10 p-0"
													@click="deleteUser(slotProps.data)"
													v-tooltip.bottom="'Supprimer'"
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

					<TabPanel value="1">
						<div v-if="selectedUser" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<!-- Informations de base -->
							<Card class="border-[1px] border-slate-200 dark:border-zinc-700">
								<template #title>
									<div class="flex items-center">
										<i class="pi pi-user mr-2"></i>
										Informations de base
									</div>
								</template>
								<template #content>
									<div class="space-y-4">
										<div class="flex items-center justify-center mb-4">
											<Avatar
												v-if="selectedUser.avatar_path"
												:image="selectedUser.avatar_path"
												size="xlarge"
												shape="circle"
											/>
											<Avatar
												v-else
												:label="selectedUser.username.charAt(0).toUpperCase()"
												size="xlarge"
												shape="circle"
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
													Rôle
												</label>
												<Tag
													:value="getRoleLabel(selectedUser.role_power)"
													:severity="selectedUser.role_power >= 100 ? 'danger' : 'info'"
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
													Créé le
												</label>
												<div class="text-sm text-gray-600 dark:text-gray-400">
													{{ new Date(selectedUser.created_at).toLocaleString('fr-FR') }}
												</div>
											</div>

											<div>
												<label
													class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
													Dernière modification
												</label>
												<div class="text-sm text-gray-600 dark:text-gray-400">
													{{ new Date(selectedUser.updated_at).toLocaleString('fr-FR') }}
												</div>
											</div>
										</div>
									</div>
								</template>
							</Card>

							<!-- Métriques -->
							<Card v-if="userMetrics">
								<template #title>
									<div class="flex items-center">
										<i class="pi pi-chart-bar mr-2"></i>
										Métriques et statistiques
									</div>
								</template>
								<template #content>
									<div class="grid grid-cols-2 gap-4">
										<div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
											<div class="text-2xl font-bold text-blue-600">
												{{ userMetrics.themes_count }}
											</div>
											<div class="text-sm text-gray-600 dark:text-gray-400">
												Thèmes créés
											</div>
										</div>

										<div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
											<div class="text-2xl font-bold text-green-600">
												{{ userMetrics.tasks_count }}
											</div>
											<div class="text-sm text-gray-600 dark:text-gray-400">
												Tâches totales
											</div>
										</div>

										<div class="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
											<div class="text-2xl font-bold text-purple-600">
												{{ userMetrics.completed_tasks_count }}
											</div>
											<div class="text-sm text-gray-600 dark:text-gray-400">
												Tâches terminées
											</div>
										</div>

										<div class="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
											<div class="text-2xl font-bold text-orange-600">
												{{ userMetrics.themes_as_member }}
											</div>
											<div class="text-sm text-gray-600 dark:text-gray-400">
												Thèmes membre
											</div>
										</div>

										<div class="col-span-2 text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
											<div class="text-lg font-bold text-gray-700 dark:text-gray-300">
												{{ userMetrics.account_age_days }} jours
											</div>
											<div class="text-sm text-gray-600 dark:text-gray-400">
												Âge du compte
											</div>
										</div>

										<div
											class="col-span-2 text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
											<div class="text-sm font-medium text-indigo-700 dark:text-indigo-300">
												Dernière activité
											</div>
											<div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
												{{ new Date(userMetrics.last_activity).toLocaleString('fr-FR') }}
											</div>
										</div>
									</div>
								</template>
							</Card>
						</div>

						<div v-else class="text-center p-8">
							<i class="pi pi-info-circle text-4xl text-gray-400 mb-4"></i>
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
			header="Créer un nouvel utilisateur"
			:style="{ width: '32rem' }"
			modal
		>
			<form @submit.prevent="createUser" class="space-y-4">
				<div>
					<label class="block text-sm font-medium mb-2">Nom d'utilisateur *</label>
					<InputText v-model="createForm.username" required class="w-full"/>
				</div>

				<div>
					<label class="block text-sm font-medium mb-2">Email *</label>
					<InputText v-model="createForm.email" type="email" required class="w-full"/>
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
						option-label="name"
						option-value="power"
						class="w-full"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium mb-2">Mot de passe *</label>
					<Password v-model="createForm.password" toggle-mask required class="w-full"/>
				</div>

				<div>
					<label class="block text-sm font-medium mb-2">Confirmer le mot de passe *</label>
					<Password v-model="createForm.password_confirmation" toggle-mask required class="w-full"/>
				</div>

				<div>
					<label class="block text-sm font-medium mb-2">Avatar</label>
					<FileUpload
						mode="basic"
						choose-label="Choisir un fichier"
						accept="image/*"
						:max-file-size="2000000"
						@select="createForm.avatar = $event.files[0]"
						class="w-full"
					/>
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
			header="Modifier l'utilisateur"
			:style="{ width: '32rem' }"
			modal
		>
			<form @submit.prevent="updateUser" class="space-y-4">
				<div>
					<label class="block text-sm font-medium mb-2">Nom d'utilisateur *</label>
					<InputText v-model="editForm.username" required class="w-full"/>
				</div>

				<div>
					<label class="block text-sm font-medium mb-2">Email *</label>
					<InputText v-model="editForm.email" type="email" required class="w-full"/>
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
						option-label="name"
						option-value="power"
						class="w-full"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium mb-2">Nouveau mot de passe (optionnel)</label>
					<Password v-model="editForm.password" toggle-mask class="w-full"/>
				</div>

				<div v-if="editForm.password">
					<label class="block text-sm font-medium mb-2">Confirmer le nouveau mot de passe</label>
					<Password v-model="editForm.password_confirmation" toggle-mask class="w-full"/>
				</div>

				<div>
					<label class="block text-sm font-medium mb-2">Nouvel avatar</label>
					<FileUpload
						mode="basic"
						choose-label="Choisir un fichier"
						accept="image/*"
						:max-file-size="2000000"
						@select="editForm.avatar = $event.files[0]"
						class="w-full"
					/>
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
	</div>
</template>