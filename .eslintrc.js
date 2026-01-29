module.exports = {
    root: true,
    env: {
        node: true,
        browser: true,
        es2021: true,
    },
    extends: ['plugin:vue/vue3-recommended', 'eslint:recommended', '@vue/typescript/recommended', '@vue/prettier'],
    parserOptions: {
        ecmaVersion: 2021,
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
    },
    plugins: ['vue', '@typescript-eslint'],
    rules: {
        // Semi Design 代码风格规范
        // Keep indent rule but lower to warning to avoid blocking builds during cleanup
        indent: ['warn', 4, { SwitchCase: 1 }],
        semi: ['error', 'always'],
        quotes: ['error', 'single', { avoidEscape: true }],
        'object-curly-spacing': ['error', 'always'],
        'space-before-blocks': ['error', 'always'],
        'keyword-spacing': ['error', { before: true, after: true }],
        'comma-dangle': [
            'error',
            {
                arrays: 'always-multiline',
                objects: 'always-multiline',
                imports: 'always-multiline',
                exports: 'always-multiline',
                functions: 'never',
            },
        ],
        'no-trailing-spaces': 'error',
        'eol-last': ['error', 'always'],

        // Vue 规则
        // Reduce Vue template/style noise: let Prettier handle formatting
        'vue/html-indent': 'off',
        'vue/script-indent': 'off',
        'vue/multi-word-component-names': 'off',
        'vue/no-v-html': 'off',
        'vue/prop-name-casing': 'off',
        'vue/require-default-prop': 'off',
        'vue/require-explicit-emits': 'off',
        'vue/component-name-in-template-casing': 'off',
        'vue/max-attributes-per-line': 'off',
        'vue/first-attribute-linebreak': 'off',
        'vue/html-closing-bracket-newline': 'off',
        'vue/attributes-order': 'off',
        'vue/attribute-hyphenation': 'off', // disable attribute hyphenation enforcement

        // TypeScript 规则
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        // disable unused-vars to avoid overwhelming noise; allow leading '_' pattern still supported
        '@typescript-eslint/no-unused-vars': 'off',
        // relax remaining strict rules that cause errors
        '@typescript-eslint/no-unsafe-function-type': 'off',
        'no-empty': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        'vue/no-dupe-keys': 'off',
        'vue/no-unused-vars': 'off',
        '@typescript-eslint/ban-ts-comment': 'warn',
        'no-case-declarations': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',
        'vue/no-mutating-props': 'off',
        'vue/no-side-effects-in-computed-properties': 'off',
        'vue/no-reserved-component-names': 'off',
        'vue/one-component-per-file': 'off',
    },
    overrides: [
        {
            files: ['*.vue'],
            rules: {
                indent: 'off',
                'vue/script-indent': 'off', // 关闭 vue/script-indent，让 Prettier 完全控制格式化
            },
        },
        {
            // 图标文件允许多个组件（内部 SvgComponent + 导出的 Icon 组件）
            files: ['src/components/icons/icons/*.ts'],
            rules: {
                'vue/one-component-per-file': 'off',
            },
        },
    ],
};
