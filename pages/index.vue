<script setup lang="ts">

const {isAuthenticated, logout} = useAuth();
const toast = useToast();

const handleLogout = async () => {
	try {
		await logout();
		toast.add({
				severity: 'success',
				summary: 'Déconnexion réussie',
				detail: 'Vous avez été déconnecté avec succès.',
				life: 3000
			})
	} catch (error) {
		console.error('Erreur lors de la déconnexion:', error);
	}
};

</script>
<template>
	<div>
		<h1
			class="text-3xl font-bold underline text-center mt-10 mb-5"
		>
			Bienvenue sur la page d'accueil !
		</h1>
		<p
			class="text-center text-lg"
		>
			Ceci est la page principale de votre application Nuxt.
		</p>

		<div
			class="flex justify-center mt-10 space-x-4"
		>
			<NuxtLink
				class="text-blue-500 hover:underline"
				to="/login"
			>
				login
			</NuxtLink>
			<NuxtLink
				class="text-blue-500 hover:underline"
				to="/register"
			>
				register
			</NuxtLink>
			<NuxtLink
				v-if="isAuthenticated"
				class="text-blue-500 hover:underline"
				to="/user"
			>
				user
			</NuxtLink>
			<a
				v-if="isAuthenticated"
				class="text-blue-500 hover:underline cursor-pointer"
				@click.prevent
				@click="handleLogout"
			>
				déconnexion
			</a>
		</div>
	</div>
</template>