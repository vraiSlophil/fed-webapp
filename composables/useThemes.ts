import { useApiFetch } from './useApiFetch'
import type { Theme } from '~/types/themes'

export const useThemes = () => {
    const themes = ref<Theme[]>([])
    const currentTheme = ref<Theme | null>(null)
    const loading = ref(false)

    const fetchThemes = async () => {
        loading.value = true

        try {
            const response = await useApiFetch('/api/themes', {
                method: HttpMethods.GET
            })
            themes.value = response.data.themes

        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || `Erreur  lors de la récupération des thèmes`)
        } finally {
            loading.value = false
        }
    }

    const getTheme = async (id: string) => {
        loading.value = true

        try {
            const response = await useApiFetch(`/api/themes/${id}`, {
                method: HttpMethods.GET
            })
            currentTheme.value = response.data.theme
            return response.data.theme
        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || `Erreur lors de la récupération du thème ${id}`)
        } finally {
            loading.value = false
        }
    }

    const createTheme = async (themeData: { title: string; color: string }) => {
        loading.value = true

        try {
            const response = await useApiFetch('/api/themes', {
                method: HttpMethods.POST,
                body: JSON.stringify(themeData)
            })
            await fetchThemes() // Recharger la liste après création
            return response.data.theme
        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || `Erreur lors de la création du thème`)
        } finally {
            loading.value = false
        }
    }

    const updateTheme = async (id: string, themeData: { title?: string; color?: string }) => {
        loading.value = true

        try {
            const response = await useApiFetch(`/api/themes/${id}`, {
                method: HttpMethods.PUT,
                body: JSON.stringify(themeData)
            })

            // Mettre à jour le thème dans la liste
            const index = themes.value.findIndex(t => t.theme_id === id)
            if (index !== -1) {
                themes.value[index] = response.data.theme
            }

            return response.data.theme
        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || `Erreur lors de la mise à jour du thème ${id}`)
        } finally {
            loading.value = false
        }
    }

    const deleteTheme = async (id: string) => {
        loading.value = true

        try {
            await useApiFetch(`/api/themes/${id}`, {
                method: HttpMethods.DELETE
            })

            // Supprimer le thème de la liste
            themes.value = themes.value.filter(t => t.theme_id !== id)
            return true
        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || `Erreur lors de la suppression du thème ${id}`)
        } finally {
            loading.value = false
        }
    }

    const leaveTheme = async (id: string) => {
        loading.value = true

        try {
            await useApiFetch(`/api/themes/${id}/leave`, {
                method: HttpMethods.POST
            })

            // Supprimer le thème de la liste
            themes.value = themes.value.filter(t => t.theme_id !== id)
            return true
        } catch (error: any) {
            console.error(error.value)
            throw new Error(error.message || `Erreur lors de la sortie du thème ${id}`)
        } finally {
            loading.value = false
        }
    }

    return {
        themes,
        currentTheme,
        loading,
        fetchThemes,
        getTheme,
        createTheme,
        updateTheme,
        deleteTheme,
        leaveTheme
    }
}