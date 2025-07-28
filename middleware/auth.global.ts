import type {RouteLocationNormalized} from "#vue-router";
import type {User} from "~/types/user";

interface AuthState {
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

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
    const {isAuthenticated, user} = useAuth() as AuthState
    const toast = useToast()

    // Autoriser l'accès aux routes publiques
    if (isPublicRoute(to.path)) {
        return
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

    // Extension possible: vérification des rôles/permissions
    // if (needsAdminRole(to.path) && !hasRole(user.value, 'ADMIN')) {
    //   toast.add({
    //     severity: 'error',
    //     summary: 'Accès interdit',
    //     detail: 'Vous n\'avez pas les permissions nécessaires',
    //     life: 3000
    //   })
    //   return navigateTo('/')
    // }
})