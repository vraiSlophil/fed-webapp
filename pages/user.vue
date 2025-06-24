<script setup lang="ts">
const {user} = useAuth();
</script>

<template>
	<div
		class="flex min-h-screen items-center justify-center flex-col"
	>
		<div class="flex items-center justify-center mb-4 w-full">
			<span class="material-symbols-rounded text-blue-500 mr-2">
				arrow_back
			</span>
			<NuxtLink
				class="text-blue-500 hover:underline flex justify-center items-center"
				to="/"
			>
				Retour à l'accueil
			</NuxtLink>
		</div>
		<div
			v-if="user"
			class="p-8 rounded shadow-md w-full max-w-sm space-y-4"
		>
			<h1 class="text-2xl font-bold text-center mb-4">Profil utilisateur</h1>
			<div v-if="user" class="flex flex-col items-center space-y-2">
				<div
					class="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center text-3xl font-bold text-blue-700">
					{{ (user.first_name || user.username || user.email).charAt(0).toUpperCase() }}
				</div>
				<div class="text-lg font-semibold">
					{{ user.first_name || user.username || 'Utilisateur' }}
				</div>
				<div class="text-gray-600">{{ user.email }}</div>
				<div class="text-gray-400 text-sm">ID: {{ user.user_id }}</div>
			</div>
			<div v-else class="text-center text-red-500">Aucun utilisateur trouvé.</div>
		</div>
		<div
			v-else
		>
			Chargement...
		</div>
	</div>

</template>