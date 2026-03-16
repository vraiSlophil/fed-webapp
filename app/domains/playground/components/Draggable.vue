<script lang="ts" setup>
import { computed, ref, watch, type PropType } from 'vue';
import { useDropZoneInteraction } from '~/domains/playground/composables/useDropZoneInteraction';

const props = defineProps({
    x: {
        type: Number,
        default: 0,
    },
    y: {
        type: Number,
        default: 0,
    },
    width: {
        type: Number,
    },
    height: {
        type: Number,
    },
    zIndex: {
        type: [Number, String],
        default: 1,
    },
    parent: {
        type: Boolean,
        default: true,
    },
    resizableX: {
        type: Boolean,
        default: false,
    },
    resizableY: {
        type: Boolean,
        default: false,
    },
    draggable: {
        type: Boolean,
        default: true,
    },
    noDragElements: {
        type: Array as PropType<string[]>,
        default: () => ['button', 'a', 'input', 'textarea', 'select', '.no-drag', '[data-no-drag]'],
    },
});

const emit = defineEmits([
    'drag',
    'dragend',
    'dragenter',
    'dragleave',
    'dragover',
    'dragstart',
    'drop',
    'resizeend',
    'update:x',
    'update:y',
    'update:width',
    'update:height',
]);

// Références aux éléments DOM
const draggableElement = ref<HTMLElement | null>(null);
const parentElement = ref<HTMLElement | null>(null);
const resizeHandle = ref<HTMLElement | null>(null);

// États internes
const position = ref({ x: props.x, y: props.y });
const dimensions = ref({ width: props.width, height: props.height });
const isDragging = ref(false);
const isResizing = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const resizeStartPos = ref({ x: 0, y: 0 });
const initialDimensions = ref({ width: 0, height: 0 });

// Synchroniser les props avec les états internes
watch(
    () => props.x,
    (newVal) => {
        position.value.x = newVal;
    },
);
watch(
    () => props.y,
    (newVal) => {
        position.value.y = newVal;
    },
);
watch(
    () => props.width,
    (newVal) => {
        dimensions.value.width = newVal;
    },
);
watch(
    () => props.height,
    (newVal) => {
        dimensions.value.height = newVal;
    },
);

// Styles calculés pour l'élément draggable
const draggableStyles = computed<Record<string, string | number>>(() => {
    return {
        transform: `translate(${position.value.x}px, ${position.value.y}px)`,
        width: !props.width ? 'auto' : `${dimensions.value.width}px`,
        height: !props.height ? 'auto' : `${dimensions.value.height}px`,
        position: 'absolute',
        userSelect: 'none',
        cursor: isDragging.value ? 'grabbing' : 'grab',
        zIndex: isDragging.value || isResizing.value ? '1000' : props.zIndex || '1',
    };
});

const shouldIgnoreDrag = (e: MouseEvent): boolean => {
    const target = e.target as HTMLElement;

    // Vérifier si l'élément cliqué ou l'un de ses parents correspond aux sélecteurs à ignorer
    return props.noDragElements.some((selector) => {
        // Vérifier l'élément lui-même
        if (target.matches(selector)) return true;

        // Vérifier les parents jusqu'au draggable element
        let parent = target.parentElement;
        while (parent && parent !== draggableElement.value) {
            if (parent.matches(selector)) return true;
            parent = parent.parentElement;
        }

        return false;
    });
};

// Gérer le début du drag
const handleDragStart = (e: MouseEvent) => {
    if (!props.draggable) return;
    if (shouldIgnoreDrag(e)) return;

    isDragging.value = true;
    dragOffset.value = {
        x: e.clientX - position.value.x,
        y: e.clientY - position.value.y,
    };

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);

    emit('dragstart', {
        x: position.value.x,
        y: position.value.y,
        width: dimensions.value.width,
        height: dimensions.value.height,
        event: e,
    });
};

// Gérer le drag
const handleDrag = (e: MouseEvent) => {
    if (!isDragging.value) return;

    let newX = e.clientX - dragOffset.value.x;
    let newY = e.clientY - dragOffset.value.y;

    // Limites du parent si nécessaire
    if (props.parent && parentElement.value && draggableElement.value) {
        const parentRect = parentElement.value.getBoundingClientRect();
        const elementRect = draggableElement.value.getBoundingClientRect();

        // Limites horizontales
        newX = Math.max(0, newX);
        newX = Math.min(newX, parentRect.width - elementRect.width);

        // Limites verticales
        newY = Math.max(0, newY);
        newY = Math.min(newY, parentRect.height - elementRect.height);
    }

    position.value = { x: newX, y: newY };

    const { updateMousePosition } = useDropZoneInteraction();
    updateMousePosition(e.clientX, e.clientY);

    emit('drag', {
        x: newX,
        y: newY,
        width: dimensions.value.width,
        height: dimensions.value.height,
        event: e,
    });

    // Émettre les mises à jour pour v-model si nécessaire
    emit('update:x', newX);
    emit('update:y', newY);
};

// Gérer la fin du drag
const handleDragEnd = (e: MouseEvent) => {
    if (!isDragging.value) return;

    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', handleDragEnd);

    isDragging.value = false;

    // Déclencher l'événement dragend natif
    if (draggableElement.value) {
        const dragEndEvent = new DragEvent('dragend', {
            bubbles: true,
            cancelable: true,
        });
        draggableElement.value.dispatchEvent(dragEndEvent);
    }

    emit('dragend', {
        x: position.value.x,
        y: position.value.y,
        width: dimensions.value.width,
        height: dimensions.value.height,
        event: e,
    });
};

// Gérer le début du redimensionnement
const handleResizeStart = (e: MouseEvent) => {
    if (!props.resizableX && !props.resizableY) return;

    e.stopPropagation();
    isResizing.value = true;
    resizeStartPos.value = { x: e.clientX, y: e.clientY };

    // Utiliser la taille réelle de l'élément, pas la valeur logique
    const rect = draggableElement.value?.getBoundingClientRect();
    initialDimensions.value = {
        width: rect?.width ?? dimensions.value.width ?? 0,
        height: rect?.height ?? dimensions.value.height ?? 0,
    };

    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleResizeEnd);
};

// Gérer le redimensionnement
const handleResize = (e: MouseEvent) => {
    if (!isResizing.value) return;

    const deltaX = e.clientX - resizeStartPos.value.x;
    const deltaY = e.clientY - resizeStartPos.value.y;

    let newWidth = initialDimensions.value.width;
    let newHeight = initialDimensions.value.height;

    if (props.resizableX) {
        newWidth = initialDimensions.value.width + deltaX;

        const childElement = draggableElement.value?.firstElementChild as HTMLElement;
        if (childElement) {
            const minWidth = parseFloat(getComputedStyle(childElement).minWidth) || 50;
            newWidth = Math.max(minWidth, newWidth);
        } else {
            newWidth = Math.max(50, newWidth);
        }
    }

    if (props.resizableY) {
        newHeight = Math.max(50, initialDimensions.value.height + deltaY);
    }

    // Limites du parent si nécessaire
    if (props.parent && parentElement.value) {
        const parentRect = parentElement.value.getBoundingClientRect();

        if (props.resizableX) {
            newWidth = Math.min(newWidth, parentRect.width - position.value.x);
        }

        if (props.resizableY) {
            newHeight = Math.min(newHeight, parentRect.height - position.value.y);
        }
    }

    dimensions.value = { width: newWidth, height: newHeight };

    emit('update:width', newWidth);
    emit('update:height', newHeight);
};

// Gérer la fin du redimensionnement
const handleResizeEnd = () => {
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', handleResizeEnd);
    isResizing.value = false;

    emit('resizeend', {
        x: position.value.x,
        y: position.value.y,
        width: dimensions.value.width,
        height: dimensions.value.height,
    });
};

// Initialisation après montage
onMounted(() => {
    if (draggableElement.value) {
        parentElement.value = draggableElement.value.parentElement;
    }
});

// Gestion des événements standards de l'API Drag and Drop
const handleDragOver = (e: DragEvent) => {
    e.preventDefault(); // Nécessaire pour autoriser le drop
    emit('dragover', {
        x: position.value.x,
        y: position.value.y,
        event: e,
    });
};

const handleDragEnter = (e: DragEvent) => {
    emit('dragenter', {
        x: position.value.x,
        y: position.value.y,
        event: e,
    });
};

const handleDragLeave = (e: DragEvent) => {
    emit('dragleave', {
        x: position.value.x,
        y: position.value.y,
        event: e,
    });
};

const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    emit('drop', {
        x: position.value.x,
        y: position.value.y,
        event: e,
    });
};
</script>

<template>
    <div
        ref="draggableElement"
        :style="draggableStyles"
        class="draggable-component touch-none box-border relative h-min w-min group"
        @dragenter="handleDragEnter"
        @dragleave="handleDragLeave"
        @dragover="handleDragOver"
        @drop="handleDrop"
        @mousedown="
            (e) => {
                if (!shouldIgnoreDrag(e)) {
                    e.preventDefault();
                    handleDragStart(e);
                }
            }
        "
    >
        <slot :style="{ pointerEvents: isDragging ? 'none' : 'auto' }" />
        <div
            v-if="resizableX || resizableY"
            ref="resizeHandle"
            :class="{ 'opacity-100': isResizing, 'opacity-0': !isResizing }"
            class="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize opacity-0 group-hover:opacity-100 transition-all duration-200"
            @mousedown.prevent.stop="handleResizeStart"
        >
            <span
                class="material-symbols-rounded h-min w-min rotate-45 origin-center text-black dark:text-white"
            >
                chevron_right
            </span>
        </div>
    </div>
</template>

<style scoped>
.draggable-component {
    touch-action: none;
    box-sizing: border-box;
}

.draggable-component.group {
    min-width: min-content;
    min-height: min-content;
}
</style>
