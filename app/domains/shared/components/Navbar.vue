<script lang="ts" setup>
import { useAuth } from '~/domains/auth/composables/useAuth';
import { navigateTo } from '#app';

const props = defineProps({
    leftBackButton: {
        type: Boolean,
        default: false,
    },
    rightLoginButton: {
        type: Boolean,
        default: true,
    },
    from: {
        type: String,
        default: '',
    },
});

const { user, loading } = useAuth();
const route = useRoute();
const router = useRouter();

const effectiveFrom = computed(() => {
    return props.from || (route.query.from as string) || '';
});

const currentRoute = computed(() => {
    return effectiveFrom.value || route.name || '';
});

const avatarUrl = computed(() => {
    if (!user.value || !user.value.avatar_path) return '';
    const config = useRuntimeConfig();
    return `${config.public.BACKEND_URL}/api/media/${user.value.avatar_path}`;
});

const goBack = () => {
    if (effectiveFrom.value) {
        // Si on a un paramètre 'from', rediriger vers cette page
        navigateTo(`/${effectiveFrom.value}`);
    } else {
        // Sinon, utiliser l'historique du navigateur ou rediriger vers l'accueil
        if (window.history.length > 1) {
            router.go(-1);
        } else {
            navigateTo('/');
        }
    }
};

const isPlaygroundRoute = computed(() => {
    const name = route.name?.toString() || '';
    return name.startsWith('playground');
});
</script>

<template>
    <nav
        class="fixed top-4 left-4 z-1000 w-[calc(100%-2rem)] flex items-center justify-between py-4 px-5 backdrop-blur-xs shadow-[inset_0_0_3rem_#88888844] rounded-full border-[1px] border-neutral-200/10"
    >
        <!-- Left Third -->
        <div class="flex-1 text-left">
            <slot name="left">
                <div v-if="props.leftBackButton" class="flex justify-start items-center">
                    <Button outlined rounded severity="secondary" @click="goBack">
                        <span class="material-symbols-rounded">arrow_back_ios_new</span>
                        Retour
                    </Button>
                </div>
            </slot>
        </div>

        <!-- Center Third -->
        <div class="flex-1 text-center">
            <slot name="center">
                <!-- Code par défaut pour le logo -->
                <NuxtLink class="flex justify-center items-center" to="/">
                    <div class="bg-white rounded-full">
                        <img
                            alt="FED Logo"
                            class="w-8 h-8 m-2"
                            src="public/images/FED_icon_strict.svg"
                        />
                    </div>
                    <span class="text-lg font-semibold ml-2">FED</span>
                </NuxtLink>
            </slot>
        </div>

        <!-- Right Third -->
        <div class="flex-1 text-right">
            <ClientOnly>
                <slot name="right">
                    <div v-if="props.rightLoginButton">
                        <Button v-if="loading" disabled outlined rounded severity="secondary">
                            <span class="material-symbols-rounded animate-spin"
                                >progress_activity</span
                            >
                            Chargement...
                        </Button>
                        <div v-else-if="user && !isPlaygroundRoute">
                            <Button rounded severity="primary" @click="navigateTo('/playground')">
                                Accéder à FED
                            </Button>
                        </div>
                        <div v-else-if="user && isPlaygroundRoute">
                            <Button
                                v-if="user"
                                :query="{ from: currentRoute }"
                                class="flex justify-end items-center text-zinc-700 dark:text-zinc-300 gap-4"
                                outlined
                                rounded
                                severity="secondary"
                                @click="navigateTo('/user')"
                            >
                                <Avatar
                                    v-if="avatarUrl"
                                    :image="avatarUrl"
                                    class="border-[1px] border-zinc-500"
                                    shape="circle"
                                />
                                <Avatar v-else class="border-[1px] border-zinc-500" shape="circle">
                                    <span class="material-symbols-rounded">person</span>
                                </Avatar>
                                {{
                                    user && user.first_name && user.last_name
                                        ? user.first_name + ' ' + user.last_name
                                        : user?.username
                                }}
                            </Button>
                        </div>

                        <div v-else>
                            <Button
                                outlined
                                rounded
                                severity="secondary"
                                @click="navigateTo('/login')"
                            >
                                <span class="material-symbols-rounded">login</span>
                                Connexion / Inscription
                            </Button>
                        </div>
                    </div>
                </slot>
            </ClientOnly>
        </div>
    </nav>
</template>

<style scoped>
/* Ajoutez vos styles ici si nécessaire */
</style>
