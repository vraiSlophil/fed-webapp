import {ref} from 'vue'
import {useApiFetch} from '~/composables/useApiFetch'
import type {CreatePlaygroundPayload, Playground, PlaygroundCompleteData} from '~/types/playground'

const playgrounds = ref<Playground[]>([])
const currentPlayground = ref<PlaygroundCompleteData | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export const usePlaygrounds = () => {

    // Liste tous les playgrounds
    const fetchPlaygrounds = async () => {
        loading.value = true
        error.value = null
        try {
            const res = await useApiFetch('/api/playgrounds', {method: 'GET'})
            playgrounds.value = res.data.playgrounds

            // const defaultPlayground: Playground | undefined = playgrounds.value.find(p => p.is_default)
            // if (!currentPlayground.value && defaultPlayground) {
            //     await fetchPlayground(defaultPlayground.playground_id)
            // }
        } catch (e: any) {
            error.value = e.message || 'Erreur lors du chargement des playgrounds'
        } finally {
            loading.value = false
        }
    }

    // Crée un nouveau playground
    const createPlayground = async (payload: CreatePlaygroundPayload) => {
        loading.value = true
        error.value = null
        try {
            const res = await useApiFetch('/api/playgrounds', {
                method: 'POST',
                body: JSON.stringify(payload)
            })
            return res.data.playground
        } catch (e: any) {
            error.value = e.message || 'Erreur lors de la création'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Détail d'un playground avec toutes ses données
    const fetchPlayground = async (playgroundId: string) => {
        loading.value = true
        error.value = null
        try {
            const res = await useApiFetch(`/api/playgrounds/${playgroundId}`, {method: 'GET'})
            currentPlayground.value = res.data
            return res.data
        } catch (e: any) {
            error.value = e.message || 'Erreur lors du chargement'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Nouvelle fonction : charge un playground par id OU par slug
    const fetchPlaygroundByIdOrSlug = async (idOrSlug: string) => {
        // On tente d'abord par id directement
        try {
            return await fetchPlayground(idOrSlug)
        } catch (e: any) {
            // Si l'appel direct échoue, on tente de résoudre via le slug
            // On recharge la liste si nécessaire
            if (!playgrounds.value.length) {
                await fetchPlaygrounds()
            }

            const found = playgrounds.value.find(p => p.slug === idOrSlug)
            if (!found) {
                error.value = 'Playground introuvable'
                throw new Error('Playground introuvable')
            }

            return await fetchPlayground(found.playground_id)
        }
    }

    // Met à jour un playground
    const updatePlayground = async (playgroundId: string, payload: Partial<Playground>) => {
        loading.value = true
        error.value = null
        try {
            const res = await useApiFetch(`/api/playgrounds/${playgroundId}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            })
            if (currentPlayground.value) {
                currentPlayground.value.playground = res.data.playground
            }
            return res.data.playground
        } catch (e: any) {
            error.value = e.message || 'Erreur lors de la mise à jour'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Met à jour un thème dans le playground courant
    const updateThemeInPlayground = (themeId: string, updates: Partial<any>) => {
        if (!currentPlayground.value?.themes) return

        const themeIndex = currentPlayground.value.themes.findIndex((t: any) => t.theme_id === themeId)
        if (themeIndex !== -1) {
            currentPlayground.value.themes[themeIndex] = {
                ...currentPlayground.value.themes[themeIndex],
                ...updates
            }
        }
    }

    // Supprime un playground
    const deletePlayground = async (playgroundId: string) => {
        loading.value = true
        error.value = null
        try {
            await useApiFetch(`/api/playgrounds/${playgroundId}`, {method: 'DELETE'})
        } catch (e: any) {
            error.value = e.message || 'Erreur lors de la suppression'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Définit un playground comme par défaut
    const setDefaultPlayground = async (playgroundId: string) => {
        loading.value = true
        error.value = null
        try {
            const res = await useApiFetch(`/api/playgrounds/${playgroundId}/set-default`, {method: 'POST'})
            return res.data.playground
        } catch (e: any) {
            error.value = e.message || 'Erreur lors de la mise par défaut'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Récupère les stats d'un playground
    const fetchPlaygroundStats = async (playgroundId: string) => {
        loading.value = true
        error.value = null
        try {
            const res = await useApiFetch(`/api/playgrounds/${playgroundId}/stats`, {method: 'GET'})
            return res.data
        } catch (e: any) {
            error.value = e.message || 'Erreur lors du chargement des stats'
            throw e
        } finally {
            loading.value = false
        }
    }

    return {
        playgrounds,
        currentPlayground,
        loading,
        error,
        fetchPlaygrounds,
        createPlayground,
        fetchPlayground,
        fetchPlaygroundByIdOrSlug,
        updatePlayground,
        updateThemeInPlayground,
        deletePlayground,
        setDefaultPlayground,
        fetchPlaygroundStats
    }
}