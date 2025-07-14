export default defineNuxtRouteMiddleware(async (to) => {
    const { isAuthenticated, user } = useAuth()
    const toast = useToast()

    // Routes publiques accessibles à tous
    const publicRoutes = ['/login', '/register', '/', '/forgot-password', '/reset-password']

    if (publicRoutes.some(route =>
        route === '/'
            ? to.path === '/'
            : to.path === route || (route !== '/' && to.path.startsWith(route + '/'))
    )) {
        return // Permet l'accès aux routes publiques
    }

    // Vérifier l'authentification pour les routes protégées
    if (!isAuthenticated.value || !user.value) {
        toast.add({
            severity: 'warn',
            summary: 'Accès refusé',
            detail: 'Veuillez vous connecter pour accéder à cette page',
            life: 3000
        })
        return navigateTo('/login')
    }

    const adminRoutes = ['/admin', '/admin/']
    const isAdminRoute = adminRoutes.some(route =>
        to.path === route || to.path.startsWith(route + '/')
    )

    // Vérifications supplémentaires basées sur le rôle de l'utilisateur
    if (isAdminRoute && (!user.value?.role_power || user.value.role_power < 50)) {
        toast.add({
            severity: 'error',
            summary: 'Accès refusé',
            detail: 'Vous n\'avez pas les droits nécessaires pour accéder à cette page',
            life: 3000
        })
        return navigateTo('/')
    }
})