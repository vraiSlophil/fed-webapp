// composables/useMovableThemes.ts
import type {Theme} from "~/types/themes";

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
  const savePositionToLocalStorage = (themeId: string, position: { x: number, y: number, width: number, zIndex: number }) => {
    try {
      const storedPositions = localStorage.getItem('theme_positions')
      const positions = storedPositions ? JSON.parse(storedPositions) : {}

      positions[themeId] = { ...position, zIndex: position.zIndex }
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
      return {
        ...theme,
        position: savedPositions[theme.theme_id] || theme.position || {
          x: 100,
          y: 100,
          width: 450,
          zIndex: 1
        }
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
  const handlePositionChange = (themes: Ref<Theme[]>, themeId: string, position: { x: number, y: number, width: number, zIndex: number }) => {
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
      themes.value[themeIndex].position = updatedPosition
    }

    // Sauvegarder dans localStorage
    savePositionToLocalStorage(themeId, updatedPosition)

    return updatedPosition
  }

  return {
    highestZIndex,
    loadPositionsFromLocalStorage,
    savePositionToLocalStorage,
    applyPositionsToThemes,
    handlePositionChange
  }
}