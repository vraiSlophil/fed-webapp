<script setup lang="ts">

const {isAuthenticated} = useAuth();

</script>

<template>
	<div>
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
		transition: all 0.4s;
	}

	.page-enter-from,
	.page-leave-to {
		opacity: 0;
		filter: blur(1rem);
	}
</style>