/**
 * Vérifie si l'utilisateur a les droits d'administration requis
 * @param user L'utilisateur actuel
 * @returns Booléen indiquant si l'utilisateur a des droits d'admin
 */
const hasAdminRights = (user: any): boolean => {
    const ADMIN_ROLE_POWER_THRESHOLD = 50
    return !!user?.role_power && user.role_power >= ADMIN_ROLE_POWER_THRESHOLD
}

export default defineNuxtRouteMiddleware(async () => {
    const {isAuthenticated, user} = useAuth()
    const toast = useToast()

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