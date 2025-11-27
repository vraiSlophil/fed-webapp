import {ref} from 'vue'
import {useApiFetch} from '~/composables/useApiFetch'
import type {CreatePlaygroundPayload, Playground} from '~/types/playground'
import type {Theme} from '~/types/theme'
import type {Pagination} from '~/types/pagination'

const playgrounds = ref<Playground[]>([])
const currentPlayground = ref<Playground | null>(null)
const playgroundThemes = ref<Theme[]>([])
const themesPagination = ref<Pagination | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Détection simple d’un UUID v4 (ou format UUID générique)
const isUuid = (value: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(value)
}

export const usePlaygrounds = () => {

    // Liste tous les playgrounds
    const fetchPlaygrounds = async () => {
        loading.value = true
        error.value = null
        try {
            const res = await useApiFetch('/api/playgrounds', {method: 'GET'})
            playgrounds.value = res.data.playgrounds
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

    const fetchPlaygroundMetaById = async (playgroundId: string) => {
        loading.value = true
        error.value = null
        try {
            const res = await useApiFetch(`/api/playgrounds/${playgroundId}`, {method: 'GET'})
            currentPlayground.value = res.data.playground
            return currentPlayground.value
        } catch (e: any) {
            error.value = e.message || 'Erreur lors du chargement du playground'
            throw e
        } finally {
            loading.value = false
        }
    }

    const fetchPlaygroundMetaBySlug = async (slug: string) => {
        loading.value = true
        error.value = null
        try {
            const res = await useApiFetch(`/api/playgrounds/by-slug/${slug}`, {method: 'GET'})
            currentPlayground.value = res.data.playground
            return currentPlayground.value
        } catch (e: any) {
            error.value = e.message || 'Erreur lors du chargement du playground'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Résolution méta avec logique: UUID -> route id, sinon slug; fallback sur l’autre en cas d’échec
    const fetchPlaygroundMetaByIdOrSlug = async (idOrSlug: string) => {
        const tryIdFirst = isUuid(idOrSlug)

        const attempts = tryIdFirst
            ? [() => fetchPlaygroundMetaById(idOrSlug), () => fetchPlaygroundMetaBySlug(idOrSlug)]
            : [() => fetchPlaygroundMetaBySlug(idOrSlug), () => fetchPlaygroundMetaById(idOrSlug)]

        for (const attempt of attempts) {
            try {
                return await attempt()
            } catch (e) {
                // on essaie l’autre option
            }
        }

        throw new Error('Playground introuvable')
    }

    // Thèmes: doivent toujours être chargés par UUID playgroundId
    const fetchPlaygroundThemesPage = async (playgroundId: string, page = 1, perPage = 20) => {
        loading.value = true
        error.value = null
        try {
            const res = await useApiFetch(`/api/playgrounds/${playgroundId}/themes?page=${page}&per_page=${perPage}`, {
                method: 'GET'
            })

            const {themes, pagination} = res.data as {themes: Theme[]; pagination: Pagination}

            if (page === 1) {
                playgroundThemes.value = themes
            } else {
                playgroundThemes.value = [...playgroundThemes.value, ...themes]
            }

            themesPagination.value = pagination
            return {themes, pagination}
        } catch (e: any) {
            error.value = e.message || 'Erreur lors du chargement des thèmes'
            throw e
        } finally {
            loading.value = false
        }
    }

    const updatePlayground = async (playgroundId: string, payload: Partial<Playground>) => {
        loading.value = true
        error.value = null
        try {
            const res = await useApiFetch(`/api/playgrounds/${playgroundId}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            })
            if (currentPlayground.value) {
                currentPlayground.value = res.data.playground
            }
            return res.data.playground
        } catch (e: any) {
            error.value = e.message || 'Erreur lors de la mise à jour'
            throw e
        } finally {
            loading.value = false
        }
    }

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
        playgroundThemes,
        themesPagination,
        loading,
        error,
        fetchPlaygrounds,
        createPlayground,
        fetchPlaygroundMetaById,
        fetchPlaygroundMetaBySlug,
        fetchPlaygroundMetaByIdOrSlug,
        fetchPlaygroundThemesPage,
        updatePlayground,
        deletePlayground,
        setDefaultPlayground,
        fetchPlaygroundStats
    }
}