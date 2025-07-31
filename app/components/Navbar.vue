<script lang="ts" setup>

const props = defineProps({
	leftBackButton: {
		type: Boolean,
		default: false
	},
	from: {
		type: String,
		default: undefined
	}
});

const { user } = useAuth();
const route = useRoute();

// Obtenir la route actuelle pour la passer en paramètre 'from'
const currentRoute = computed(() => {
	return props.from || route.name || ''
});

const avatarUrl = computed(() => {
	if (!user.value || !user.value.avatar_path) return '';
	const config = useRuntimeConfig();
	return `${config.public.BACKEND_URL}/api/media/${user.value.avatar_path}`;
});

</script>

<template>
	<nav class="fixed top-4 left-4 z-1000 w-[calc(100%-2rem)] flex items-center justify-between p-4 backdrop-blur-xs shadow-[inset_0_0_3rem_#88888844] rounded-3xl border-[1px] border-gray-200/50 dark:border-gray-700/50">
		<!-- Left Third -->
		<div class="flex-1 text-left">
			<slot name="left">
				<NuxtLink
					v-if="leftBackButton"
					to="/"
					class="w-min text-nowrap flex items-center justify-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
				>
					<span class="material-symbols-rounded mr-2">arrow_back_ios_new</span>
					Retour à l'accueil
				</NuxtLink>
			</slot>
		</div>

		<!-- Center Third -->
		<div class="flex-1 text-center">
			<slot name="center">
				<!-- Code par défaut pour le logo -->
				<NuxtLink to="/" class="flex justify-center items-center">
					<div class="bg-white rounded-full">
						<img src="public/images/FED_icon_strict.svg" alt="FED Logo" class="w-8 h-8 m-2"/>
					</div>
					<span class="text-lg font-semibold ml-2">FED</span>
				</NuxtLink>
			</slot>
		</div>

		<!-- Right Third -->
		<div class="flex-1 text-right">
			<slot name="right">
<!--				NuxtLink to user page account -->
				<NuxtLink
					to="/user"
					:query="{ from: currentRoute }"
					class="flex justify-end items-center text-zinc-700 dark:text-zinc-300 gap-4"
				>
					{{ user && user.first_name && user.last_name ? user.first_name + ' ' + user.last_name : user?.username}}
					<Avatar
						:image="avatarUrl"
						shape="circle"
						size="large"
						class="border-[1px] border-zinc-500"
					/>
				</NuxtLink>
			</slot>
		</div>
	</nav>
</template>


<style scoped>
/* Ajoutez vos styles ici si nécessaire */
</style>