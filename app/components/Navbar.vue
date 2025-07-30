<script lang="ts" setup>
// Pas de logique spécifique pour ce composant
</script>

<template>
	<nav class="fixed top-4 left-4 z-1000 w-[calc(100%-2rem)] flex items-center justify-between p-4 backdrop-blur-xs rounded-xl border-[1px] border-gray-200/50 dark:border-gray-700/50">
		<!-- Left Third -->
		<div class="flex-1">
			<slot name="left">
				<NuxtLink class="flex items-center text-blue-600 hover:text-blue-800 transition-colors" to="/">
					<span class="material-symbols-rounded mr-2">arrow_back</span>
					Retour à l'accueil
				</NuxtLink>
			</slot>
		</div>

		<!-- Center Third -->
		<div class="flex-1 text-center">
			<slot name="center">
				<!-- Code par défaut pour le logo -->
				<div class="flex justify-center items-center">
					<div class="bg-white rounded-full">
						<img src="public/images/FED_icon_strict.svg" alt="FED Logo" class="w-8 h-8 m-2"/>
					</div>
					<span class="text-lg font-semibold ml-2">FED</span>
				</div>
			</slot>
		</div>

		<!-- Right Third -->
		<div class="flex-1 text-right flex justify-end items-center gap-4 flex-row">
			<slot name="right">
				<!-- Contenu par défaut vide -->
			</slot>
		</div>
	</nav>
</template>


<style scoped>
/* Ajoutez vos styles ici si nécessaire */
</style>