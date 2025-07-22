<script setup lang="ts">
import type {Theme} from '~/types/themes'

const props = defineProps<{
	theme: Theme
}>()

const emits = defineEmits<{
	(e: 'destroy', theme: Theme): void
	(e: 'position-change', themeId: string, position: { x: number, y: number, width: number, zIndex: number }): void
	(e: 'dragstart', theme: Theme): void
	(e: 'dragend', theme: Theme): void
}>()

// Utiliser le composable de drag
const { isDragging, startDrag, endDrag } = useDraggableThemes()

const handlePositionChange = (position: { x: number, y: number, width: number, zIndex: number }) => {
	emits('position-change', props.theme.theme_id, position)
}

const handleDragStart = () => {
	// console.log('isDragging before start :', toRaw(isDragging.value))
	startDrag(props.theme)
	// console.log('isDragging after start :', toRaw(isDragging.value))
	emits('dragstart', props.theme)
}

const handleDragEnd = (event: any) => {
	handlePositionChange({
		x: event.x,
		y: event.y,
		width: event.width,
		zIndex: props.theme.position?.zIndex || 1
	})
	// console.log('isDragging before end :', toRaw(isDragging.value))
	endDrag()
	// console.log('isDragging after end :', toRaw(isDragging.value))
	emits('dragend', props.theme)
}
</script>

<template>
	<Draggable
		:x="theme.position?.x || 0"
		:y="theme.position?.y || 0"
		:width="theme.position?.width || 450"
		:z-index="theme.position?.zIndex || 1"
		:parent="true"
		:draggable="true"
		:resizable-x="true"
		:resizable-y="false"
		:no-drag-elements="['button', 'a', 'input', '[data-no-drag]']"
		@dragstart="handleDragStart"
		@dragend="handleDragEnd"
	>
		<Theme
			:theme="theme"
			@destroy="emits('destroy', $event)"
		/>
	</Draggable>
</template>