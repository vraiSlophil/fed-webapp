// Constants pour les configurations
const ADMIN_ROUTES = ['/admin', '/admin/', '/admin2', '/admin2/']
const ADMIN_ROLE_POWER_THRESHOLD = 50

/**
 * Vérifie si le chemin correspond à une route d'administration
 */
const isAdminRoutePath = (path: string): boolean => {
    return ADMIN_ROUTES.some(route =>
        path === route || path.startsWith(route + '/')
    )
}

/**
 * Vérifie si l'utilisateur a les droits d'administration requis
 */
const hasAdminRights = (user: any): boolean => {
    return !!user?.role_power && user.role_power >= ADMIN_ROLE_POWER_THRESHOLD
}

export default defineNuxtRouteMiddleware(async (to) => {
    const {isAuthenticated, user} = useAuth()
    const toast = useToast()

    // Vérifier si la route demandée est une route d'administration
    const isAdminRoute = isAdminRoutePath(to.path)

    // Si ce n'est pas une route d'admin, on laisse passer
    if (!isAdminRoute) {
        return
    }

    // Vérifier l'authentification
    if (!isAuthenticated.value) {
        toast.add({
            severity: 'error',
            summary: 'Accès refusé',
            detail: 'Vous devez être connecté pour accéder à cette page',
            life: 3000
        })
        return navigateTo('/login')
    }

    // Vérifier les droits d'administration
    if (!hasAdminRights(user.value)) {
        toast.add({
            severity: 'error',
            summary: 'Accès refusé',
            detail: 'Vous n\'avez pas les droits nécessaires pour accéder à cette page',
            life: 3000
        })
        return navigateTo('/')
    }
})