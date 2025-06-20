<template>
  <div class="flex min-h-screen items-center justify-center flex-col bg-gray-100">
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
    <div class="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4">
      <h1 class="text-2xl font-bold text-center mb-4">Profil utilisateur</h1>
      <div class="flex flex-col items-center space-y-2">
        <div class="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center text-3xl font-bold text-blue-700">
          {{ user.nom.charAt(0) }}
        </div>
        <div class="text-lg font-semibold">{{ user.nom }}</div>
        <div class="text-gray-600">{{ user.email }}</div>
        <div class="text-gray-400 text-sm">ID: {{ user.id }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const user = ref({ id: 0, nom: '', email: '' })

onMounted(() => {
  user.value = {
    id: 1,
    nom: 'Jean',
    email: 'jean@example.com'
  }
})
</script>