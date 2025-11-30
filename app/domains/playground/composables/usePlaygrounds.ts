import {ref} from 'vue'
import {useApiFetch} from '~/composables/useApiFetch'
import type {CreatePlaygroundPayload, Playground} from '~/types/playground'
import type {Theme} from '~/types/theme'
import {usePlaygroundThemesPagination} from "~/domains/playground/composables/usePlaygroundThemesPagination";

const playgrounds = ref<Playground[]>([])
const currentPlayground = ref<Playground | null>(null)
const themesPaginationRef = ref<ReturnType<typeof usePlaygroundThemesPagination> | null>(null)

const playgroundThemes = computed<Theme[]>(() => {
    return themesPaginationRef.value?.allThemes ?? []
})

const themesPagination = computed(() => themesPaginationRef.value)

const loading = ref(false)
const error = ref<string | null>(null)

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

    const fetchPlaygroundThemesPage = async (playgroundId: string, page = 1, perPage = 20) => {
        if (!themesPaginationRef.value || themesPaginationRef.value.page !== page) {
            themesPaginationRef.value = usePlaygroundThemesPagination(playgroundId)
        }
        await themesPaginationRef.value!.setPerPage(perPage)
        await themesPaginationRef.value!.loadFirstPage()
    }

    const preloadAllThemesInBackground = async () => {
        if (!themesPaginationRef.value) return
        await themesPaginationRef.value.preloadAllPages()
    }

    const reloadCurrentPlayground = async () => {
        if (!currentPlayground.value || !themesPaginationRef.value) return
        await themesPaginationRef.value.loadFirstPage()
        await themesPaginationRef.value.preloadAllPages()
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
        fetchPlaygroundStats,
        preloadAllThemesInBackground,
        reloadCurrentPlayground
    }
}