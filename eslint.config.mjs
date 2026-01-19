import { createConfigForNuxt } from '@nuxt/eslint-config/flat';

export default createConfigForNuxt(
    {},
    {
        name: 'project/ignores',
        ignores: ['coverage/**', 'cypress/screenshots/**', 'cypress/videos/**'],
    },
    {
        name: 'project/relaxed-rules',
        rules: {
            '@typescript-eslint/ban-ts-comment': 'warn',
            '@typescript-eslint/consistent-type-imports': 'off',
            '@typescript-eslint/no-dynamic-delete': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-expressions': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/unified-signatures': 'warn',
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            'vue/attribute-hyphenation': 'warn',
            'vue/attributes-order': 'warn',
            'vue/html-self-closing': 'warn',
            'vue/multi-word-component-names': 'off',
            'vue/no-mutating-props': 'warn',
            'vue/no-template-shadow': 'warn',
            'vue/no-useless-template-attributes': 'warn',
            'vue/no-unused-vars': 'warn',
            'vue/require-default-prop': 'warn',
        },
    },
    {
        name: 'project/vue-indentation',
        files: ['**/*.vue'],
        rules: {
            'vue/html-indent': 'off',
            'vue/script-indent': ['error', 4, { baseIndent: 0, switchCase: 1 }],
        },
    },
    {
        name: 'project/cypress-globals',
        files: ['cypress/**/*.{js,ts,jsx,tsx}'],
        languageOptions: {
            globals: {
                Cypress: 'readonly',
                cy: 'readonly',
                describe: 'readonly',
                context: 'readonly',
                it: 'readonly',
                before: 'readonly',
                after: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                expect: 'readonly',
            },
        },
    },
);
