// composables/useThemes.ts
import { ref, reactive } from 'vue'
import { useApiFetch } from './useApiFetch'
import type { Theme } from '~/types/themes'

export const useThemes = () => {
    const themes = ref<Theme[]>([])
    const currentTheme = ref<Theme | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchThemes = async () => {
        loading.value = true
        error.value = null

        try {
            const response = await useApiFetch('/api/themes', {
                method: HttpMethods.GET
            })
            themes.value = response.data.themes
        } catch (err: any) {
            error.value = err.message || 'Erreur lors du chargement des thèmes'
            console.error(error.value)
        } finally {
            loading.value = false
        }
    }

    const getTheme = async (id: string) => {
        loading.value = true
        error.value = null

        try {
            const response = await useApiFetch(`/api/themes/${id}`, {
                method: HttpMethods.GET
            })
            currentTheme.value = response.data.theme
            return response.data.theme
        } catch (err: any) {
            error.value = err.message || `Erreur lors du chargement du thème ${id}`
            console.error(error.value)
            return null
        } finally {
            loading.value = false
        }
    }

    const createTheme = async (themeData: { title: string; color: string }) => {
        loading.value = true
        error.value = null

        try {
            const response = await useApiFetch('/api/themes', {
                method: HttpMethods.POST,
                body: JSON.stringify(themeData)
            })
            await fetchThemes() // Recharger la liste après création
            return response.data.theme
        } catch (err: any) {
            error.value = err.message || 'Erreur lors de la création du thème'
            console.error(error.value)
            return null
        } finally {
            loading.value = false
        }
    }

    const updateTheme = async (id: string, themeData: { title?: string; color?: string }) => {
        loading.value = true
        error.value = null

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
        } catch (err: any) {
            error.value = err.message || `Erreur lors de la mise à jour du thème ${id}`
            console.error(error.value)
            return null
        } finally {
            loading.value = false
        }
    }

    const deleteTheme = async (id: string) => {
        loading.value = true
        error.value = null

        try {
            await useApiFetch(`/api/themes/${id}`, {
                method: HttpMethods.DELETE
            })

            // Supprimer le thème de la liste
            themes.value = themes.value.filter(t => t.theme_id !== id)
            return true
        } catch (err: any) {
            error.value = err.message || `Erreur lors de la suppression du thème ${id}`
            console.error(error.value)
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        themes,
        currentTheme,
        loading,
        error,
        fetchThemes,
        getTheme,
        createTheme,
        updateTheme,
        deleteTheme
    }
}