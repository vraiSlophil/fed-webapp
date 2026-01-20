<script setup lang="ts">
import Playground from '~/pages/playground.vue';

const { isAuthenticated, logout } = useAuth();
const toast = useToast();

const handleLogout = async () => {
    try {
        await logout();
        toast.add({
            severity: 'success',
            summary: 'Déconnexion réussie',
            detail: 'Vous avez été déconnecté avec succès.',
            life: 3000,
        });
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
    }
};
</script>
<template>
    <div class="min-h-screen flex flex-col">
        <h1 class="text-3xl font-bold underline text-center mt-10 mb-5">
            Bienvenue sur la page d'accueil !
        </h1>
        <p class="text-center text-lg">Ceci est la page principale de votre application Nuxt.</p>

        <div class="flex justify-center mt-10 space-x-4">
            <NuxtLink v-if="!isAuthenticated" class="text-blue-500 hover:underline" to="/login">
                login
            </NuxtLink>
            <NuxtLink v-if="!isAuthenticated" class="text-blue-500 hover:underline" to="/register">
                register
            </NuxtLink>
            <NuxtLink v-if="isAuthenticated" class="text-blue-500 hover:underline" to="/user">
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
        <div class="flex justify-center items-center flex-1 flex-col">
            <h1 class="text-2xl font-bold mb-10">Tests</h1>
            <div class="space-y-8 w-full max-w-3xl">
                <div class="bg-black/10 dark:bg-white/10 p-6 rounded-xl shadow-lg">
                    <h2 class="text-xl font-bold mb-4">Page Playground</h2>
                    <NuxtLink class="text-blue-500 hover:underline" to="/playground">
                        Playground
                    </NuxtLink>
                </div>
                <div class="bg-black/10 dark:bg-white/10 p-6 rounded-xl shadow-lg">
                    <h2 class="text-xl font-bold mb-4">
                        Tests sur le composant <code>Theme</code>
                    </h2>
                    <NuxtLink class="text-blue-500 hover:underline" to="/tests/themes">
                        Themes
                    </NuxtLink>
                </div>
                <div class="bg-black/10 dark:bg-white/10 p-6 rounded-xl shadow-lg">
                    <h2 class="text-xl font-bold mb-4">Tests sur la page admin</h2>
                    <NuxtLink class="text-blue-500 hover:underline" to="/admin"> Admin </NuxtLink>
                </div>
                <div class="bg-black/10 dark:bg-white/10 p-6 rounded-xl shadow-lg">
                    <h2 class="text-xl font-bold mb-4">Tests sur la page admin2</h2>
                    <NuxtLink class="text-blue-500 hover:underline" to="/admin2"> Admin2 </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>
