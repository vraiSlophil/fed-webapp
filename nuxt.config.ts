import Aura from '@primeuix/themes/aura';

// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import {definePreset} from "@primeuix/themes";

const AmberAuraPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{amber.50}',
            100: '{amber.100}',
            200: '{amber.200}',
            300: '{amber.300}',
            400: '{amber.400}',
            500: '{amber.500}',
            600: '{amber.600}',
            700: '{amber.700}',
            800: '{amber.800}',
            900: '{amber.900}',
            950: '{amber.950}',
        }
    }
})

export default defineNuxtConfig({
    future: { compatibilityVersion: 4 },
    compatibilityDate: '2025-05-15',
    devtools: {enabled: true},
    runtimeConfig: {
        public: {
            BACKEND_URL: '',
            FRONTEND_URL: '',
        }
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
    modules: [
        '@primevue/nuxt-module'
    ],
    primevue: {
        options: {
            theme: {
                preset: AmberAuraPreset,
                options: {
                    darkModeSelector: 'system',
                    darkModeClass: 'dark',
                }
            }
        }
    },
    vite: {
        plugins: [
            tailwindcss(),
        ],
    },
    app: {
        pageTransition: { name: 'page', mode: 'out-in' },
        head: {
            title: 'FED',
            htmlAttrs: {
                lang: 'fr'
            },
            link: [
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,700,0,200'
                }
            ]
        }
    },
})
