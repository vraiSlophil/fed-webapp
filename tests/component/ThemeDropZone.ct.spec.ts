import { expect, test } from '@playwright/experimental-ct-vue';
import { defineComponent, ref } from 'vue';
import ThemeDropZone from '~/domains/playground/components/ThemeDropZone.vue';
import { useDraggableThemes } from '~/domains/playground/composables/useDraggableTheme';
import { useDropZoneInteraction } from '~/domains/playground/composables/useDropZoneInteraction';
import { playgroundTheme } from '../fixtures/app';

const ThemeDropZoneHarness = defineComponent({
    components: {
        ThemeDropZone,
    },
    setup() {
        const droppedTheme = ref('');
        const { endDrag, startDrag } = useDraggableThemes();

        const beginDrag = () => {
            startDrag({ ...playgroundTheme });
        };

        const stopDrag = () => {
            endDrag();
        };

        const onDropTheme = (theme: typeof playgroundTheme) => {
            droppedTheme.value = theme.title;
        };

        return {
            beginDrag,
            droppedTheme,
            onDropTheme,
            stopDrag,
        };
    },
    template: `
        <div>
            <button data-testid="theme-drop-zone-start" @click="beginDrag">Start drag</button>
            <button data-testid="theme-drop-zone-stop" @click="stopDrag">Stop drag</button>
            <ThemeDropZone @drop-theme="onDropTheme" />
            <div data-testid="theme-drop-zone-dropped">{{ droppedTheme }}</div>
        </div>
    `,
});

test.beforeEach(() => {
    useDropZoneInteraction().resetDropZone();
    useDraggableThemes().endDrag();
});

test('shows and hides the drop zone while a theme is being dragged', async ({ mount, page }) => {
    await mount(ThemeDropZoneHarness);
    const zone = page.getByTestId('playground-theme-drop-zone');

    await expect(zone).toHaveClass(/w-0/);

    await page.getByTestId('theme-drop-zone-start').click();
    await expect(zone).toHaveClass(/w-64/);

    await page.getByTestId('theme-drop-zone-stop').click();
    await expect(zone).toHaveClass(/w-0/);
});

test('activates on hover and emits the dropped theme', async ({ mount, page }) => {
    await mount(ThemeDropZoneHarness);
    const zone = page.getByTestId('playground-theme-drop-zone');

    await page.getByTestId('theme-drop-zone-start').click();
    await zone.hover();

    await expect(page.getByText('Relâcher pour ranger')).toBeVisible();

    await zone.dispatchEvent('mouseup');

    await expect(page.getByTestId('theme-drop-zone-dropped')).toHaveText(playgroundTheme.title);
});
