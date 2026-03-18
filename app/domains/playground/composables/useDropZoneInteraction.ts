import { readonly, ref } from 'vue';
import type { Theme } from '~/types/theme';

// Variables globales partagées (singleton)
const isHovering = ref(false);
const dropZoneVisible = ref(false);
const activeDropZone = ref<string | null>(null);
const mousePosition = ref({ x: 0, y: 0 });
const dropZoneRect = ref<DOMRect | null>(null);

// Gérer l'entrée dans une zone de drop
const enterDropZone = (zoneId: string, draggedTheme?: Theme) => {
    // console.log(`Entering drop zone: ${zoneId}`, draggedTheme?.title || 'no theme')

    if (draggedTheme) {
        isHovering.value = true;
        activeDropZone.value = zoneId;
        // console.log(`Drop zone ${zoneId} activated`)
    }
};

// Gérer la sortie d'une zone de drop
const leaveDropZone = (zoneId: string) => {
    // console.log(`Leaving drop zone: ${zoneId}`)

    if (activeDropZone.value === zoneId) {
        isHovering.value = false;
        activeDropZone.value = null;
        // console.log(`Drop zone ${zoneId} deactivated`)
    }
};

// Gérer le drop/relâchement dans une zone
const dropInZone = (zoneId: string, draggedTheme: Theme | null) => {
    // console.log(`Drop in zone: ${zoneId}`, draggedTheme?.title || 'no theme')

    if (draggedTheme && activeDropZone.value === zoneId) {
        // Reset de l'état après un drop réussi
        isHovering.value = false;
        activeDropZone.value = null;
        // console.log(`Successfully dropped ${draggedTheme.title} in ${zoneId}`)

        // NOUVEAU : Appeler l'arrêt immédiat du drag après un drop réussi
        // const {endDragImmediate} = useDraggableThemes()
        // endDragImmediate()

        return true;
    }

    return false;
};

// Montrer/cacher la zone de drop
const showDropZone = (show: boolean) => {
    dropZoneVisible.value = show;
    // console.log(`Drop zone visibility: ${show}`)

    if (!show) {
        // Reset de tous les états quand on cache la zone
        isHovering.value = false;
        activeDropZone.value = null;
        mousePosition.value = { x: 0, y: 0 };
        dropZoneRect.value = null;
    }
};

// Vérifier si une zone est active
const isZoneActive = (zoneId: string) => {
    return activeDropZone.value === zoneId && isHovering.value;
};

// Mettre à jour la position de la souris (appelé pendant le drag)
const updateMousePosition = (x: number, y: number) => {
    mousePosition.value = { x, y };

    // Vérifier si la souris est dans la zone de drop
    if (dropZoneRect.value) {
        const isInZone =
            x >= dropZoneRect.value.left &&
            x <= dropZoneRect.value.right &&
            y >= dropZoneRect.value.top &&
            y <= dropZoneRect.value.bottom;

        if (isInZone && !isHovering.value) {
            // console.log('Mouse entered drop zone via position tracking')
            isHovering.value = true;
            activeDropZone.value = 'storage';
        } else if (!isInZone && isHovering.value) {
            // console.log('Mouse left drop zone via position tracking')
            isHovering.value = false;
            activeDropZone.value = null;
        }
    }
};

// Enregistrer le rectangle de la zone de drop
const setDropZoneRect = (rect: DOMRect) => {
    dropZoneRect.value = rect;
    // console.log('Drop zone rect updated:', rect)
};

// Reset complet de l'état (utile pour le nettoyage)
const resetDropZone = () => {
    // console.log('Resetting all drop zone states')
    isHovering.value = false;
    dropZoneVisible.value = false;
    activeDropZone.value = null;
    mousePosition.value = { x: 0, y: 0 };
    dropZoneRect.value = null;
};

export const useDropZoneInteraction = () => {
    return {
        // États en lecture seule
        isHovering: readonly(isHovering),
        dropZoneVisible: readonly(dropZoneVisible),
        activeDropZone: readonly(activeDropZone),
        mousePosition: readonly(mousePosition),

        // Méthodes d'interaction
        enterDropZone,
        leaveDropZone,
        dropInZone,
        showDropZone,
        isZoneActive,
        updateMousePosition,
        setDropZoneRect,
        resetDropZone,
    };
};
