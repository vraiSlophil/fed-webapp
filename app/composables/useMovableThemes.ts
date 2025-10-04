// composables/useMovableThemes.ts
import type {Theme} from "~/types/theme";

export const useMovableThemes = () => {
    const highestZIndex = ref(1)

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
    const applyPositionsToThemes = (themes: Theme[]) => {
        const savedPositions = loadPositionsFromLocalStorage()

        // Mettre à jour les thèmes avec leurs positions sauvegardées
        const updatedThemes = themes.map(theme => {
            const savedPosition = savedPositions[theme.theme_id] || {}
            return {
                ...theme,
                position: savedPosition || theme.position || {
                    x: savedPosition.x || 100,
                    y: savedPosition.y || 100,
                    width: savedPosition.width || 475,
                    zIndex: savedPosition.zIndex || 1
                },
                stored: savedPosition.stored || false
            }
        })

        // Mettre à jour le zIndex le plus élevé
        highestZIndex.value = Math.max(
            ...updatedThemes.map(theme => theme.position?.zIndex || 0),
            highestZIndex.value
        )

        return updatedThemes
    }

    // Gérer les changements de position des thèmes
    const handlePositionChange = (themes: Ref<Theme[]>, themeId: string, position: {
        x: number,
        y: number,
        width: number,
        zIndex: number
    }) => {
        // Incrémenter le z-index
        highestZIndex.value += 1

        // Mettre à jour la position avec le nouveau z-index
        const updatedPosition = {
            ...position,
            zIndex: highestZIndex.value
        }

        // Mettre à jour l'état local
        const themeIndex = themes.value.findIndex(t => t.theme_id === themeId)
        if (themeIndex !== -1) {
            if (!themes.value[themeIndex]) return false
            themes.value[themeIndex].position = updatedPosition
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

            // Sauvegarder dans localStorage
            const position = themes[themeIndex].position || {x: 100, y: 100, width: 475, zIndex: 1}
            savePositionToLocalStorage(themeId, position, stored)

            return true
        }
        return false
    }

    // Méthode pour récupérer les thèmes rangés
    const getStoredThemes = (themes: Theme[]) => {
        // console.log('getStoredThemes in useMovableThemes')
        // console.table(toRaw(themes))
        return themes ? themes.filter(theme => theme.stored === true) : []
    }

    // Méthode pour récupérer les thèmes non rangés (visibles)
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