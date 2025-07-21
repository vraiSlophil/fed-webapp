import type { Theme } from "~/types/themes";

// Variables globales partagées (singleton)
const isHovering = ref(false)
const dropZoneVisible = ref(false)
const activeDropZone = ref<string | null>(null)

// Gérer l'entrée dans une zone de drop
const enterDropZone = (zoneId: string, draggedTheme?: Theme) => {
  console.log(`Entering drop zone: ${zoneId}`, draggedTheme?.title || 'no theme')
  
  if (draggedTheme) {
    isHovering.value = true
    activeDropZone.value = zoneId
    console.log(`Drop zone ${zoneId} activated`)
  }
}

// Gérer la sortie d'une zone de drop
const leaveDropZone = (zoneId: string) => {
  console.log(`Leaving drop zone: ${zoneId}`)
  
  if (activeDropZone.value === zoneId) {
    isHovering.value = false
    activeDropZone.value = null
    console.log(`Drop zone ${zoneId} deactivated`)
  }
}

// Gérer le drop/relâchement dans une zone
const dropInZone = (zoneId: string, draggedTheme: Theme | null) => {
  console.log(`Drop in zone: ${zoneId}`, draggedTheme?.title || 'no theme')
  
  if (draggedTheme && activeDropZone.value === zoneId) {
    // Reset de l'état après un drop réussi
    isHovering.value = false
    activeDropZone.value = null
    console.log(`Successfully dropped ${draggedTheme.title} in ${zoneId}`)
    return true
  }
  
  return false
}

// Montrer/cacher la zone de drop
const showDropZone = (show: boolean) => {
  dropZoneVisible.value = show
  console.log(`Drop zone visibility: ${show}`)
  
  if (!show) {
    // Reset de tous les états quand on cache la zone
    isHovering.value = false
    activeDropZone.value = null
  }
}

// Vérifier si une zone est active
const isZoneActive = (zoneId: string) => {
  return activeDropZone.value === zoneId && isHovering.value
}

// Reset complet de l'état (utile pour le nettoyage)
const resetDropZone = () => {
  console.log('Resetting all drop zone states')
  isHovering.value = false
  dropZoneVisible.value = false
  activeDropZone.value = null
}

export const useDropZoneInteraction = () => {
  return {
    // États en lecture seule
    isHovering: readonly(isHovering),
    dropZoneVisible: readonly(dropZoneVisible),
    activeDropZone: readonly(activeDropZone),
    
    // Méthodes d'interaction
    enterDropZone,
    leaveDropZone,
    dropInZone,
    showDropZone,
    isZoneActive,
    resetDropZone
  }
}
