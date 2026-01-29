import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';


function transformScssImportsToCss() {
    return {
        name: 'transform-scss-imports-to-css',

        renderChunk(code, _chunk) {
            let newCode = code;

            // 将 ESM 的 .scss 导入转换为 .css 导入
            newCode = newCode.replace(/import\s+(['"])([^'"]+)\.scss\1/g, 'import $1$2.css$1');

            // 将 CJS 的 .scss require 转换为 .css require
            newCode = newCode.replace(/require\((['"])([^'"]+)\.scss\1\)/g, 'require($1$2.css$1)');

            // 移除 Vite 添加的 empty css 注释
            newCode = newCode.replace(/\/\*\s*empty css\s*\*\//g, '');

            if (newCode !== code) {
                return { code: newCode, map: null };
            }

            return null;
        },
    };
}

export default defineConfig({
    plugins: [
        vue(),
        transformScssImportsToCss(),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'SemiUIVue',
            formats: ['es', 'cjs'],
            fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
        },
        outDir: 'lib',
        rollupOptions: {
            // 使用 Rollup 插件解析并捆绑 node_modules 中的模块
            // 说明：通过 nodeResolve + commonjs，允许将部分 ESM/CJS 依赖打包进产物（例如 lodash-es）。
            plugins: [
                nodeResolve({
                    browser: true,
                    preferBuiltins: false,
                }),
                commonjs(),
            ],
            // 外部化策略（显式白名单）
            // 说明：仅把下方列出的包（或其子路径）标记为 external，由消费方提供；
            // 其余第三方依赖将被打包进库，减少消费方需要安装的包。
            external: (id) => {
                if (id.endsWith('.css') || id.endsWith('.scss')) {
                    return true;
                }

                const explicitExternals = [
                    'vue',
                    '@douyinfe/semi-foundation',
                    '@douyinfe/semi-animation',
                    '@douyinfe/semi-theme-default',
                    'date-fns',
                    'classnames',
                ];

                for (const pkg of explicitExternals) {
                    if (id === pkg || id.startsWith(pkg + '/')) {
                        return true;
                    }
                }

                return false;
            },
            output: [
                {
                    format: 'es',
                    dir: 'lib/es',
                    entryFileNames: 'index.js',
                    exports: 'named',
                },
                {
                    format: 'cjs',
                    dir: 'lib/cjs',
                    entryFileNames: 'index.cjs',
                    exports: 'named',
                },
            ],
            // 自定义警告处理：过滤 node_modules 中的滚动警告以减少噪音
            onwarn: (warning, warn) => {
                if (warning.id && warning.id.includes('node_modules')) {
                    return;
                }
                warn(warning);
            },
        },
        // 生产配置：不生成 source map，且将组件样式合并到 JS 中
        sourcemap: false,
        cssCodeSplit: false,
    },
    resolve: {
        alias: {
            // 本地构建时将依赖映射到 node_modules 中的已安装包，便于在 monorepo 中统一解析
            '@douyinfe/semi-foundation': resolve(__dirname, 'node_modules/@douyinfe/semi-foundation'),
            '@douyinfe/semi-theme-default': resolve(__dirname, 'node_modules/@douyinfe/semi-theme-default'),
            '@douyinfe/semi-animation': resolve(__dirname, 'node_modules/@douyinfe/semi-animation'),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                includePaths: [
                    resolve(__dirname, 'node_modules/@douyinfe/semi-foundation'),
                    resolve(__dirname, 'node_modules/@douyinfe/semi-theme-default/scss'),
                ],
                additionalData: '@import "@douyinfe/semi-theme-default/scss/variables.scss";',
                silenceDeprecations: ['import', 'legacy-js-api', 'global-builtin'],
                quietDeps: true,
            },
        },
    },
});
