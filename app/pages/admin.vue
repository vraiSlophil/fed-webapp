<script lang="ts" setup>
import type {User} from '~/types/user'
import {useAdmin} from "~/domains/admin/composables/useAdmin";

// Navigation guard pour admin seulement
definePageMeta({
	middleware: 'admin'
})

const activeTab = ref<number>(0)

// Formulaires (restent dans la vue)
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
const deleteDialogVisible = ref(false)

const toast = useToast()

// Utiliser le composable useAdmin
const {
	users,
	selectedUser,
	userMetrics,
	roles,
	globalStats,
	loading,
	totalUsers,
	currentPage,
	searchQuery,
	selectedRole,
	selectedStatus,
	userToDelete,
	fetchUsers,
	fetchUserDetails,
	confirmDeleteUser,
	createUser,
	updateUser,
	deleteUser,
	blockUser,
	unblockUser,
	verifyUser,
	resetFilters,
	setPage,
	setSearchQuery,
	setRoleFilter,
	setStatusFilter,
	sortBy,
	sortDirection,
	setSorting
} = useAdmin()

// Données fictives pour éviter le clip pendant le chargement
const skeletonUsers = computed(() => {
	if (!loading.value) return []

	return Array.from({length: 20}, (_, index) => ({
		user_id: `skeleton-${index}`,
		username: `skeleton-user-${index}`,
		email: `skeleton${index}@example.com`,
		first_name: `Nom${index}`,
		last_name: `Prénom${index}`,
		role_power: 10,
		created_at: new Date().toISOString(),
		last_login_at: new Date().toISOString(),
		email_verified_at: new Date().toISOString(),
		blocked_at: null,
		avatar_path: null,
		role: {power: 10, name: 'user'}
	}))
})

// Données à afficher dans le DataTable
const displayUsers = computed(() => {
	return loading.value ? skeletonUsers.value : users.value
})

// Charger les utilisateurs au montage
onMounted(async () => {
	try {
		await fetchUsers()
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message,
			life: 3000
		})
	}
})

// Gestion des détails utilisateur
const loadUserDetails = async (user: User) => {
	try {
		await fetchUserDetails(user)
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message,
			life: 3000
		})
	}
}

// Gestion de la suppression avec confirmation
const handleConfirmDeleteUser = (user: User) => {
	confirmDeleteUser(user)
	deleteDialogVisible.value = true
}

const handleDeleteUser = async () => {
	if (userToDelete.value) {
		try {
			await deleteUser(userToDelete.value.user_id)
			toast.add({
				severity: 'success',
				summary: 'Succès',
				detail: 'Utilisateur supprimé avec succès',
				life: 3000
			})
			deleteDialogVisible.value = false
		} catch (error: any) {
			toast.add({
				severity: 'error',
				summary: 'Erreur',
				detail: error.message,
				life: 3000
			})
		}
	}
}

// Gestion du blocage/déblocage
const handleBlockUser = async (user: User) => {
	try {
		if (user.blocked_at) {
			await unblockUser(user.user_id)
			toast.add({
				severity: 'success',
				summary: 'Succès',
				detail: 'Utilisateur débloqué avec succès',
				life: 3000
			})
		} else {
			await blockUser(user.user_id)
			toast.add({
				severity: 'success',
				summary: 'Succès',
				detail: 'Utilisateur bloqué avec succès',
				life: 3000
			})
		}
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message,
			life: 3000
		})
	}
}

// Gestion des formulaires
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
	avatarPreview.value = null
}

const resetEditForm = () => {
	editForm.value = {
		username: '',
		email: '',
		password: '',
		password_confirmation: '',
		first_name: '',
		last_name: '',
		role_power: 1,
		avatar: null
	}
	avatarPreview.value = null
}

const openEditDialog = (user: User) => {
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
	if (user.avatar_path) {
		avatarPreview.value = user.avatar_path
	} else {
		avatarPreview.value = null
	}
	showEditDialog.value = true
}

// Gestion de la création d'utilisateur
const handleCreateUser = async () => {
	try {
		const formData = new FormData()
		Object.entries(createForm.value).forEach(([key, value]) => {
			if (value !== null && value !== '') {
				formData.append(key, value as string | Blob)
			}
		})

		await createUser(formData)
		toast.add({
			severity: 'success',
			summary: 'Succès',
			detail: 'Utilisateur créé avec succès',
			life: 3000
		})
		showCreateDialog.value = false
		resetCreateForm()
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message,
			life: 3000
		})
	}
}

// Gestion de la modification d'utilisateur
const handleUpdateUser = async () => {
	if (!selectedUser.value) return

	try {
		const formData = new FormData()
		Object.entries(editForm.value).forEach(([key, value]) => {
			if (value !== null && value !== '') {
				formData.append(key, value as string | Blob)
			}
		})

		await updateUser(selectedUser.value.user_id, formData)
		toast.add({
			severity: 'success',
			summary: 'Succès',
			detail: 'Utilisateur modifié avec succès',
			life: 3000
		})
		showEditDialog.value = false
		resetEditForm()
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message,
			life: 3000
		})
	}
}

// Gestion des filtres avec try/catch
const handleSearch = async () => {
	try {
		setSearchQuery(searchQuery.value)
		await fetchUsers()
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message,
			life: 3000
		})
	}
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const debounceSearch = () => {
	if (searchTimeout) {
		clearTimeout(searchTimeout)
	}
	searchTimeout = setTimeout(handleSearch, 300)
}

const handleRoleFilter = async (roleId: number | null) => {
	try {
		setRoleFilter(roleId)
		await fetchUsers()
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message,
			life: 3000
		})
	}
}

const handleStatusFilter = async (status: string) => {
	try {
		setStatusFilter(status)
		await fetchUsers()
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message,
			life: 3000
		})
	}
}

const handlePageChange = async (page: number) => {
	try {
		setPage(page)
		await fetchUsers()
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message,
			life: 3000
		})
	}
}

// Gestion des avatars
const onAvatarSelect = (event: any, form: 'create' | 'edit') => {
	const file = event.files[0]
	if (file) {
		if (form === 'create') {
			createForm.value.avatar = file
		} else {
			editForm.value.avatar = file
		}

		const reader = new FileReader()
		reader.onload = (e) => {
			avatarPreview.value = e.target?.result as string
		}
		reader.readAsDataURL(file)
	}
}

// Formatage des dates
const formatDate = (date: string | null) => {
	if (!date) return 'Jamais'
	return new Date(date).toLocaleDateString('fr-FR', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	})
}

const formatDateTime = (date: string | null) => {
	if (!date) return 'Jamais'
	return new Date(date).toLocaleDateString('fr-FR', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})
}

const handleSort = async (event: any) => {
	try {
		const direction = event.sortOrder === 1 ? 'asc' : 'desc'
		setSorting(event.sortField, direction)
		await fetchUsers()
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message,
			life: 3000
		})
	}
}

const getRoleLabel = (power: number) => {
	const role = roles.value.find(r => r.power === power)
	return role?.name || `Rôle ${power}`
}

// Fonction pour gérer le changement de fichier
const handleFileChange = (event: Event & { target: HTMLInputElement }, formType: 'create' | 'edit') => {
	const target = event.target

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
		avatarPreview.value = URL.createObjectURL(file!)

		// Mettre à jour le formulaire approprié
		if (formType === 'create') {
			createForm.value!.avatar = file
		} else {
			editForm.value!.avatar = file
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

// Computed pour les statistiques
const statsCards = computed(() => [{
	title: 'Total Utilisateurs',
	value: globalStats.value?.total_users || 0,
	icon: 'group',
	color: 'blue'
}, {
	title: 'Utilisateurs Actifs',
	value: globalStats.value?.active_users || 0,
	icon: 'group',
	color: 'green'
}, {
	title: 'Utilisateurs Bloqués',
	value: globalStats.value?.blocked_users || 0,
	icon: 'block',
	color: 'red'
}, {
	title: 'Utilisateurs Vérifiés',
	value: globalStats.value?.verified_users || 0,
	icon: 'verified_user',
	color: 'yellow'
}, {
	title: 'Créés ces 7 derniers jours',
	value: globalStats.value?.created_last_7_days || 0,
	icon: 'access_time',
	color: 'purple'
}, {
	title: 'Comptes validés ces 7 derniers jours',
	value: globalStats.value?.verified_last_7_days || 0,
	icon: 'verified_user',
	color: 'pink'
}])

const userActions = (user: User) => [
	{
		name: 'details',
		tooltip: 'Voir les détails',
		severity: 'info',
		icon: 'visibility',
		action: () => {
			activeTab.value = 1;
			loadUserDetails(user)
		}
	},
	{
		name: 'edit',
		tooltip: 'Modifier',
		severity: 'primary',
		icon: 'edit',
		action: openEditDialog
	},
	{
		name: 'block',
		tooltip: user.blocked_at ? 'Débloquer' : 'Bloquer',
		severity: user.blocked_at ? 'success' : 'danger',
		icon: user.blocked_at ? 'check_circle' : 'block',
		action: handleBlockUser
	},
	{
		name: 'delete',
		tooltip: 'Supprimer',
		severity: 'danger',
		icon: 'delete',
		action: handleConfirmDeleteUser
	}
]
</script>

<template>
	<div class="min-h-screen p-6 relative">
		<!--		&lt;!&ndash; Debug &ndash;&gt;-->
		<!--		<div-->
		<!--			class="top-2 right-2 absolute z-50 bg-black/80 text-white text-xs p-2 rounded-lg"-->
		<!--		>-->
		<!--			<div>-->
		<!--				selectedUser:-->
		<!--				<pre>{{ selectedUser }}</pre>-->
		<!--			</div>-->
		<!--		</div>-->
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold">Administration</h1>
					<p class="text-gray-600 mt-1">Gestion des utilisateurs et statistiques</p>
				</div>
				<NuxtLink
					class="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
					to="/"
				>
					<span class="material-symbols-rounded mr-2">arrow_back</span>
					Retour à l'accueil
				</NuxtLink>
			</div>
		</div>

		<!-- Statistiques -->
		<div
			:class="globalStats ? 'blur-none' : 'blur-sm'"
			class="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6"
		>
			<Card
				v-for="stat in statsCards"
				:key="stat.title"
				:pt="{
					body: { style: 'height: 100%' },
					content: { style: 'height: 100%' },
				}"
				class="border-[1px] border-slate-200 dark:border-zinc-700"
			>
				<template #content>
					<div class="flex items-center justify-between !min-h-full">
						<div>
							<p class="text-sm font-medium">{{ stat.title }}</p>
							<p class="text-2xl font-bold">{{ stat.value }}</p>
						</div>
						<div :class="`text-${stat.color}-500`">
							<span class="material-symbols-rounded !text-3xl">{{ stat.icon }}</span>
						</div>
					</div>
				</template>
			</Card>
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
			<!-- Onglet Utilisateurs -->
			<TabPanels>
				<TabPanel :value="0">
					<div class="p-6 overflow-scroll min-w-8xl">
						<!-- Filtres et actions -->
						<div class="flex flex-row gap-4 mb-6">
							<IconField class="flex-1 relative">
								<span
									class="material-symbols-rounded text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2">search</span>
								<InputText
									v-model="searchQuery"
									class="w-full h-11.5 pl-10 pr-4 py-2 text-sm flex items-center justify-between"
									placeholder="Rechercher par nom, email..."
									@input="debounceSearch"
									@keyup.enter="handleSearch"
								/>
							</IconField>
							<Select
								v-model="selectedRole"
								:options="[{name: 'Tous les rôles', power: null}, ...roles]"
								class="flex-1 h-11.5 flex justify-center items-center"
								option-label="name"
								option-value="power"
								placeholder="Filtrer par rôle"
								show-clear
								@update:model-value="handleRoleFilter"
							/>
							<Select
								v-model="selectedStatus"
								:options="[
										{label: 'Tous', value: ''},
										{label: 'Vérifiés', value: 'active'},
										{label: 'Bloqués', value: 'blocked'},
										{label: 'Non vérifiés', value: 'unverified'}
									]"
								class="flex-1 h-11.5 flex justify-center items-center"
								option-label="label"
								option-value="value"
								placeholder="Filtrer par statut"
								show-clear
								@update:model-value="handleStatusFilter"
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

						<!-- Table des utilisateurs -->
						<DataTable
							:class="loading ? 'blur-sm pointer-events-none' : 'blur-none pointer-events-auto'"
							:lazy="true"
							:rows="20"
							:sortField="sortBy"
							:sortOrder="sortDirection === 'asc' ? 1 : -1"
							:total-records="totalUsers"
							:value="displayUsers"
							class="p-datatable-sm"
							paginator
							responsive-layout="scroll"
							sortMode="single"
							@page="handlePageChange($event.page + 1)"
							@sort="handleSort"
						>
							<Column class="rounded-t-sm" field="avatar_path" header="Avatar">
								<template #body="{ data }">
									<Avatar
										v-if="data.avatar_path"
										:image="data.avatar_path"
										class="mr-2"
										shape="circle"
										size="small"
									/>
									<Avatar
										v-else
										:label="data.username.charAt(0).toUpperCase()"
										class="mr-2"
										shape="circle"
										size="small"
									/>
								</template>
							</Column>

							<Column class="rounded-t-sm" field="username" header="Utilisateur" sortable>
								<template #body="{ data }">
									<div>
										<div class="flex items-center gap-1">
											<span class="font-medium">{{
													data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : ''
												}}</span>
											<span v-if="data.first_name && data.last_name"
												  class="dark:bg-white/20 bg-black/20 px-1.5 py-0.5 text-xs rounded-full">@{{
													data.username
												}}</span>
										</div>
										<div v-if="!data.first_name || !data.last_name" class="text-sm font-medium">
											@{{ data.username }}
										</div>
										<div class="text-sm text-gray-500 truncate">{{ data.email }}</div>
									</div>
								</template>
							</Column>

							<Column class="rounded-t-sm" field="role.name" header="Rôle">
								<template #body="{ data }">
									<Tag
										:severity="data.role_power > 10 ? ( data.role_power > 100 ? 'danger' :'warning') : 'info'"
										:value="data.role.name.charAt(0).toUpperCase() + data.role.name.slice(1) || 'Utilisateur'"
									/>
								</template>
							</Column>

							<Column class="rounded-t-sm" field="created_at" header="Inscription" sortable>
								<template #body="{ data }">
									{{ formatDate(data.created_at) }}
								</template>
							</Column>

							<Column class="rounded-t-sm" field="last_login_at" header="Dernière connexion" sortable>
								<template #body="{ data }">
									{{ formatDateTime(data.last_login_at) }}
								</template>
							</Column>

							<Column class="rounded-t-sm" field="email_verified_at" header="Statut" sortable>
								<template #body="{ data }">
									<div class="flex gap-1">
										<Tag
											v-if="data.blocked_at"
											severity="danger"
											value="Bloqué"
										/>
										<Tag
											v-else-if="data.email_verified_at"
											severity="success"
											value="Vérifié"
										/>
										<Tag
											v-else
											severity="info"
											value="Non vérifié"
										/>
									</div>
								</template>
							</Column>

							<Column class="rounded-t-sm" header="Actions">
								<template #body="{ data }">
									<div class="flex gap-2">
										<Button
											v-for="action in userActions(data)"
											:key="action.name"
											v-tooltip.bottom="action.tooltip"
											:severity="action.severity"
											class="w-10 h-10 p-0"
											outlined
											size="small"
											@click="action.action(data)"
										>
											<span class="material-symbols-rounded text-sm">{{ action.icon }}</span>
										</Button>
									</div>
								</template>
							</Column>
						</DataTable>
					</div>
				</TabPanel>

				<!-- Onglet Détails utilisateur -->
				<TabPanel :disabled="!selectedUser" :value="1">
					<div v-if="selectedUser" class="p-6">

						<!-- Actions sur l'utilisateur -->
						<div class="flex gap-2 mb-6">
							<Button
								v-for="action in userActions(selectedUser).slice(1)"
								:key="action.name"
								:disabled="loading"
								:severity="action.severity"
								:tooltip="action.tooltip"
								class="flex-1"
								outlined
								@click="action.action(selectedUser)"
							>
								<span class="material-symbols-rounded mr-2">{{ action.icon }}</span>
								{{ action.name.charAt(0).toUpperCase() + action.name.slice(1) }}
							</Button>
						</div>

						<!-- Informations utilisateur -->
						<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
							<!-- Profil utilisateur -->
							<Card class="lg:col-span-1 border-[1px] border-slate-200 dark:border-zinc-700">
								<template #title>Profil</template>
								<template #content>
									<div class="flex flex-col items-center text-start">
										<div class="mb-8">
											<Avatar
												v-if="selectedUser.avatar_path"
												:image="selectedUser.avatar_path"
												class="mr-2"
												shape="circle"
												size="xlarge"
											/>
											<Avatar
												v-else
												:label="selectedUser.username.charAt(0).toUpperCase()"
												class="mr-2"
												shape="circle"
												size="xlarge"
											/>
											<h3 class="text-xl font-semibold">{{ selectedUser.username }}</h3>
											<p class="text-gray-600">{{ selectedUser.email }}</p>
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

							<!-- Métriques utilisateur -->
							<Card class="lg:col-span-2 border-[1px] border-slate-200 dark:border-zinc-700">
								<template #title>
									<div class="flex items-center">
										<span class="material-symbols-rounded mr-2 text-gray-600 dark:text-gray-300">
											analytics
										</span>
										Métriques et statistiques
									</div>
								</template>
								<template #content>
									<div v-if="!userMetrics" class="text-center text-gray-500 dark:text-gray-400">
										Chargement des métriques...
									</div>
									<div v-else class="flex flex-col gap-6">
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
												<div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
													<div
														class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
														Ancienneté du compte
													</div>
													<div class="text-xs text-gray-600 dark:text-gray-400">
														{{ userMetrics.account_age_human }}
													</div>
												</div>
												<div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
													<div
														class="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">
														Dernière activité
													</div>
													<div class="text-xs text-gray-600 dark:text-gray-400">
														{{
															new Date(userMetrics.last_activity).toLocaleString('fr-FR')
														}}
													</div>
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
												<div
													:class="userMetrics.is_blocked ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'"
													class="p-4 border rounded-lg">
													<div class="flex items-center">
													<span
														:class="userMetrics.is_blocked ? 'text-red-600' : 'text-green-600'"
														class="material-symbols-rounded !text-lg mr-2">
														{{ userMetrics.is_blocked ? 'block' : 'check_circle' }}
													</span>
														<span
															:class="userMetrics.is_blocked ? 'text-red-800 dark:text-red-300' : 'text-green-800 dark:text-green-300'"
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
												<div
													:class="userMetrics.is_email_verified ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' : 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'"
													class="p-4 border rounded-lg">
													<div class="flex items-center">
													<span
														:class="userMetrics.is_email_verified ? 'text-blue-600' : 'text-orange-600'"
														class="material-symbols-rounded !text-lg mr-2">
														{{ userMetrics.is_email_verified ? 'verified' : 'error' }}
													</span>
														<span
															:class="userMetrics.is_email_verified ? 'text-blue-800 dark:text-blue-300' : 'text-orange-800 dark:text-orange-300'"
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
					</div>
					<div v-else class="p-6 text-center text-gray-500">
						Sélectionnez un utilisateur pour voir ses détails
					</div>
				</TabPanel>
			</TabPanels>
		</LazyTabs>

		<Dialog
			v-model:visible="showCreateDialog"
			:style="{ width: '32rem' }"
			header="Créer un nouvel utilisateur"
			modal
		>
			<form class="space-y-4" @submit.prevent="handleCreateUser">
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
					<Password v-model="createForm.password_confirmation" :input-class="'w-full'" :pt="{root: 'w-full'}"
							  required
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
			<form class="space-y-4" @submit.prevent="handleUpdateUser">
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

		<!--		&lt;!&ndash; Dialog de création &ndash;&gt;-->
		<!--		<Dialog-->
		<!--			v-model:visible="showCreateDialog"-->
		<!--			class="w-full max-w-md"-->
		<!--			header="Créer un utilisateur"-->
		<!--			modal-->
		<!--		>-->
		<!--			<form class="space-y-4" @submit.prevent="handleCreateUser">-->
		<!--				<div>-->
		<!--					<label class="block text-sm font-medium mb-2">Nom d'utilisateur</label>-->
		<!--					<InputText-->
		<!--						v-model="createForm.username"-->
		<!--						class="w-full"-->
		<!--						required-->
		<!--					/>-->
		<!--				</div>-->
		<!--				<div>-->
		<!--					<label class="block text-sm font-medium mb-2">Email</label>-->
		<!--					<InputText-->
		<!--						v-model="createForm.email"-->
		<!--						class="w-full"-->
		<!--						required-->
		<!--						type="email"-->
		<!--					/>-->
		<!--				</div>-->
		<!--				<div>-->
		<!--					<label class="block text-sm font-medium mb-2">Mot de passe</label>-->
		<!--					<Password-->
		<!--						v-model="createForm.password"-->
		<!--						:input-class="'w-full'"-->
		<!--						class="w-full"-->
		<!--						required-->
		<!--						toggle-mask-->
		<!--					/>-->
		<!--				</div>-->
		<!--				<div>-->
		<!--					<label class="block text-sm font-medium mb-2">Confirmer le mot de passe</label>-->
		<!--					<Password-->
		<!--						v-model="createForm.password_confirmation"-->
		<!--						:input-class="'w-full'"-->
		<!--						class="w-full"-->
		<!--						required-->
		<!--						toggle-mask-->
		<!--					/>-->
		<!--				</div>-->
		<!--				<div>-->
		<!--					<label class="block text-sm font-medium mb-2">Prénom</label>-->
		<!--					<InputText-->
		<!--						v-model="createForm.first_name"-->
		<!--						class="w-full"-->
		<!--					/>-->
		<!--				</div>-->
		<!--				<div>-->
		<!--					<label class="block text-sm font-medium mb-2">Nom</label>-->
		<!--					<InputText-->
		<!--						v-model="createForm.last_name"-->
		<!--						class="w-full"-->
		<!--					/>-->
		<!--				</div>-->
		<!--				<div>-->
		<!--					<label class="block text-sm font-medium mb-2">Rôle</label>-->
		<!--					<Select-->
		<!--						v-model="createForm.role_power"-->
		<!--						:options="roles"-->
		<!--						class="w-full"-->
		<!--						option-label="name"-->
		<!--						option-value="power"-->
		<!--					/>-->
		<!--				</div>-->
		<!--				<div>-->
		<!--					<label class="block text-sm font-medium mb-2">Avatar</label>-->
		<!--					<FileUpload-->
		<!--						:auto="false"-->
		<!--						accept="image/*"-->
		<!--						choose-label="Choisir un avatar"-->
		<!--						mode="basic"-->
		<!--						name="avatar"-->
		<!--						@select="onAvatarSelect($event, 'create')"-->
		<!--					/>-->
		<!--					<img-->
		<!--						v-if="avatarPreview"-->
		<!--						:src="avatarPreview"-->
		<!--						alt="Aperçu"-->
		<!--						class="w-16 h-16 rounded-full object-cover mt-2"-->
		<!--					/>-->
		<!--				</div>-->
		<!--				<div class="flex justify-end gap-2 pt-4">-->
		<!--					<Button-->
		<!--						class="p-button-text"-->
		<!--						label="Annuler"-->
		<!--						type="button"-->
		<!--						@click="showCreateDialog = false; resetCreateForm()"-->
		<!--					/>-->
		<!--					<Button-->
		<!--						:loading="loading"-->
		<!--						label="Créer"-->
		<!--						type="submit"-->
		<!--					/>-->
		<!--				</div>-->
		<!--			</form>-->
		<!--		</Dialog>-->

		<!--		&lt;!&ndash; Dialog de modification &ndash;&gt;-->
		<!--		<Dialog-->
		<!--			v-model:visible="showEditDialog"-->
		<!--			class="w-full max-w-md"-->
		<!--			header="Modifier l'utilisateur"-->
		<!--			modal-->
		<!--		>-->
		<!--			<form class="space-y-4" @submit.prevent="handleUpdateUser">-->
		<!--				<div>-->
		<!--					<label class="block text-sm font-medium mb-2">Nom d'utilisateur</label>-->
		<!--					<InputText-->
		<!--						v-model="editForm.username"-->
		<!--						class="w-full"-->
		<!--						required-->
		<!--					/>-->
		<!--				</div>-->
		<!--				<div>-->
		<!--					<label class="block text-sm font-medium mb-2">Email</label>-->
		<!--					<InputText-->
		<!--						v-model="editForm.email"-->
		<!--						class="w-full"-->
		<!--						required-->
		<!--						type="email"-->
		<!--					/>-->
		<!--				</div>-->
		<!--				<div>-->
		<!--					<label class="block text-sm font-medium mb-2">Nouveau mot de passe (optionnel)</label>-->
		<!--					<Password-->
		<!--						v-model="editForm.password"-->
		<!--						:input-class="'w-full'"-->
		<!--						class="w-full"-->
		<!--						toggle-mask-->
		<!--					/>-->
		<!--				</div>-->
		<!--				<div v-if="editForm.password">-->
		<!--					<label class="block text-sm font-medium mb-2">Confirmer le mot de passe</label>-->
		<!--					<Password-->
		<!--						v-model="editForm.password_confirmation"-->
		<!--						:input-class="'w-full'"-->
		<!--						class="w-full"-->
		<!--						toggle-mask-->
		<!--					/>-->
		<!--				</div>-->
		<!--				<div>-->
		<!--					<label class="block text-sm font-medium mb-2">Prénom</label>-->
		<!--					<InputText-->
		<!--						v-model="editForm.first_name"-->
		<!--						class="w-full"-->
		<!--					/>-->
		<!--				</div>-->
		<!--				<div>-->
		<!--					<label class="block text-sm font-medium mb-2">Nom</label>-->
		<!--					<InputText-->
		<!--						v-model="editForm.last_name"-->
		<!--						class="w-full"-->
		<!--					/>-->
		<!--				</div>-->
		<!--				<div>-->
		<!--					<label class="block text-sm font-medium mb-2">Rôle</label>-->
		<!--					<Select-->
		<!--						v-model="editForm.role_power"-->
		<!--						:options="roles"-->
		<!--						class="w-full"-->
		<!--						option-label="name"-->
		<!--						option-value="power"-->
		<!--					/>-->
		<!--				</div>-->
		<!--				<div>-->
		<!--					<label class="block text-sm font-medium mb-2">Nouvel avatar (optionnel)</label>-->
		<!--					<FileUpload-->
		<!--						:auto="false"-->
		<!--						accept="image/*"-->
		<!--						choose-label="Choisir un avatar"-->
		<!--						mode="basic"-->
		<!--						name="avatar"-->
		<!--						@select="onAvatarSelect($event, 'edit')"-->
		<!--					/>-->
		<!--					<img-->
		<!--						v-if="avatarPreview"-->
		<!--						:src="avatarPreview"-->
		<!--						alt="Aperçu"-->
		<!--						class="w-16 h-16 rounded-full object-cover mt-2"-->
		<!--					/>-->
		<!--				</div>-->
		<!--				<div class="flex justify-end gap-2 pt-4">-->
		<!--					<Button-->
		<!--						class="p-button-text"-->
		<!--						label="Annuler"-->
		<!--						type="button"-->
		<!--						@click="showEditDialog = false; resetEditForm()"-->
		<!--					/>-->
		<!--					<Button-->
		<!--						:loading="loading"-->
		<!--						label="Modifier"-->
		<!--						type="submit"-->
		<!--					/>-->
		<!--				</div>-->
		<!--			</form>-->
		<!--		</Dialog>-->

		<!--		&lt;!&ndash; Dialog de confirmation de suppression &ndash;&gt;-->
		<!--		<Dialog-->
		<!--			v-model:visible="deleteDialogVisible"-->
		<!--			class="w-full max-w-md"-->
		<!--			header="Confirmer la suppression"-->
		<!--			modal-->
		<!--		>-->
		<!--			<div class="flex items-center space-x-3 mb-4">-->
		<!--				<span class="material-symbols-rounded text-red-500 text-3xl">warning</span>-->
		<!--				<div>-->
		<!--					<p class="font-medium">Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>-->
		<!--					<p class="text-sm text-gray-600 mt-1">-->
		<!--						Utilisateur : {{ userToDelete?.username }}-->
		<!--					</p>-->
		<!--					<p class="text-sm text-red-600 mt-1">-->
		<!--						Cette action est irréversible.-->
		<!--					</p>-->
		<!--				</div>-->
		<!--			</div>-->
		<!--			<div class="flex justify-end gap-2">-->
		<!--				<Button-->
		<!--					class="p-button-text"-->
		<!--					label="Annuler"-->
		<!--					@click="deleteDialogVisible = false"-->
		<!--				/>-->
		<!--				<Button-->
		<!--					:loading="loading"-->
		<!--					class="p-button-danger"-->
		<!--					label="Supprimer"-->
		<!--					@click="handleDeleteUser"-->
		<!--				/>-->
		<!--			</div>-->
		<!--		</Dialog>-->
	</div>
</template>


<!--<template>-->
<!--	<div>-->
<!--		<h1>-->
<!--			admin 2-->
<!--		</h1>-->
<!--	</div>-->
<!--</template>-->