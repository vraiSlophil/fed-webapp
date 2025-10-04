import {ref} from 'vue'
import {useApiFetch} from './useApiFetch'
import type {Playground} from '~/types/playground'

export const usePlaygrounds = () => {
    const playgrounds = ref<Playground[]>([])
    const currentPlayground = ref<Playground | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Liste tous les playgrounds
    const fetchPlaygrounds = async () => {
        loading.value = true
        error.value = null
        try {
            const res = await useApiFetch('/playgrounds', {method: 'GET'})
            playgrounds.value = res.data.playgrounds
        } catch (e: any) {
            error.value = e.message || 'Erreur lors du chargement des playgrounds'
        } finally {
            loading.value = false
        }
    }

    // Crée un nouveau playground
    const createPlayground = async (payload: Partial<Playground>) => {
        loading.value = true
        error.value = null
        try {
            const res = await useApiFetch('/playgrounds', {
                method: 'POST',
                body: payload
            })
            return res.data.playground
        } catch (e: any) {
            error.value = e.message || 'Erreur lors de la création'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Détail d’un playground
    const fetchPlayground = async (playgroundId: string) => {
        loading.value = true
        error.value = null
        try {
            const res = await useApiFetch(`/playgrounds/${playgroundId}`, {method: 'GET'})
            currentPlayground.value = res.data.playground
            return res.data
        } catch (e: any) {
            error.value = e.message || 'Erreur lors du chargement'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Met à jour un playground
    const updatePlayground = async (playgroundId: string, payload: Partial<Playground>) => {
        loading.value = true
        error.value = null
        try {
            const res = await useApiFetch(`/playgrounds/${playgroundId}`, {
                method: 'PUT',
                body: payload
            })
            return res.data.playground
        } catch (e: any) {
            error.value = e.message || 'Erreur lors de la mise à jour'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Supprime un playground
    const deletePlayground = async (playgroundId: string) => {
        loading.value = true
        error.value = null
        try {
            await useApiFetch(`/playgrounds/${playgroundId}`, {method: 'DELETE'})
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
            const res = await useApiFetch(`/playgrounds/${playgroundId}/set-default`, {method: 'POST'})
            return res.data.playground
        } catch (e: any) {
            error.value = e.message || 'Erreur lors de la mise par défaut'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Récupère les stats d’un playground
    const fetchPlaygroundStats = async (playgroundId: string) => {
        loading.value = true
        error.value = null
        try {
            const res = await useApiFetch(`/playgrounds/${playgroundId}/stats`, {method: 'GET'})
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
        updatePlayground,
        deletePlayground,
        setDefaultPlayground,
        fetchPlaygroundStats
    }
}