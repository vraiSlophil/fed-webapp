<script setup lang="ts">
import type {Theme} from '~/types/themes'

const props = defineProps<{
	theme: Theme
}>()

const emits = defineEmits<{
	(e: 'destroy', theme: Theme): void
	(e: 'position-change', themeId: string, position: { x: number, y: number, width: number, zIndex: number }): void
}>()

const handlePositionChange = (position: { x: number, y: number, width: number, zIndex: number }) => {
	emits('position-change', props.theme.theme_id, position)
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
		@dragend="handlePositionChange({
      x: $event.x,
      y: $event.y,
      width: $event.width,
      zIndex: theme.position?.zIndex || 1
    })"
	>
		<Theme
			:theme="theme"
			@destroy="emits('destroy', $event)"
		/>
	</Draggable>
</template>