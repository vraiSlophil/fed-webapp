import { useApiFetch } from './useApiFetch'
import type { ThemeStats } from '~/types/stats'
import { HttpMethods } from '~/utils/httpMethods'

export const useThemeStats = () => {
    const stats = ref<ThemeStats | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchThemeStats = async (themeId: string) => {
        loading.value = true
        error.value = null

        try {
            const response = await useApiFetch(`/api/themes/${themeId}/stats`, {
                method: HttpMethods.GET
            }) as { data: ThemeStats }
            
            stats.value = response.data
            return response.data
        } catch (err: any) {
            error.value = err.message || `Erreur lors du chargement des statistiques du thème ${themeId}`
            console.error(error.value)
            return null
        } finally {
            loading.value = false
        }
    }

    return {
        stats,
        loading,
        error,
        fetchThemeStats
    }
}
