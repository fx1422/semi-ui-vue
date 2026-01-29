import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
    plugins: [vue()],
    test: {
        globals: true,
        environment: 'jsdom',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            statements: 80,
            branches: 75,
            functions: 80,
            lines: 80,
            exclude: [
                'node_modules/',
                '__test__/',
                '**/*.d.ts',
                '**/*.config.*',
                'dist/',
                'example/',
                'lib/',
                'scripts/',
            ],
        },
        include: ['__test__/**/*.test.ts'],
        setupFiles: ['./__test__/setup.ts'],
    },
    resolve: {
        alias: {
            '@douyinfe/semi-foundation': resolve(__dirname, '../semi-foundation'),
            '@douyinfe/semi-theme-default': resolve(__dirname, '../semi-theme-default'),
            '@douyinfe/semi-animation': resolve(__dirname, '../semi-animation'),
            lodash: resolve(__dirname, '../../node_modules/lodash'),
            'lodash-es': resolve(__dirname, '../../node_modules/lodash-es'),
        },
    },
    optimizeDeps: {
        include: ['lodash'],
    },
});
