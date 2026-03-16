import { defineConfig, devices } from '@playwright/experimental-ct-vue';
import AutoImport from 'unplugin-auto-import/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.join(__dirname, 'app');

export default defineConfig({
    testDir: './tests/component',
    timeout: 30_000,
    expect: {
        timeout: 5_000,
    },
    outputDir: 'test-results/playwright-ct',
    reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
    use: {
        ctPort: 3100,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        ctViteConfig: {
            resolve: {
                alias: {
                    '~': appDir,
                    '@': appDir,
                },
            },
            plugins: [
                AutoImport({
                    imports: ['vue'],
                    dts: false,
                }),
            ],
        },
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
            },
        },
    ],
});
