<script setup lang="ts">

const props = defineProps({
	x: {
		type: Number,
		default: 0
	},
	y: {
		type: Number,
		default: 0
	},
	width: {
		type: Number
	},
	height: {
		type: Number
	},
	zIndex: {
		type: [Number, String],
		default: 1
	},
	parent: {
		type: Boolean,
		default: true
	},
	resizableX: {
		type: Boolean,
		default: false
	},
	resizableY: {
		type: Boolean,
		default: false
	},
	draggable: {
		type: Boolean,
		default: true
	},
	noDragElements: {
		type: Array as PropType<string[]>,
		default: () => ['button', 'a', 'input', 'textarea', 'select', '.no-drag', '[data-no-drag]']
	}
})

const emit = defineEmits([
	'drag',
	'dragend',
	'dragenter',
	'dragleave',
	'dragover',
	'dragstart',
	'drop',
	'update:x',
	'update:y',
	'update:width',
	'update:height'
])

// Références aux éléments DOM
const draggableElement = ref<HTMLElement | null>(null)
const parentElement = ref<HTMLElement | null>(null)
const resizeHandle = ref<HTMLElement | null>(null)

// États internes
const position = ref({x: props.x, y: props.y})
const dimensions = ref({width: props.width, height: props.height})
const isDragging = ref(false)
const isResizing = ref(false)
const dragOffset = ref({x: 0, y: 0})
const resizeStartPos = ref({x: 0, y: 0})
const initialDimensions = ref({width: 0, height: 0})

// Synchroniser les props avec les états internes
watch(() => props.x, (newVal) => {
	position.value.x = newVal
})
watch(() => props.y, (newVal) => {
	position.value.y = newVal
})
watch(() => props.width, (newVal) => {
	dimensions.value.width = newVal
})
watch(() => props.height, (newVal) => {
	dimensions.value.height = newVal
})

// Styles calculés pour l'élément draggable
const draggableStyles = computed(() => {
	return {
		transform: `translate(${position.value.x}px, ${position.value.y}px)`,
		width: !props.width ? 'auto' : `${dimensions.value.width}px`,
		height: !props.height ? 'auto' : `${dimensions.value.height}px`,
		position: 'absolute',
		userSelect: 'none',
		cursor: isDragging.value ? 'grabbing' : 'grab',
		zIndex: isDragging.value || isResizing.value ? '1000' : (props.zIndex || '1'),
	}
})

const shouldIgnoreDrag = (e: MouseEvent): boolean => {
	const target = e.target as HTMLElement

	// Vérifier si l'élément cliqué ou l'un de ses parents correspond aux sélecteurs à ignorer
	return props.noDragElements.some(selector => {
		// Vérifier l'élément lui-même
		if (target.matches(selector)) return true

		// Vérifier les parents jusqu'au draggable element
		let parent = target.parentElement
		while (parent && parent !== draggableElement.value) {
			if (parent.matches(selector)) return true
			parent = parent.parentElement
		}

		return false
	})
}

// Gérer le début du drag
const handleDragStart = (e: MouseEvent) => {
	if (!props.draggable) return

	if (shouldIgnoreDrag(e)) return

	isDragging.value = true
	dragOffset.value = {
		x: e.clientX - position.value.x,
		y: e.clientY - position.value.y
	}

	document.addEventListener('mousemove', handleDrag)
	document.addEventListener('mouseup', handleDragEnd)

	emit('dragstart', {
		x: position.value.x,
		y: position.value.y,
		width: dimensions.value.width,
		height: dimensions.value.height,
		event: e
	})
}

// Gérer le drag
const handleDrag = (e: MouseEvent) => {
	if (!isDragging.value) return

	let newX = e.clientX - dragOffset.value.x
	let newY = e.clientY - dragOffset.value.y

	// Limites du parent si nécessaire
	if (props.parent && parentElement.value && draggableElement.value) {
		const parentRect = parentElement.value.getBoundingClientRect()
		const elementRect = draggableElement.value.getBoundingClientRect()

		// Limites horizontales
		newX = Math.max(0, newX)
		newX = Math.min(newX, parentRect.width - elementRect.width)

		// Limites verticales
		newY = Math.max(0, newY)
		newY = Math.min(newY, parentRect.height - elementRect.height)
	}

	position.value = {x: newX, y: newY}

	emit('drag', {
		x: newX,
		y: newY,
		width: dimensions.value.width,
		height: dimensions.value.height,
		event: e
	})

	// Émettre les mises à jour pour v-model si nécessaire
	emit('update:x', newX)
	emit('update:y', newY)
}

// Gérer la fin du drag
const handleDragEnd = (e: MouseEvent) => {
	if (!isDragging.value) return
	if (shouldIgnoreDrag(e)) return

	document.removeEventListener('mousemove', handleDrag)
	document.removeEventListener('mouseup', handleDragEnd)

	isDragging.value = false

	emit('dragend', {
		x: position.value.x,
		y: position.value.y,
		width: dimensions.value.width,
		height: dimensions.value.height,
		event: e
	})
}

// Gérer le début du redimensionnement
const handleResizeStart = (e: MouseEvent) => {
	if (!props.resizableX && !props.resizableY) return

	e.stopPropagation()
	isResizing.value = true
	resizeStartPos.value = {x: e.clientX, y: e.clientY}
	initialDimensions.value = {
		width: dimensions.value.width ?? 0,
		height: dimensions.value.height ?? 0
	}

	document.addEventListener('mousemove', handleResize)
	document.addEventListener('mouseup', handleResizeEnd)
}

// Gérer le redimensionnement
const handleResize = (e: MouseEvent) => {
	if (!isResizing.value) return

	const deltaX = e.clientX - resizeStartPos.value.x
	const deltaY = e.clientY - resizeStartPos.value.y

	let newWidth = initialDimensions.value.width
	let newHeight = initialDimensions.value.height

	if (props.resizableX) {
		newWidth = Math.max(50, initialDimensions.value.width + deltaX)
	}

	if (props.resizableY) {
		newHeight = Math.max(50, initialDimensions.value.height + deltaY)
	}

	// Limites du parent si nécessaire
	if (props.parent && parentElement.value) {
		const parentRect = parentElement.value.getBoundingClientRect()

		if (props.resizableX) {
			newWidth = Math.min(newWidth, parentRect.width - position.value.x)
		}

		if (props.resizableY) {
			newHeight = Math.min(newHeight, parentRect.height - position.value.y)
		}
	}

	dimensions.value = {width: newWidth, height: newHeight}

	emit('update:width', newWidth)
	emit('update:height', newHeight)
}

// Gérer la fin du redimensionnement
const handleResizeEnd = () => {
	document.removeEventListener('mousemove', handleResize)
	document.removeEventListener('mouseup', handleResizeEnd)
	isResizing.value = false
}

// Initialisation après montage
onMounted(() => {
	if (draggableElement.value) {
		parentElement.value = draggableElement.value.parentElement
	}
})

// Gestion des événements standards de l'API Drag and Drop
const handleDragOver = (e: DragEvent) => {
	e.preventDefault() // Nécessaire pour autoriser le drop
	emit('dragover', {
		x: position.value.x,
		y: position.value.y,
		event: e
	})
}

const handleDragEnter = (e: DragEvent) => {
	emit('dragenter', {
		x: position.value.x,
		y: position.value.y,
		event: e
	})
}

const handleDragLeave = (e: DragEvent) => {
	emit('dragleave', {
		x: position.value.x,
		y: position.value.y,
		event: e
	})
}

const handleDrop = (e: DragEvent) => {
	e.preventDefault()
	emit('drop', {
		x: position.value.x,
		y: position.value.y,
		event: e
	})
}
</script>

<template>
	<div
		ref="draggableElement"
		:style="draggableStyles"
		@mousedown="(e) => {
			if (!shouldIgnoreDrag(e)) {
				e.preventDefault();
				handleDragStart(e);
			}
		}"
		@dragover="handleDragOver"
		@dragenter="handleDragEnter"
		@dragleave="handleDragLeave"
		@drop="handleDrop"
		class="draggable-component touch-none box-border relative h-min w-min group"
	>
		<slot></slot>
		<div
			v-if="resizableX || resizableY"
			class="absolute -bottom-1 -right-1 w-3 h-3 cursor-se-resize opacity-0 group-hover:opacity-100 transition-all duration-200"
			:class="{'opacity-100': isResizing, 'opacity-0': !isResizing}"
			ref="resizeHandle"
			@mousedown.prevent.stop="handleResizeStart"
		>
			<span class="material-symbols-rounded h-min w-min rotate-45 origin-center text-black dark:text-white">
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

.draggable-component:hover {
	box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}
</style>