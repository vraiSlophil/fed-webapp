export default defineNuxtPlugin(async () => {
    // Cette partie s'exécute côté client et côté serveur

    // Utiliser une vérification pour s'assurer que nous sommes côté client
    // car certaines opérations comme localStorage ne sont pas disponibles côté serveur
    if (import.meta.client) {
        const { initAuth } = useAuth()

        // Initialise l'état d'authentification au démarrage de l'application
        await initAuth()
    }
})