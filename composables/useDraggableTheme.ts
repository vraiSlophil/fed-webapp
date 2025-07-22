import type {Theme} from "~/types/themes";

// Variables globales pour être partagées entre toutes les instances
const isDragging = ref(false)
const draggedTheme = ref<Theme | null>(null)

// Démarrer le drag d'un thème
const startDrag = (theme: Theme) => {
    // console.log('Starting drag for theme:', theme.title)
    isDragging.value = true
    draggedTheme.value = theme

    // Montrer la zone de drop quand on commence à draguer
    const {showDropZone} = useDropZoneInteraction()
    showDropZone(true)
}

// Arrêter le drag avec un délai pour permettre au mouseup de se déclencher
const endDrag = () => {
    // console.log('Ending drag for theme:', draggedTheme.value?.title || 'null')


    isDragging.value = false
    // draggedTheme.value = null

    // Cacher la zone de drop et reset les états
    const {showDropZone, resetDropZone} = useDropZoneInteraction()
    showDropZone(false)
    resetDropZone()
}

// Vérifier si on peut dropper sur une zone
const canDrop = (dropZone: string) => {
    // console.log(`canDrop(${dropZone}):`, canDropResult, 'isDragging:', isDragging.value, 'draggedTheme:', draggedTheme.value?.title || 'null')
    return isDragging.value && draggedTheme.value !== null
}

// // NOUVELLE FONCTION : Arrêt immédiat sans délai (pour quand on drop effectivement)
// const endDragImmediate = () => {
//     console.log('Immediate end drag for theme:', draggedTheme.value?.title || 'null')
//     isDragging.value = false
//     draggedTheme.value = null
//
//     const {showDropZone, resetDropZone} = useDropZoneInteraction()
//     showDropZone(false)
//     resetDropZone()
// }

export const useDraggableThemes = () => {
    return {
        isDragging: readonly(isDragging),
        draggedTheme: readonly(draggedTheme),
        startDrag,
        endDrag,
        // endDragImmediate,
        canDrop
    }
}