import { HttpMethods } from '~/utils/httpMethods'
import type {ThemeStats} from "~/types/theme";

export const useThemeStats = () => {
    const stats = ref<ThemeStats | null>(null)
    const loading = ref(false)

    const fetchThemeStats = async (themeId: string) => {
        loading.value = true

        try {
            const response = await useApiFetch(`/api/themes/${themeId}/stats`, {
                method: HttpMethods.GET
            }) as { data: ThemeStats }
            
            stats.value = response.data
            return response.data
        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || 'Erreur lors de la récupération des statistiques du thème');
        } finally {
            loading.value = false
        }
    }

    return {
        stats,
        loading,
        fetchThemeStats
    }
}
