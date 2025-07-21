<script setup lang="ts">
const emit = defineEmits(['drop-theme'])

// Composables
const { isDragging, draggedTheme, canDrop } = useDraggableThemes()
const {
	isHovering,
	dropZoneVisible,
	enterDropZone,
	leaveDropZone,
	dropInZone,
	isZoneActive
} = useDropZoneInteraction()

const ZONE_ID = 'storage'

// Gérer l'entrée de la souris
const handleMouseEnter = () => {
	console.log('Mouse enter - canDrop:', canDrop(ZONE_ID), 'isDragging:', isDragging.value)

	if (canDrop(ZONE_ID) && draggedTheme.value) {
		enterDropZone(ZONE_ID, draggedTheme.value)
	}
}

// Gérer la sortie de la souris
const handleMouseLeave = () => {
	console.log('Mouse leave')
	leaveDropZone(ZONE_ID)
}

// Gérer le relâchement (clic up)
const handleMouseUp = () => {
	console.log('Mouse up - canDrop:', canDrop(ZONE_ID), 'draggedTheme:', draggedTheme.value?.title || 'null')

	if (canDrop(ZONE_ID) && draggedTheme.value) {
		const success = dropInZone(ZONE_ID, draggedTheme.value)
		if (success) {
			console.log('Émission drop-theme:', draggedTheme.value.title)
			emit('drop-theme', draggedTheme.value)
		}
	}
}

// Fallback pour les événements drag natifs
const handleDragOver = (event: DragEvent) => {
	event.preventDefault()
	if (canDrop(ZONE_ID) && draggedTheme.value) {
		enterDropZone(ZONE_ID, draggedTheme.value)
	}
}

const handleDrop = (event: DragEvent) => {
	event.preventDefault()
	console.log('Native drop event')

	if (canDrop(ZONE_ID) && draggedTheme.value) {
		const success = dropInZone(ZONE_ID, draggedTheme.value)
		if (success) {
			emit('drop-theme', draggedTheme.value)
		}
	}
}

const handleDragLeave = (event: DragEvent) => {
	console.log('Native drag leave')
	leaveDropZone(ZONE_ID)
}

// Calculer la visibilité de la zone
const isVisible = computed(() => isDragging.value)

// Debug watchers
watch(isDragging, (newVal) => {
	console.log('ThemeDropZone - isDragging changed:', newVal)
})

watch(isHovering, (newVal) => {
	console.log('ThemeDropZone - isHovering changed:', newVal)
})

watch(() => isZoneActive(ZONE_ID), (newVal) => {
	console.log('ThemeDropZone - zone active changed:', newVal)
})
</script>

<template>
	<div
		class="fixed top-0 right-0 h-full w-64 bg-black/20 backdrop-blur-sm transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer z-40"
		:class="{
      'w-64': isVisible,
      'bg-green-400/30 border-l-4 border-green-400': isZoneActive(ZONE_ID)
    }"
		@mouseenter="handleMouseEnter"
		@mouseleave="handleMouseLeave"
		@mouseup="handleMouseUp"
		@dragover="handleDragOver"
		@drop="handleDrop"
		@dragleave="handleDragLeave"
	>
		<div
			v-if="isVisible"
			class="text-center text-white pointer-events-none select-none"
		>
      <span
		  class="material-symbols-rounded text-4xl mb-2 block transition-colors duration-200"
		  :class="{ 'text-green-400 scale-110': isZoneActive(ZONE_ID) }"
	  >
        inventory_2
      </span>
			<p class="text-nowrap transition-colors duration-200" :class="{ 'text-green-400': isZoneActive(ZONE_ID) }">
				{{ isZoneActive(ZONE_ID) ? 'Relâcher pour ranger' : 'Déposez ici pour ranger' }}
			</p>

			<!-- Debug info -->
			<div class="mt-4 text-xs opacity-70">
				<div>canDrop: {{ canDrop(ZONE_ID) }}</div>
				<div>isHovering: {{ isHovering }}</div>
				<div>isZoneActive: {{ isZoneActive(ZONE_ID) }}</div>
				<div>draggedTheme: {{ draggedTheme?.title || 'null' }}</div>
			</div>
		</div>
	</div>
</template>