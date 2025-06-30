<template>
  <div class="flex min-h-screen items-center justify-center flex-col">
    <div class="flex items-center justify-center mb-4 w-full">
      <span class="material-symbols-rounded text-blue-500 mr-2">
        arrow_back
      </span>
      <NuxtLink
        class="text-blue-500 hover:underline flex justify-center items-center"
        to="/login"
      >
        Retour à la connexion
      </NuxtLink>
    </div>
    <form
      class="p-8 rounded shadow-md w-full max-w-sm space-y-6"
      @submit.prevent="submit"
    >
      <h1 class="text-2xl font-bold text-center mb-4">Mot de passe oublié</h1>
      <div>
        <InputText
          v-model="email"
          type="email"
          placeholder="Votre email"
          class="w-full"
        />
      </div>
      <Button
        type="submit"
        class="w-full"
        :loading="loading"
        label="Envoyer le lien de réinitialisation"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { HttpMethod } from '~/utils/httpMethods'
const email = ref('')
const loading = ref(false)
const toast = useToast()

const submit = async () => {
  loading.value = true
  try {
    await useApiFetch('/api/forgot-password', {
      method: HttpMethod.POST,
      body: JSON.stringify({ email: email.value })
    })
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Un email de réinitialisation a été envoyé.',
      life: 3000
    })
    email.value = ''
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: e?.data?.message || 'Erreur lors de l’envoi.',
      life: 4000
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* PrimeVue + Tailwind intégration */
</style>
