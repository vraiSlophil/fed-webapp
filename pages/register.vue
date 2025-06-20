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
    <form class="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-6">
      <h1 class="text-2xl font-bold text-center mb-4">Inscription</h1>
      <div>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <input
          type="email"
          placeholder="Email"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Mot de passe"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        S'inscrire
      </button>
    </form>
  </div>
</template>
<script setup lang="ts">
</script>