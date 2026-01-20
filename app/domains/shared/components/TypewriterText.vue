<script lang="ts" setup>
import { useTypewriter } from '~/domains/shared/composables/useTypewriter';

interface Props {
    phrases: string[];
    typeSpeed?: number;
    deleteSpeed?: number;
    pauseDuration?: number;
    loop?: boolean;
    autoStart?: boolean;
    cursor?: boolean;
    cursorSymbol?: string;
    class?: string;
}

const props = withDefaults(defineProps<Props>(), {
    typeSpeed: 150,
    deleteSpeed: 75,
    pauseDuration: 2000,
    loop: true,
    autoStart: true,
    cursor: true,
    cursorSymbol: '|',
});

const { text, cursorVisible, cursorSymbol, isTyping, start, stop, restart } = useTypewriter(props);

// Exposer les méthodes pour le parent
defineExpose({
    start,
    stop,
    restart,
    isTyping,
});
</script>

<template>
    <span :class="props.class"
        >{{ text
        }}<span class="typewriter-cursor" :class="{ invisible: !cursorVisible }">{{
            cursorSymbol
        }}</span></span
    >
</template>

<style scoped>
.typewriter-cursor {
    @apply inline-block;
}

/* Alternative avec opacity si vous préférez */
/* .typewriter-cursor {
	@apply inline-block transition-opacity duration-0;
	opacity: 1;
}

.typewriter-cursor.invisible {
	opacity: 0;
} */
</style>
