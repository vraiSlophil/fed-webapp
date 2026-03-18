<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import type { Theme } from '~/types/theme';
import { useDraggableThemes } from '~/domains/playground/composables/useDraggableTheme';
import { useDropZoneInteraction } from '~/domains/playground/composables/useDropZoneInteraction';

const emit = defineEmits(['drop-theme']);

// Composables
const { isDragging, draggedTheme, canDrop } = useDraggableThemes();
const {
    isHovering,
    dropZoneVisible,
    enterDropZone,
    leaveDropZone,
    dropInZone,
    isZoneActive,
    setDropZoneRect,
} = useDropZoneInteraction();

const ZONE_ID = 'storage';
const dropZoneElement = ref<HTMLElement | null>(null);

// Variable locale pour capturer le thème au moment du drop
let themeBeingDropped: Theme | null = null;

// Gérer l'entrée de la souris
const handleMouseEnter = () => {
    // console.log('Mouse enter - canDrop:', canDrop(ZONE_ID), 'isDragging:', isDragging.value)

    if (canDrop(ZONE_ID) && draggedTheme.value) {
        enterDropZone(ZONE_ID, draggedTheme.value);
    }
};

// Gérer la sortie de la souris
const handleMouseLeave = () => {
    // console.log('Mouse leave')
    leaveDropZone(ZONE_ID);
};

// Capturer le thème AVANT qu'il soit supprimé par endDrag()
const captureDroppedTheme = () => {
    if (isZoneActive(ZONE_ID) && draggedTheme.value) {
        themeBeingDropped = draggedTheme.value;
        // console.log('Theme captured for drop:', themeBeingDropped.title)
        return true;
    }
    return false;
};

// Gérer le relâchement (clic up)
const handleMouseUp = () => {
    // console.log('Mouse up - isZoneActive:', isZoneActive(ZONE_ID), 'themeBeingDropped:', themeBeingDropped?.title || 'null')

    // Si on avait capturé un thème pour le drop
    if (themeBeingDropped) {
        const success = dropInZone(ZONE_ID, themeBeingDropped);
        if (success) {
            // console.log('Émission drop-theme:', themeBeingDropped.title)
            emit('drop-theme', themeBeingDropped);
        }
        // Reset
        themeBeingDropped = null;
    }
};

// Fallback pour les événements drag natifs
const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (canDrop(ZONE_ID) && draggedTheme.value) {
        enterDropZone(ZONE_ID, draggedTheme.value);
    }
};

const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    // console.log('Native drop event')

    if (canDrop(ZONE_ID) && draggedTheme.value) {
        const success = dropInZone(ZONE_ID, draggedTheme.value);
        if (success) {
            emit('drop-theme', draggedTheme.value);
        }
    }
};

const handleDragLeave = (event: DragEvent) => {
    // console.log('Native drag leave')
    leaveDropZone(ZONE_ID);
};

// Calculer la visibilité de la zone
const isVisible = computed(() => isDragging.value);

// Mettre à jour le rectangle de la zone quand elle devient visible
watch(
    isVisible,
    (newVal) => {
        if (newVal && dropZoneElement.value) {
            const rect = dropZoneElement.value.getBoundingClientRect();
            setDropZoneRect(rect);
            // console.log('Drop zone became visible, rect:', rect)
        }
    },
    { immediate: true },
);

// NOUVEAU : Watcher pour capturer le thème quand la zone devient active
watch(
    () => isZoneActive(ZONE_ID),
    (newVal) => {
        // console.log('ThemeDropZone - zone active changed:', newVal)

        // Capturer le thème dès qu'on entre dans la zone active
        if (newVal && draggedTheme.value) {
            captureDroppedTheme();
        }
    },
);

// Remettre à jour le rectangle si la zone est redimensionnée
onMounted(() => {
    if (dropZoneElement.value) {
        const resizeObserver = new ResizeObserver(() => {
            if (dropZoneElement.value && isVisible.value) {
                const rect = dropZoneElement.value.getBoundingClientRect();
                setDropZoneRect(rect);
                // console.log('Drop zone resized, new rect:', rect)
            }
        });

        resizeObserver.observe(dropZoneElement.value);

        onUnmounted(() => {
            resizeObserver.disconnect();
        });
    }
});

// Debug watchers
watch(isDragging, (newVal) => {
    // console.log('ThemeDropZone - isDragging changed:', newVal)
});

watch(isHovering, (newVal) => {
    // console.log('ThemeDropZone - isHovering changed:', newVal)
});
</script>

<template>
    <div
        ref="dropZoneElement"
        data-testid="playground-theme-drop-zone"
        class="fixed top-0 right-0 h-full backdrop-blur transition-all duration-200 flex items-center justify-center overflow-hidden cursor-pointer z-40"
        :class="[
            isVisible ? 'w-64' : 'w-0',
            isZoneActive(ZONE_ID) ? 'bg-green-400/30 border-l-2 border-green-400' : 'bg-white/10',
        ]"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @mouseup="handleMouseUp"
        @dragover="handleDragOver"
        @drop="handleDrop"
        @dragleave="handleDragLeave"
    >
        <div class="text-center text-white pointer-events-none select-none">
            <span
                class="material-symbols-rounded text-4xl mb-2 block transition-all duration-200"
                :class="{ 'text-green-400 scale-180': isZoneActive(ZONE_ID) }"
            >
                inventory_2
            </span>
            <p
                class="text-nowrap transition-colors duration-200"
                :class="{ 'text-green-400': isZoneActive(ZONE_ID) }"
            >
                {{ isZoneActive(ZONE_ID) ? 'Relâcher pour ranger' : 'Déposez ici pour ranger' }}
            </p>

            <!-- Debug info -->
            <!--			<div class="mt-4 text-xs opacity-70">-->
            <!--				<div>canDrop: {{ canDrop(ZONE_ID) }}</div>-->
            <!--				<div>isHovering: {{ isHovering }}</div>-->
            <!--				<div>isZoneActive: {{ isZoneActive(ZONE_ID) }}</div>-->
            <!--				<div>draggedTheme: {{ draggedTheme?.title || 'null' }}</div>-->
            <!--				<div>themeBeingDropped: {{ themeBeingDropped?.title || 'null' }}</div>-->
            <!--			</div>-->
        </div>
    </div>
</template>
