import {nextTick, ref, watch} from 'vue'
import type {Theme} from '~/types/theme'
import {usePlaygrounds} from '~/domains/playground/composables/usePlaygrounds'

export const useMovableThemes = () => {
    const highestZIndex = ref(1)
    const {playgroundThemes} = usePlaygrounds()

    const loadPositionsFromLocalStorage = () => {
        try {
            const storedPositions = localStorage.getItem('theme_positions')
            return storedPositions ? JSON.parse(storedPositions) : {}
        } catch (error) {
            console.error('Erreur lors du chargement des positions:', error)
            return {}
        }
    }

    const savePositionToLocalStorage = (
        themeId: string,
        position: { x: number; y: number; width: number; zIndex: number },
        stored = false
    ) => {
        try {
            const storedPositions = localStorage.getItem('theme_positions')
            const positions = storedPositions ? JSON.parse(storedPositions) : {}
            positions[themeId] = {...position, stored}
            localStorage.setItem('theme_positions', JSON.stringify(positions))
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la position:', error)
        }
    }

    const applyPositionsToThemes = () => {
        const themes = playgroundThemes.value
        if (!themes?.length) return

        const savedPositions = loadPositionsFromLocalStorage()

        themes.forEach((theme: Theme) => {
            const saved = savedPositions[theme.theme_id]
            theme.position = saved
                ? {x: saved.x, y: saved.y, width: saved.width, zIndex: saved.zIndex}
                : theme.position || {x: 100, y: 100, width: 475, zIndex: 1}
            theme.stored = saved?.stored ?? theme.stored ?? false
        })

        highestZIndex.value = Math.max(
            ...themes.map((theme: Theme) => theme.position?.zIndex || 0),
            1
        )
    }

    const applyPositionsToTheme = (id: string) => {
        const themes = playgroundThemes.value
        if (!themes?.length) return

        const savedPositions = loadPositionsFromLocalStorage()
        const theme = themes.find((t: Theme) => t.theme_id === id)
        if (!theme) return

        const saved = savedPositions[theme.theme_id]
        theme.position = saved
            ? {x: saved.x, y: saved.y, width: saved.width, zIndex: saved.zIndex}
            : theme.position || {x: 100, y: 100, width: 475, zIndex: 1}
        theme.stored = saved?.stored ?? theme.stored ?? false

        highestZIndex.value = Math.max(
            ...themes.map((theme: Theme) => theme.position?.zIndex || 0),
            1
        )
    }

    const handlePositionChange = (
        themeId: string,
        position: { x: number; y: number; width: number; zIndex: number }
    ) => {
        const themes = playgroundThemes.value
        if (!themes?.length) return false

        highestZIndex.value += 1
        const updatedPosition = {...position, zIndex: highestZIndex.value}

        const theme = themes.find((t: Theme) => t.theme_id === themeId)
        if (!theme) return false

        theme.position = updatedPosition
        savePositionToLocalStorage(themeId, updatedPosition)

        return updatedPosition
    }

    const setThemeStored = (themes: Theme[], themeId: string, stored: boolean) => {
        const theme = themes?.find(t => t.theme_id === themeId)
        if (!theme) return false

        theme.stored = stored
        const position = theme.position || {x: 100, y: 100, width: 475, zIndex: 1}
        savePositionToLocalStorage(themeId, position, stored)
        return true
    }

    const getStoredThemes = (themes: Theme[]) => themes?.filter(theme => theme.stored) ?? []
    const getVisibleThemes = (themes: Theme[]) => themes?.filter(theme => !theme.stored) ?? []

    watch(
        () =>
            playgroundThemes.value?.map(theme => ({
                id: theme.theme_id,
                updatedAt: theme.updated_at ?? null
            })),
        async (newVal, oldVal) => {
            if (!newVal || newVal === oldVal) return
            await nextTick()
            applyPositionsToThemes()
        },
        {immediate: true, deep: true}
    )

    return {
        highestZIndex,
        loadPositionsFromLocalStorage,
        savePositionToLocalStorage,
        applyPositionsToThemes,
        handlePositionChange,
        setThemeStored,
        getStoredThemes,
        getVisibleThemes
    }
}