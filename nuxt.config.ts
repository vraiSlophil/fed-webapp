import tailwindcss from '@tailwindcss/vite';
import { FedPreset } from './app/utils/FedPreset';

export default defineNuxtConfig({
    future: { compatibilityVersion: 4 },
    compatibilityDate: '2025-05-15',
    devtools: { enabled: true },
    runtimeConfig: {
        public: {
            BACKEND_URL: '',
            FRONTEND_URL: '',
        },
    },
    css: ['~/assets/css/main.css'],
    components: [
        // Auto-import depuis components/ (par défaut)
        {
            path: '~/components',
            pathPrefix: false,
        },
        // Auto-import depuis tous les domaines
        {
            path: '~/domains/auth/components',
            pathPrefix: false,
        },
        {
            path: '~/domains/playground/components',
            pathPrefix: false,
        },
        {
            path: '~/domains/themes/components',
            pathPrefix: false,
        },
        {
            path: '~/domains/tasks/components',
            pathPrefix: false,
        },
        {
            path: '~/domains/admin/components',
            pathPrefix: false,
        },
        {
            path: '~/domains/shared/components',
            pathPrefix: false,
        },
    ],
    modules: ['@nuxt/eslint', '@primevue/nuxt-module'],
    // primevue: {
    //     options: {
    //         theme: {
    //             preset: AmberAuraPreset,
    //             options: {
    //                 darkModeSelector: 'system',
    //                 darkModeClass: 'dark',
    //             }
    //         }
    //     }
    // },
    primevue: {
        options: {
            theme: {
                preset: FedPreset,
                options: {
                    darkModeSelector: 'system',
                    cssLayer: false,
                },
            },
        },
    },
    vite: {
        plugins: [tailwindcss()],
    },
    app: {
        pageTransition: { name: 'page', mode: 'out-in' },
        head: {
            title: 'FED',
            htmlAttrs: {
                lang: 'fr',
            },
            link: [
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,700,1,200',
                },
            ],
        },
    },
});
