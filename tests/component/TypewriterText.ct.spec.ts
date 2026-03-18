import { expect, test } from '@playwright/experimental-ct-vue';
import { defineComponent, ref } from 'vue';
import TypewriterText from '~/domains/shared/components/TypewriterText.vue';

const TypewriterHarness = defineComponent({
    components: {
        TypewriterText,
    },
    setup() {
        const typewriterRef = ref<InstanceType<typeof TypewriterText> | null>(null);

        const restartTypewriter = () => {
            typewriterRef.value?.restart();
        };

        return {
            restartTypewriter,
            typewriterRef,
        };
    },
    template: `
        <div class="space-y-4">
            <TypewriterText
                ref="typewriterRef"
                :phrases="['Alpha', 'Beta']"
                :type-speed="10"
                :delete-speed="10"
                :pause-duration="50"
            />
            <button data-testid="typewriter-restart" @click="restartTypewriter">Restart</button>
        </div>
    `,
});

test('types the current phrase and blinks the cursor', async ({ mount }) => {
    const component = await mount(TypewriterHarness);
    const cursor = component.locator('.typewriter-cursor');

    await expect(component).toContainText('Alpha');
    await expect
        .poll(async () => {
            return (await cursor.getAttribute('class')) ?? '';
        })
        .toContain('invisible');
});

test('loops through phrases and restarts from the first phrase', async ({ mount, page }) => {
    const component = await mount(TypewriterHarness);

    await expect
        .poll(async () => {
            return (await component.textContent()) ?? '';
        })
        .toContain('Beta');

    await page.getByTestId('typewriter-restart').click();

    await expect
        .poll(async () => {
            return (await component.textContent()) ?? '';
        })
        .toContain('Alpha');
});
