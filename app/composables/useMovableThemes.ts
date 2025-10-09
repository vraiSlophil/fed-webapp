import type {Theme} from "~/types/theme";

export const useMovableThemes = () => {
    const highestZIndex = ref(1)

    // Récupérer la ref partagée depuis usePlaygrounds
    const {currentPlayground} = usePlaygrounds()

    // Fonction pour charger les positions depuis localStorage
    const loadPositionsFromLocalStorage = () => {
        try {
            const storedPositions = localStorage.getItem('theme_positions')
            if (!storedPositions) return {}
            return JSON.parse(storedPositions)
        } catch (error) {
            console.error('Erreur lors du chargement des positions:', error)
            return {}
        }
    }

    // Fonction pour sauvegarder la position dans localStorage
    const savePositionToLocalStorage = (themeId: string, position: {
        x: number,
        y: number,
        width: number,
        zIndex: number
    }, stored: boolean = false) => {
        try {
            const storedPositions = localStorage.getItem('theme_positions')
            const positions = storedPositions ? JSON.parse(storedPositions) : {}

            positions[themeId] = {...position, zIndex: position.zIndex, stored}
            localStorage.setItem('theme_positions', JSON.stringify(positions))
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la position:', error)
        }
    }

    // Appliquer les positions sauvegardées aux thèmes
    const applyPositionsToThemes = () => {
        if (!currentPlayground.value?.themes) return

        const savedPositions = loadPositionsFromLocalStorage()

        currentPlayground.value.themes = currentPlayground.value.themes.map((theme: Theme) => {
            const savedPosition = savedPositions[theme.theme_id]
            return {
                ...theme,
                position: savedPosition ? {
                    x: savedPosition.x,
                    y: savedPosition.y,
                    width: savedPosition.width,
                    zIndex: savedPosition.zIndex
                } : (theme.position || {
                    x: 100,
                    y: 100,
                    width: 475,
                    zIndex: 1
                }),
                stored: savedPosition?.stored || false
            }
        })

        highestZIndex.value = Math.max(
            ...currentPlayground.value.themes.map((theme: Theme) => theme.position?.zIndex || 0),
            1
        )
    }

    const handlePositionChange = (themeId: string, position: {
        x: number,
        y: number,
        width: number,
        zIndex: number
    }) => {
        if (!currentPlayground.value?.themes) return false

        // Incrémenter le z-index
        highestZIndex.value += 1

        // Mettre à jour la position avec le nouveau z-index
        const updatedPosition = {
            ...position,
            zIndex: highestZIndex.value
        }

        // Mettre à jour directement dans la ref partagée
        const themeIndex = currentPlayground.value.themes.findIndex((t: Theme) => t.theme_id === themeId)
        if (themeIndex !== -1) {
            currentPlayground.value.themes[themeIndex].position = updatedPosition
        }

        // Sauvegarder dans localStorage
        savePositionToLocalStorage(themeId, updatedPosition)

        return updatedPosition
    }

    const setThemeStored = (themes: Theme[], themeId: string, stored: boolean) => {
        const themeIndex = themes.findIndex(t => t.theme_id === themeId)
        if (themeIndex !== -1) {
            if (!themes[themeIndex]) return false
            // Mettre à jour l'état local
            themes[themeIndex].stored = stored

            const position = themes[themeIndex].position || {x: 100, y: 100, width: 475, zIndex: 1}
            savePositionToLocalStorage(themeId, position, stored)

            return true
        }
        return false
    }

    const getStoredThemes = (themes: Theme[]) => {
        return themes ? themes.filter(theme => theme.stored === true) : []
    }

    const getVisibleThemes = (themes: Theme[]) => {
        return themes ? themes.filter(theme => !theme.stored) : []
    }

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