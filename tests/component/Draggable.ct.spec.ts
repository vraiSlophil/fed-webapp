import { expect, test } from '@playwright/experimental-ct-vue';
import { defineComponent, ref } from 'vue';
import Draggable from '~/domains/playground/components/Draggable.vue';

const DraggableHarness = defineComponent({
    components: {
        Draggable,
    },
    setup() {
        const x = ref(10);
        const y = ref(10);
        const lastDragEnd = ref('');

        return {
            lastDragEnd,
            x,
            y,
        };
    },
    template: `
        <div
            data-testid="draggable-parent"
            style="position: relative; width: 240px; height: 240px; border: 1px solid #d4d4d8;"
        >
            <Draggable
                :x="x"
                :y="y"
                :width="80"
                :height="80"
                :no-drag-elements="['.ignore-drag']"
                @update:x="x = $event"
                @update:y="y = $event"
                @dragend="lastDragEnd = $event.x + ',' + $event.y"
            >
                <div
                    data-testid="draggable-body"
                    style="width: 80px; height: 80px; background: #facc15; border-radius: 16px; display: flex; align-items: center; justify-content: center;"
                >
                    <button class="ignore-drag" type="button">Ignore</button>
                </div>
            </Draggable>
            <div data-testid="drag-position">{{ x }},{{ y }}</div>
            <div data-testid="drag-end">{{ lastDragEnd }}</div>
        </div>
    `,
});

test('emits position updates and stays within parent bounds', async ({ mount, page }) => {
    const component = await mount(DraggableHarness);
    const draggable = component.locator('.draggable-component');
    const box = await draggable.boundingBox();

    if (!box) {
        throw new Error('Expected draggable bounding box to exist');
    }

    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.down();
    await page.mouse.move(box.x + 320, box.y + 320);
    await page.mouse.up();

    await expect(page.getByTestId('drag-position')).toHaveText('160,160');
    await expect(page.getByTestId('drag-end')).toHaveText('160,160');
});

test('ignores drag starts on configured no-drag elements', async ({ mount, page }) => {
    await mount(DraggableHarness);
    const ignoreButton = page.getByRole('button', { name: 'Ignore' });
    const box = await ignoreButton.boundingBox();

    if (!box) {
        throw new Error('Expected ignore button bounding box to exist');
    }

    await page.mouse.move(box.x + 5, box.y + 5);
    await page.mouse.down();
    await page.mouse.move(box.x + 120, box.y + 120);
    await page.mouse.up();

    await expect(page.getByTestId('drag-position')).toHaveText('10,10');
});
