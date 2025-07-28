<script lang="ts" setup>
import type {User} from '~/types/user'

// // Navigation guard pour admin seulement
// definePageMeta({
// 	middleware: 'admin'
// })

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
	setStatusFilter
} = useAdmin()

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

// Gestion de la vérification
const handleVerifyUser = async (user: User) => {
	try {
		await verifyUser(user.user_id)
		toast.add({
			severity: 'success',
			summary: 'Succès',
			detail: 'Utilisateur vérifié avec succès',
			life: 3000
		})
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
		action: loadUserDetails
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
	<div class="min-h-screen p-6">
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
				class="border-[1px] border-slate-200 dark:border-zinc-700"
			>
				<template #content>
					<div class="flex items-center justify-between">
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
					<div class="p-6">
						<!-- Filtres et actions -->
						<div class="flex flex-row gap-4 mb-6">
							<IconField class="flex-1 relative max-w-lg min-w-sm">
								<span class="material-symbols-rounded text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2">search</span>
								<InputText
									v-model="searchQuery"
									class="w-full h-11.5 pl-10 pr-4 py-2 text-sm flex items-center justify-between"
									placeholder="Rechercher par nom, email..."
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
										{label: 'Actifs', value: 'active'},
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
							:lazy="true"
							:loading="loading"
							:rows="20"
							:total-records="totalUsers"
							:value="users"
							class="p-datatable-sm"
							paginator
							responsive-layout="scroll"
							@page="handlePageChange($event.page + 1)"
						>
							<Column field="avatar_path" header="Avatar" style="width: 80px">
								<template #body="{ data }">
									<img
										v-if="data.avatar_path"
										:alt="data.username"
										:src="data.avatar_path"
										class="w-8 h-8 rounded-full object-cover"
									/>
									<div
										v-else
										class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold"
									>
										{{ data.username.charAt(0).toUpperCase() }}
									</div>
								</template>
							</Column>

							<Column field="username" header="Utilisateur" sortable>
								<!--								todo -->
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

							<Column field="role.name" header="Rôle" sortable>
								<!--								todo -->
								<template #body="{ data }">
									<Tag
										:severity="data.role_power > 10 ? ( data.role_power > 100 ? 'danger' :'warning') : 'info'"
										:value="data.role?.name || 'Utilisateur'"
									/>
								</template>
							</Column>

							<Column field="created_at" header="Inscription" sortable>
								<!--								todo -->
								<template #body="{ data }">
									{{ formatDate(data.created_at) }}
								</template>
							</Column>

							<Column field="last_login_at" header="Dernière connexion">
								<!--								todo -->
								<template #body="{ data }">
									{{ formatDateTime(data.last_login_at) }}
								</template>
							</Column>

							<Column field="email_verified_at" header="Statut">
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
											severity="warning"
											value="Non vérifié"
										/>
									</div>
								</template>
							</Column>

							<Column header="Actions" style="width: 150px">
								<template #body="{ data }">
									<!--									todo -->
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
									<!--									<div class="flex gap-2">-->
									<!--										<Button-->
									<!--											icon="pi pi-eye"-->
									<!--											size="small"-->
									<!--											text-->
									<!--											title="Voir détails"-->
									<!--											@click="loadUserDetails(data)"-->
									<!--										/>-->
									<!--										<Button-->
									<!--											icon="pi pi-pencil"-->
									<!--											size="small"-->
									<!--											text-->
									<!--											title="Modifier"-->
									<!--											@click="openEditDialog(data)"-->
									<!--										/>-->
									<!--										<Button-->
									<!--											:class="data.blocked_at ? 'p-button-success' : 'p-button-warning'"-->
									<!--											:icon="data.blocked_at ? 'pi pi-unlock' : 'pi pi-lock'"-->
									<!--											:title="data.blocked_at ? 'Débloquer' : 'Bloquer'"-->
									<!--											size="small"-->
									<!--											text-->
									<!--											@click="handleBlockUser(data)"-->
									<!--										/>-->
									<!--										<Button-->
									<!--											class="p-button-danger"-->
									<!--											icon="pi pi-trash"-->
									<!--											size="small"-->
									<!--											text-->
									<!--											title="Supprimer"-->
									<!--											@click="handleConfirmDeleteUser(data)"-->
									<!--										/>-->
									<!--									</div>-->
								</template>
							</Column>
						</DataTable>
					</div>
				</TabPanel>

				<!-- Onglet Détails utilisateur -->
				<TabPanel :disabled="!selectedUser" :value="1">
					<div v-if="selectedUser" class="p-6">
						<!-- Informations utilisateur -->
						<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
							<!-- Profil utilisateur -->
							<Card class="lg:col-span-1">
								<template #title>Profil</template>
								<template #content>
									<div class="flex flex-col items-center text-center">
										<img
											v-if="selectedUser.avatar_path"
											:alt="selectedUser.username"
											:src="selectedUser.avatar_path"
											class="w-24 h-24 rounded-full object-cover mb-4"
										/>
										<div
											v-else
											class="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold mb-4"
										>
											{{ selectedUser.username.charAt(0).toUpperCase() }}
										</div>
										<h3 class="text-xl font-semibold">{{ selectedUser.username }}</h3>
										<p class="text-gray-600">{{ selectedUser.email }}</p>
										<div class="flex gap-2 mt-4">
											<Tag
												:severity="selectedUser.role_power > 1 ? 'warning' : 'info'"
												:value="selectedUser.role?.name || 'Utilisateur'"
											/>
											<Tag
												v-if="selectedUser.blocked_at"
												severity="danger"
												value="Bloqué"
											/>
											<Tag
												v-else-if="selectedUser.email_verified_at"
												severity="success"
												value="Vérifié"
											/>
											<Tag
												v-else
												severity="warning"
												value="Non vérifié"
											/>
										</div>
									</div>
								</template>
							</Card>

							<!-- Métriques utilisateur -->
							<Card class="lg:col-span-2">
								<template #title>Statistiques</template>
								<template #content>
									<div v-if="userMetrics" class="grid grid-cols-2 md:grid-cols-4 gap-4">
										<div class="text-center">
											<div class="text-2xl font-bold text-blue-600">{{
													userMetrics.themes_count
												}}
											</div>
											<div class="text-sm text-gray-600">Thèmes</div>
										</div>
										<div class="text-center">
											<div class="text-2xl font-bold text-green-600">{{
													userMetrics.tasks_count
												}}
											</div>
											<div class="text-sm text-gray-600">Tâches</div>
										</div>
										<div class="text-center">
											<div class="text-2xl font-bold text-purple-600">
												{{ userMetrics.completed_tasks_count }}
											</div>
											<div class="text-sm text-gray-600">Complétées</div>
										</div>
										<div class="text-center">
											<div class="text-2xl font-bold text-orange-600">
												{{ userMetrics.completion_rate_percentage }}%
											</div>
											<div class="text-sm text-gray-600">Taux de complétion</div>
										</div>
									</div>
									<div v-else class="text-center text-gray-500">
										Aucune métrique disponible
									</div>
								</template>
							</Card>
						</div>

						<!-- Actions sur l'utilisateur -->
						<div class="flex gap-2 mt-6">
							<Button
								icon="pi pi-pencil"
								label="Modifier"
								@click="openEditDialog(selectedUser)"
							/>
							<Button
								v-if="!selectedUser.email_verified_at"
								class="p-button-success"
								icon="pi pi-check-circle"
								label="Vérifier email"
								@click="handleVerifyUser(selectedUser)"
							/>
							<Button
								:class="selectedUser.blocked_at ? 'p-button-success' : 'p-button-warning'"
								:icon="selectedUser.blocked_at ? 'pi pi-unlock' : 'pi pi-lock'"
								:label="selectedUser.blocked_at ? 'Débloquer' : 'Bloquer'"
								@click="handleBlockUser(selectedUser)"
							/>
							<Button
								class="p-button-danger"
								icon="pi pi-trash"
								label="Supprimer"
								@click="handleConfirmDeleteUser(selectedUser)"
							/>
						</div>
					</div>
					<div v-else class="p-6 text-center text-gray-500">
						Sélectionnez un utilisateur pour voir ses détails
					</div>
				</TabPanel>
			</TabPanels>
		</LazyTabs>

		<!-- Dialog de création -->
		<Dialog
			v-model:visible="showCreateDialog"
			class="w-full max-w-md"
			header="Créer un utilisateur"
			modal
		>
			<form class="space-y-4" @submit.prevent="handleCreateUser">
				<div>
					<label class="block text-sm font-medium mb-2">Nom d'utilisateur</label>
					<InputText
						v-model="createForm.username"
						class="w-full"
						required
					/>
				</div>
				<div>
					<label class="block text-sm font-medium mb-2">Email</label>
					<InputText
						v-model="createForm.email"
						class="w-full"
						required
						type="email"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium mb-2">Mot de passe</label>
					<Password
						v-model="createForm.password"
						:input-class="'w-full'"
						class="w-full"
						required
						toggle-mask
					/>
				</div>
				<div>
					<label class="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
					<Password
						v-model="createForm.password_confirmation"
						:input-class="'w-full'"
						class="w-full"
						required
						toggle-mask
					/>
				</div>
				<div>
					<label class="block text-sm font-medium mb-2">Prénom</label>
					<InputText
						v-model="createForm.first_name"
						class="w-full"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium mb-2">Nom</label>
					<InputText
						v-model="createForm.last_name"
						class="w-full"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium mb-2">Rôle</label>
					<Select
						v-model="createForm.role_power"
						:options="roles"
						class="w-full"
						option-label="name"
						option-value="power"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium mb-2">Avatar</label>
					<FileUpload
						:auto="false"
						accept="image/*"
						choose-label="Choisir un avatar"
						mode="basic"
						name="avatar"
						@select="onAvatarSelect($event, 'create')"
					/>
					<img
						v-if="avatarPreview"
						:src="avatarPreview"
						alt="Aperçu"
						class="w-16 h-16 rounded-full object-cover mt-2"
					/>
				</div>
				<div class="flex justify-end gap-2 pt-4">
					<Button
						class="p-button-text"
						label="Annuler"
						type="button"
						@click="showCreateDialog = false; resetCreateForm()"
					/>
					<Button
						:loading="loading"
						label="Créer"
						type="submit"
					/>
				</div>
			</form>
		</Dialog>

		<!-- Dialog de modification -->
		<Dialog
			v-model:visible="showEditDialog"
			class="w-full max-w-md"
			header="Modifier l'utilisateur"
			modal
		>
			<form class="space-y-4" @submit.prevent="handleUpdateUser">
				<div>
					<label class="block text-sm font-medium mb-2">Nom d'utilisateur</label>
					<InputText
						v-model="editForm.username"
						class="w-full"
						required
					/>
				</div>
				<div>
					<label class="block text-sm font-medium mb-2">Email</label>
					<InputText
						v-model="editForm.email"
						class="w-full"
						required
						type="email"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium mb-2">Nouveau mot de passe (optionnel)</label>
					<Password
						v-model="editForm.password"
						:input-class="'w-full'"
						class="w-full"
						toggle-mask
					/>
				</div>
				<div v-if="editForm.password">
					<label class="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
					<Password
						v-model="editForm.password_confirmation"
						:input-class="'w-full'"
						class="w-full"
						toggle-mask
					/>
				</div>
				<div>
					<label class="block text-sm font-medium mb-2">Prénom</label>
					<InputText
						v-model="editForm.first_name"
						class="w-full"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium mb-2">Nom</label>
					<InputText
						v-model="editForm.last_name"
						class="w-full"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium mb-2">Rôle</label>
					<Select
						v-model="editForm.role_power"
						:options="roles"
						class="w-full"
						option-label="name"
						option-value="power"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium mb-2">Nouvel avatar (optionnel)</label>
					<FileUpload
						:auto="false"
						accept="image/*"
						choose-label="Choisir un avatar"
						mode="basic"
						name="avatar"
						@select="onAvatarSelect($event, 'edit')"
					/>
					<img
						v-if="avatarPreview"
						:src="avatarPreview"
						alt="Aperçu"
						class="w-16 h-16 rounded-full object-cover mt-2"
					/>
				</div>
				<div class="flex justify-end gap-2 pt-4">
					<Button
						class="p-button-text"
						label="Annuler"
						type="button"
						@click="showEditDialog = false; resetEditForm()"
					/>
					<Button
						:loading="loading"
						label="Modifier"
						type="submit"
					/>
				</div>
			</form>
		</Dialog>

		<!-- Dialog de confirmation de suppression -->
		<Dialog
			v-model:visible="deleteDialogVisible"
			class="w-full max-w-md"
			header="Confirmer la suppression"
			modal
		>
			<div class="flex items-center space-x-3 mb-4">
				<span class="material-symbols-rounded text-red-500 text-3xl">warning</span>
				<div>
					<p class="font-medium">Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
					<p class="text-sm text-gray-600 mt-1">
						Utilisateur : {{ userToDelete?.username }}
					</p>
					<p class="text-sm text-red-600 mt-1">
						Cette action est irréversible.
					</p>
				</div>
			</div>
			<div class="flex justify-end gap-2">
				<Button
					class="p-button-text"
					label="Annuler"
					@click="deleteDialogVisible = false"
				/>
				<Button
					:loading="loading"
					class="p-button-danger"
					label="Supprimer"
					@click="handleDeleteUser"
				/>
			</div>
		</Dialog>
	</div>
</template>


<!--<template>-->
<!--	<div>-->
<!--		<h1>-->
<!--			admin 2-->
<!--		</h1>-->
<!--	</div>-->
<!--</template>-->