import { ref, onMounted, onUnmounted, computed } from 'vue';

interface TypewriterOptions {
    phrases: string[];
    typeSpeed?: number;
    deleteSpeed?: number;
    pauseDuration?: number;
    loop?: boolean;
    autoStart?: boolean;
    cursor?: boolean;
    cursorSymbol?: string;
}

export const useTypewriter = (options: TypewriterOptions) => {
    const {
        phrases,
        typeSpeed = 150,
        deleteSpeed = 75,
        pauseDuration = 2000,
        loop = true,
        autoStart = true,
        cursor = true,
        cursorSymbol = '|',
    } = options;

    // États réactifs
    const displayText = ref('');
    const isTyping = ref(false);
    const isDeleting = ref(false);
    const currentPhraseIndex = ref(0);
    const currentCharIndex = ref(0);

    // Pour le curseur clignotant
    const showCursor = ref(true);
    let cursorInterval: NodeJS.Timeout | null = null;
    let typingTimeout: NodeJS.Timeout | null = null;

    // Séparer le texte et le curseur pour éviter les décalages
    const text = computed(() => displayText.value);
    const cursorVisible = computed(() => cursor && showCursor.value);

    // Animation du curseur
    const startCursorBlink = () => {
        if (!cursor) return;
        cursorInterval = setInterval(() => {
            showCursor.value = !showCursor.value;
        }, 500);
    };

    const stopCursorBlink = () => {
        if (cursorInterval) {
            clearInterval(cursorInterval);
            cursorInterval = null;
        }
        showCursor.value = true;
    };

    // Logique de frappe
    const typeCharacter = () => {
        if (currentPhraseIndex.value >= phrases.length) {
            if (!loop) {
                isTyping.value = false;
                return;
            }
            currentPhraseIndex.value = 0;
        }

        const currentPhrase = phrases[currentPhraseIndex.value];
        if (!currentPhrase) return;

        if (!isDeleting.value) {
            // Mode frappe
            if (currentCharIndex.value < currentPhrase.length) {
                displayText.value = currentPhrase.slice(0, currentCharIndex.value + 1);
                currentCharIndex.value++;

                const speed = typeSpeed + Math.random() * 50 - 25; // Variation naturelle
                typingTimeout = setTimeout(typeCharacter, speed);
            } else {
                // Phrase complète, pause puis suppression
                typingTimeout = setTimeout(() => {
                    isDeleting.value = true;
                    typeCharacter();
                }, pauseDuration);
            }
        } else {
            // Mode suppression
            if (currentCharIndex.value > 0) {
                currentCharIndex.value--;
                displayText.value = currentPhrase.slice(0, currentCharIndex.value);

                const speed = deleteSpeed + Math.random() * 25 - 12; // Variation naturelle
                typingTimeout = setTimeout(typeCharacter, speed);
            } else {
                // Suppression terminée, phrase suivante
                isDeleting.value = false;
                currentPhraseIndex.value++;
                typingTimeout = setTimeout(typeCharacter, 200);
            }
        }
    };

    // Contrôles publics
    const start = () => {
        if (isTyping.value) return;

        isTyping.value = true;
        startCursorBlink();
        typeCharacter();
    };

    const stop = () => {
        isTyping.value = false;
        stopCursorBlink();

        if (typingTimeout) {
            clearTimeout(typingTimeout);
            typingTimeout = null;
        }
    };

    const reset = () => {
        stop();
        displayText.value = '';
        currentPhraseIndex.value = 0;
        currentCharIndex.value = 0;
        isDeleting.value = false;
    };

    const restart = () => {
        reset();
        start();
    };

    // Gestion du cycle de vie
    onMounted(() => {
        if (autoStart) {
            start();
        } else if (cursor) {
            startCursorBlink();
        }
    });

    onUnmounted(() => {
        stop();
    });

    return {
        // État
        text: readonly(text),
        displayText: readonly(displayText),
        isTyping: readonly(isTyping),
        isDeleting: readonly(isDeleting),
        currentPhraseIndex: readonly(currentPhraseIndex),
        cursorVisible: readonly(cursorVisible),
        cursorSymbol,

        // Contrôles
        start,
        stop,
        reset,
        restart,
    };
};
