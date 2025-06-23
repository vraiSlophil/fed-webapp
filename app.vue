<script setup lang="ts">

const {isAuthenticated} = useAuth();

</script>

<template>
	<div>
		<pre>
			{{ isAuthenticated ? 'Utilisateur connecté' : 'Utilisateur non connecté' }}
		</pre>
		<NuxtPage/>
		<Toast position="top-right"/>
	</div>
</template>
