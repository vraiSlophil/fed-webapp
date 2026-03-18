import { defineConfig, devices } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadEnvironmentLayer = (
    relativePath: string,
    protectedKeys: Set<string>,
    loadedKeys: Set<string>,
): void => {
    const absolutePath = path.join(__dirname, relativePath);

    if (!fs.existsSync(absolutePath)) {
        return;
    }

    const parsedValues = parseEnv(fs.readFileSync(absolutePath, 'utf8'));

    for (const [key, value] of Object.entries(parsedValues)) {
        if (protectedKeys.has(key) && !loadedKeys.has(key)) {
            continue;
        }

        process.env[key] = value;
        loadedKeys.add(key);
    }
};

const protectedEnvironmentKeys = new Set(Object.keys(process.env));
const fileLoadedKeys = new Set<string>();

loadEnvironmentLayer('.env', protectedEnvironmentKeys, fileLoadedKeys);
loadEnvironmentLayer('.env.test', protectedEnvironmentKeys, fileLoadedKeys);

const frontendBaseUrl = 'http://127.0.0.1:3000';
const backendBaseUrl = process.env.NUXT_PUBLIC_BACKEND_URL ?? 'http://127.0.0.1:8000';
const userStorageState = path.join(__dirname, 'tests/.auth/user.json');
const adminStorageState = path.join(__dirname, 'tests/.auth/admin.json');
const realBackendE2EEnabled = process.env.PLAYWRIGHT_ENABLE_REAL_BACKEND_E2E === '1';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    timeout: 30_000,
    expect: {
        timeout: 5_000,
    },
    outputDir: 'test-results/playwright',
    reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
    use: {
        baseURL: frontendBaseUrl,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    webServer: {
        command: 'npm run dev -- --host 0.0.0.0 --port 3000',
        url: frontendBaseUrl,
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
        env: {
            ...process.env,
            NUXT_PUBLIC_BACKEND_URL: backendBaseUrl,
            NUXT_PUBLIC_FRONTEND_URL: frontendBaseUrl,
        },
    },
    projects: [
        {
            name: 'integration',
            testDir: './tests/integration',
            use: {
                ...devices['Desktop Chrome'],
            },
        },
        {
            name: 'setup-user',
            testDir: './tests/e2e/setup',
            testMatch: /user\.setup\.ts/,
            use: {
                ...devices['Desktop Chrome'],
            },
        },
        {
            name: 'setup-admin',
            testDir: './tests/e2e/setup',
            testMatch: /admin\.setup\.ts/,
            use: {
                ...devices['Desktop Chrome'],
            },
        },
        {
            name: 'e2e-public',
            testDir: './tests/e2e/public',
            use: {
                ...devices['Desktop Chrome'],
            },
        },
        {
            name: 'e2e-user',
            testDir: './tests/e2e/user',
            dependencies: ['setup-user'],
            use: {
                ...devices['Desktop Chrome'],
                storageState: realBackendE2EEnabled ? userStorageState : undefined,
            },
        },
        {
            name: 'e2e-admin',
            testDir: './tests/e2e/admin',
            dependencies: ['setup-admin'],
            use: {
                ...devices['Desktop Chrome'],
                storageState: realBackendE2EEnabled ? adminStorageState : undefined,
            },
        },
    ],
});
