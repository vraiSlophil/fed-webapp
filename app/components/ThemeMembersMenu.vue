<script lang="ts" setup>
import type {Theme} from '~/types/theme'
import type {ThemeMember, ThemeMemberPermissions} from '~/types/themeMembers'
import {useThemeMembers} from '~/composables/useThemeMembers'

const props = defineProps<{
	visible: boolean
	theme: Theme
}>()

const emit = defineEmits<{
	(e: 'update:visible', value: boolean): void
}>()

const toast = useToast();
const {
	members,
	searchResults,
	loading,
	searchLoading,
	permissionPresets,
	getStatusLabel,
	getStatusSeverity,
	debouncedSearchUsers,
	fetchMembers,
	inviteUser,
	updateMemberPermissions,
	deactivateMember,
	reactivateMember,
	removeMember
} = useThemeMembers()

// État local
const searchQuery = ref('')
const selectedUser = ref<any>(null)

// États pour les confirmations
const memberToDelete = ref<ThemeMember | null>(null)
const memberToDeactivate = ref<ThemeMember | null>(null)
const showDeleteConfirm = ref(false)
const showDeactivateConfirm = ref(false)

// États pour les composants de permissions
const showInvitePermissions = ref(false)
const showEditPermissions = ref(false)
const editingMember = ref<ThemeMember | null>(null)

const noResults = computed(() => {
	return searchQuery.value.length >= 3 && searchResults.value.length === 0
})

const reloadMembers = () => {
	// Recharger les membres si le menu est visible
	if (props.visible) {
		try {
			fetchMembers(props.theme.theme_id)
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

// Charger les membres quand le menu devient visible
watch(() => props.visible, () => {
	reloadMembers();
})

// Gérer la recherche
watch(searchQuery, (newQuery) => {
	if (newQuery.length >= 3) {
		try {
			debouncedSearchUsers(newQuery, props.theme.theme_id);
		} catch (error: any) {
			toast.add({
				severity: 'error',
				summary: 'Erreur',
				detail: error.message,
				life: 3000
			})
		}
	}
})

const onTabChange = (index: number) => {
	if (index === 0) {
		// Recharger les membres quand on revient à l'onglet Membres
		reloadMembers()
	} else if (index === 1) {
		// Réinitialiser la recherche quand on passe à l'onglet Inviter
		searchQuery.value = ''
		searchResults.value = []
	}
}

// Sélectionner un utilisateur pour l'invitation
const selectUserForInvite = (user: any) => {
	selectedUser.value = user
	showInvitePermissions.value = true
	searchQuery.value = ''
}

// Confirmer l'invitation
const confirmInvite = async (permissions: ThemeMemberPermissions) => {
	if (!selectedUser.value) return

	try {
		await inviteUser(props.theme.theme_id, selectedUser.value.user_id, permissions)
		toast.add({
			severity: 'success',
			summary: 'Invitation envoyée',
			detail: `L'utilisateur ${getDisplayName(selectedUser.value)} a été invité avec succès.`,
			life: 3000
		})
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message,
			life: 3000
		})
	} finally {
		showInvitePermissions.value = false
		selectedUser.value = null
	}
}

// Annuler l'invitation
const cancelInvite = () => {
	showInvitePermissions.value = false
	selectedUser.value = null
}

// Commencer l'édition des permissions
const startEditPermissions = (member: ThemeMember) => {
	editingMember.value = member
	showEditPermissions.value = true
}

// Confirmer l'édition des permissions
const confirmEditPermissions = async (permissions: ThemeMemberPermissions) => {
	if (!editingMember.value) return

	try {
		await updateMemberPermissions(
			props.theme.theme_id,
			editingMember.value.user_id,
			permissions
		)
		const tempName = getDisplayName(editingMember.value)
		toast.add({
			severity: 'success',
			summary: 'Permissions mises à jour',
			detail: `Les permissions de ${getDisplayName(editingMember.value)} ont été mises à jour.`,
			life: 3000
		})
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message,
			life: 3000
		})
	} finally {
		showEditPermissions.value = false
		editingMember.value = null
	}
}

// Annuler l'édition des permissions
const cancelEditPermissions = () => {
	showEditPermissions.value = false
	editingMember.value = null
}

// Confirmer la désactivation
const confirmDeactivation = (member: ThemeMember) => {
	memberToDeactivate.value = member
	showDeactivateConfirm.value = true
}

const handleDeactivate = async () => {
	if (!memberToDeactivate.value) return

	try {
		await deactivateMember(props.theme.theme_id, memberToDeactivate.value.user_id)
		toast.add({
			severity: 'success',
			summary: 'Membre désactivé',
			detail: `${getDisplayName(memberToDeactivate.value)} a été désactivé avec succès.`,
			life: 3000
		})
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message,
			life: 3000
		})
	} finally {
		showDeactivateConfirm.value = false
		memberToDeactivate.value = null
	}
}

// Réactiver un membre
const handleReactivate = async (member: ThemeMember) => {
	try {
		await reactivateMember(props.theme.theme_id, member.user_id)
		toast.add({
			severity: 'success',
			summary: 'Membre réactivé',
			detail: `${getDisplayName(member)} a été réactivé avec succès.`,
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

// Confirmer la suppression
const confirmDeletion = (member: ThemeMember) => {
	memberToDelete.value = member
	showDeleteConfirm.value = true
}

const handleDelete = async () => {
	if (!memberToDelete.value) return

	try {
		await removeMember(props.theme.theme_id, memberToDelete.value.user_id)

		toast.add({
			severity: 'success',
			summary: 'Membre supprimé',
			detail: `${getDisplayName(memberToDelete.value)} a été supprimé du thème.`,
			life: 3000
		})
	} catch (error: any) {
		toast.add({
			severity: 'error',
			summary: 'Erreur',
			detail: error.message,
			life: 3000
		})
	} finally {
		showDeleteConfirm.value = false
		memberToDelete.value = null
	}
}

// Formater le nom d'affichage
const getDisplayName = (member: ThemeMember) => {
	if (member.first_name && member.last_name) {
		return `${member.first_name} ${member.last_name}`
	}
	return member.username
}
</script>

<template>
	<Dialog
		:visible="visible"
		class="w-xl"
		modal
		@update:visible="emit('update:visible', $event)"
	>
		<template #header>
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold">Membres du thème</h3>
			</div>
		</template>

		<Tabs value="0">
			<TabList>
				<Tab
					value="0"
					@click="onTabChange(0)"
				>Membres
				</Tab>
				<Tab
					value="1"
					@click="onTabChange(1)"
				>Inviter un membre
				</Tab>
			</TabList>
			<TabPanels>
				<TabPanel value="0">
					<!-- Liste des membres -->
					<div v-if="loading" class="text-center py-4">
						<span class="material-symbols-rounded text-gray-400 !text-4xl animate-spin">
						  progress_activity
						</span>
						<p class="text-sm text-gray-500 mt-2">Chargement des membres...</p>
					</div>
					<div v-else>
						<div
							v-for="member in members"
							:key="member.user_id"
						>
							<Divider v-if="members.indexOf(member) > 0"/>
							<div class="flex items-center justify-between py-3">
								<div class="flex items-center gap-3">
									<div>
										<Avatar
											v-if="member.avatar_path"
											:image="member.avatar_path"
											class="border-[1px] border-zinc-500"
											shape="circle"
										/>
										<Avatar
											v-else
											class="border-[1px] border-zinc-500"
											shape="circle"
										>
											<span class="material-symbols-rounded">person</span>
										</Avatar>
									</div>
									<div class="flex-1 flex items-center justify-between gap-3">
										<div
											class="flex flex-col gap-1 max-w-42 overflow-hidden text-ellipsis flex-nowrap">
											<div
												:title="getDisplayName(member)"
												class="font-medium overflow-hidden text-ellipsis whitespace-nowrap"
											>
												{{ getDisplayName(member) }}
											</div>
											<div
												:title="member.email"
												class="text-sm text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap"
											>
												{{ member.email }}
											</div>
										</div>
										<div class="flex items-center gap-2 mt-1">
											<Tag
												:severity="getStatusSeverity(member.status)"
												size="small"
											>
												{{ getStatusLabel(member.status) }}
											</Tag>
										</div>
									</div>
								</div>

								<!-- Actions -->
								<div v-if="member.status !== 'owner'" class="flex items-center gap-1 ml-1">
									<Button
										class="w-10 h-10"
										outlined
										rounded
										text
										title="Modifier les permissions"
										@click="startEditPermissions(member)"
									>
										<span class="material-symbols-rounded text-sm">edit</span>
									</Button>

									<Button
										v-if="member.status === 'active'"
										class="w-10 h-10"
										outlined
										rounded
										text
										title="Désactiver"
										@click="confirmDeactivation(member)"
									>
										<span class="material-symbols-rounded text-sm">block</span>
									</Button>

									<Button
										v-if="member.status === 'revoked'"
										:loading="loading"
										class="w-10 h-10"
										outlined
										rounded
										text
										title="Réactiver"
										@click="handleReactivate(member)"
									>
										<span class="material-symbols-rounded text-sm">check_circle</span>
									</Button>

									<Button
										class="w-10 h-10"
										outlined
										rounded
										text
										title="Supprimer"
										@click="confirmDeletion(member)"
									>
										<span class="material-symbols-rounded text-sm">delete</span>
									</Button>
								</div>
							</div>
						</div>
					</div>
				</TabPanel>
				<TabPanel value="1">
					<!-- Barre de recherche -->
					<div>
						<IconField class="mb-4 relative flex items-center justify-start">
							<span
								class="material-symbols-rounded text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2">
								search
							</span>
							<InputText
								v-model="searchQuery"
								:loading="searchLoading"
								class="w-full pl-10 !rounded-full"
								placeholder="Rechercher un utilisateur..."
							/>
						</IconField>

						<!-- Message quand aucun résultat -->
						<div v-if="noResults" class="text-center text-gray-500 py-4">
							<p class="text-sm">Aucun utilisateur trouvé. Essayez avec un autre terme de recherche.</p>
						</div>

						<!-- Résultats de recherche -->
						<div v-if="searchResults.length > 0" class="overflow-y-auto">
							<div
								v-for="user in searchResults"
								:key="user.user_id"
							>
								<Divider v-if="searchResults.indexOf(user) > 0"/>
								<div class="flex items-center justify-between py-3">
									<div class="flex items-center gap-3">
										<div>
											<Avatar
												v-if="user.avatar_path"
												:image="user.avatar_path"
												class="border-[1px] border-zinc-500"
												shape="circle"
											/>
											<Avatar
												v-else
												class="border-[1px] border-zinc-500"
												shape="circle"
											>
												<span class="material-symbols-rounded">account_circle</span>
											</Avatar>
										</div>
										<div>
											<div class="font-medium">{{ user.username }}</div>
											<div class="text-sm text-gray-500">{{ user.email }}</div>
										</div>
									</div>
									<div>
										<Button
											class="p-2"
											outlined
											rounded
											@click="selectUserForInvite(user)"
										>
											Inviter
										</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</TabPanel>
			</TabPanels>
		</Tabs>

		<!-- Composant pour l'invitation -->
		<ThemeMemberPermissionsEditor
			v-model:visible="showInvitePermissions"
			:loading="loading"
			:permission-presets="permissionPresets"
			:user="selectedUser"
			mode="invite"
			title="Inviter un membre"
			@cancel="cancelInvite"
			@confirm="confirmInvite"
		/>

		<!-- Composant pour l'édition des permissions -->
		<ThemeMemberPermissionsEditor
			v-model:visible="showEditPermissions"
			:loading="loading"
			:member="editingMember"
			:permission-presets="permissionPresets"
			:title="editingMember ? `Permissions de ${getDisplayName(editingMember)}` : 'Permissions'"
			mode="edit"
			@cancel="cancelEditPermissions"
			@confirm="confirmEditPermissions"
		/>

		<!-- Confirmation de désactivation -->
		<Dialog
			v-model:visible="showDeactivateConfirm"
			class="w-96"
			header="Confirmer la désactivation"
			modal
		>
			<div v-if="memberToDeactivate">
				<p class="mb-4">
					Êtes-vous sûr de vouloir désactiver {{ getDisplayName(memberToDeactivate) }} ?
					Cette personne ne pourra plus accéder au thème.
				</p>
				<div class="flex gap-2 justify-end">
					<Button
						:disabled="loading"
						rounded
						text
						severity="danger"
						@click="showDeactivateConfirm = false"
					>
						Annuler
					</Button>
					<Button
						:loading="loading"
						outlined
						rounded
						@click="handleDeactivate"
					>
						Désactiver
					</Button>
				</div>
			</div>
		</Dialog>

		<!-- Confirmation de suppression -->
		<Dialog
			v-model:visible="showDeleteConfirm"
			class="w-96"
			header="Confirmer la suppression"
			modal
		>
			<div v-if="memberToDelete">
				<p class="mb-4">
					Êtes-vous sûr de vouloir supprimer {{ getDisplayName(memberToDelete) }} ?
					Cette action est irréversible.
				</p>
				<div class="flex gap-2 justify-end">
					<Button
						:disabled="loading"

						text
						rounded
						@click="showDeleteConfirm = false"
					>
						Annuler
					</Button>
					<Button
						:loading="loading"
						severity="danger"
						rounded
						outlined
						@click="handleDelete"
					>
						Supprimer
					</Button>
				</div>
			</div>
		</Dialog>
	</Dialog>
</template>