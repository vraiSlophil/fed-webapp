<script setup lang="ts">
import { login } from '~/services/auth'

const email = ref<string>('')
const password = ref<string>('')

// Initialiser le toast
const toast = useToast()

const handleLogin = async () => {
  try {
    const response = await login(email.value, password.value)
    toast.add({
      severity: 'success',
      summary: 'Connexion réussie',
      detail: 'Bienvenue !',
      life: 3000
    })
  } catch (error: any) {
    const backendMessage = error?.data?.message || error.message || 'Erreur inconnue'
    toast.add({
      severity: 'error',
      summary: 'Erreur de connexion',
      detail: backendMessage,
      life: 3000
    })
  }
}
</script>

<template>
<ClientOnly>

  <div class="flex min-h-screen items-center justify-center flex-col ">
    <div
        class="flex items-center justify-center mb-4 w-full"
    >

      <span
          class="material-symbols-rounded text-blue-500 mr-2"
      >
        arrow_back
      </span>
      <a
          class="text-blue-500 hover:underline flex justify-center items-center"
          href="/"
      >
        Retour à l'accueil
      </a>
    </div>
    <form
        class=" p-8 rounded shadow-md w-full max-w-sm space-y-6"
        @submit.prevent="handleLogin"
    >
      <h1 class="text-2xl font-bold text-center mb-4">Login</h1>
      <div>
        <InputText
            v-model="email"
            type="email"
            placeholder="Nom d'utilisateur"
            class="w-full"
        />
      </div>
      <div>
        <Password
            v-model="password"
            placeholder="Mot de passe"
            class="w-full"
            :inputClass="'w-full'"
        />
      </div>
      <!--      <button-->
      <!--        type="submit"-->
      <!--        class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"-->
      <!--      >-->
      <!--        Se connecter-->
      <!--      </button>-->
      <Button
          type="submit"
          class="w-full"
      >
        Se connecter
      </Button>
    </form>
  </div>
</ClientOnly>
</template>
