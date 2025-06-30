<script setup lang="ts">

const {isAuthenticated} = useAuth();

const handlePing = async () => {
	try {
		const response = await useApiFetch('/api/ping');
		console.log('Ping response:', response.message);
	} catch (error) {
		console.error('Ping error:', error);
	}
};

</script>

<template>
	<div>
		<Button
			@click="handlePing"
		>
			Ping
		</Button>
		<!--		<pre>-->
		<!--			{{ isAuthenticated ? 'Utilisateur connecté' : 'Utilisateur non connecté' }}-->
		<!--		</pre>-->
		<NuxtPage/>
		<Toast position="top-right"/>
	</div>
</template>

<style>
.page-enter-active,
.page-leave-active {
	transition: all 0.1s;
}

.page-enter-from,
.page-leave-to {
	opacity: 0;
	filter: blur(1rem);
}
</style>