<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { HttpMethods } from '~/utils/httpMethods';

const route = useRoute();
const password = ref('');
const password_confirmation = ref('');
const loading = ref(false);
const toast = useToast();

const submit = async () => {
    loading.value = true;
    try {
        await useApiFetch('/api/reset-password', {
            method: HttpMethods.POST,
            body: JSON.stringify({
                email: route.query.email,
                token: route.params.token || route.query.token,
                password: password.value,
                password_confirmation: password_confirmation.value,
            }),
        });
        toast.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Mot de passe réinitialisé. Vous pouvez vous connecter.',
            life: 3000,
        });
        setTimeout(() => navigateTo('/login'), 1500);
    } catch (e: any) {
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: e?.data?.message || 'Erreur lors de la réinitialisation.',
            life: 4000,
        });
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="flex min-h-screen items-center justify-center flex-col">
        <div
            class="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-min text-nowrap flex items-center justify-center"
        >
            <span class="material-symbols-rounded text-blue-500 mr-2">arrow_back</span>
            <NuxtLink class="text-blue-500 hover:underline flex justify-center items-center" to="/">
                Retour à l'accueil
            </NuxtLink>
        </div>
        <form class="p-8 rounded shadow-md w-full max-w-sm space-y-6" @submit.prevent="submit">
            <h1 class="text-2xl font-bold text-center mb-4">Réinitialiser le mot de passe</h1>
            <div>
                <Password
                    v-model="password"
                    placeholder="Nouveau mot de passe"
                    class="w-full"
                    :input-class="'w-full'"
                    toggle-mask
                />
            </div>
            <div>
                <Password
                    v-model="password_confirmation"
                    placeholder="Confirmer le mot de passe"
                    class="w-full"
                    :input-class="'w-full'"
                    toggle-mask
                />
            </div>
            <Button type="submit" class="w-full" :loading="loading" label="Réinitialiser" />
        </form>
    </div>
</template>
