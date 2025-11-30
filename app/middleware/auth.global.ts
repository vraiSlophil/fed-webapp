import type {User} from "~/types/user";
import {isServer} from "@primeuix/utils";
import {useAuth} from "~/domains/auth/composables/useAuth";

interface AuthState {
    initAuth: () => Promise<boolean>
    isAuthenticated: Ref<boolean>
    user: Ref<User | null>
}

// Déplacer idéalement ces routes dans un fichier de configuration
const PUBLIC_ROUTES = ['/login', '/register', '/', '/forgot-password', '/password-reset']

/**
 * Vérifie si une route est publique
 */
function isPublicRoute(path: string): boolean {
    // Vérification exacte pour la racine
    if (path === '/') return true

    // Vérification directe ou préfixe pour les autres routes
    return PUBLIC_ROUTES.some(route =>
        path === route || path.startsWith(`${route}/`)
    )
}

export default defineNuxtRouteMiddleware(async (to, from) => {

    const {initAuth, isAuthenticated, user} = useAuth() as AuthState
    const toast = useToast()

    if (isServer()) return

    // Autoriser l'accès aux routes publiques
    if (isPublicRoute(to.path)) {
        return
    }

    // Si on n'est pas encore authentifié ET qu'on n'a pas de user, on tente un init
    if (!isAuthenticated.value || !user.value) {
        try {
            await initAuth()
        } catch (e) {
            console.warn('Auth init failed', e)
        }
    }

    // Vérifier l'authentification pour les routes protégées
    if (!isAuthenticated.value || !user.value) {
        // Journaliser la tentative d'accès (optionnel)
        console.warn(`Tentative d'accès non autorisé à ${to.path}`)

        toast.add({
            severity: 'warn',
            summary: 'Accès refusé',
            detail: 'Veuillez vous connecter pour accéder à cette page',
            life: 3000
        })

        return navigateTo('/login')
    }

})