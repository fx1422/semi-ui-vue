import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// Vite 插件：重写子路径导入为开发环境的源文件路径
function rewriteSubPathImports() {
    return {
        name: 'rewrite-sub-path-imports',
        resolveId(id: string) {
            // 处理 @transsionfe/semi-ui-vue/components/icons
            if (id.startsWith('@transsionfe/semi-ui-vue/components/icons')) {
                const subPath = id.replace('@transsionfe/semi-ui-vue/components/icons', '');
                const filePath = subPath ? subPath.replace(/^\//, '') : 'index.ts';
                return resolve(__dirname, 'src/components/icons', filePath);
            }
            // 处理 @transsionfe/semi-ui-vue/components/locale
            if (id.startsWith('@transsionfe/semi-ui-vue/components/locale')) {
                const subPath = id.replace('@transsionfe/semi-ui-vue/components/locale', '');
                const filePath = subPath ? subPath.replace(/^\//, '') : 'index.ts';
                return resolve(__dirname, 'src/components/locale', filePath);
            }
            return null;
        },
    };
}

// 开发服务器配置
export default defineConfig({
    plugins: [
        rewriteSubPathImports(),
        vue({
            script: {
                // 启用 TypeScript 支持
                defineModel: true,
                propsDestructure: true,
                // 使用 TypeScript 解析器
                babelParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
            },
            // 确保正确处理 Vue 文件
            template: {
                compilerOptions: {
                    isCustomElement: () => false,
                },
            },
        }),
    ],
    root: resolve(__dirname, 'example'),
    resolve: {
        alias: {
            '@douyinfe/semi-foundation': resolve(__dirname, 'node_modules/@douyinfe/semi-foundation'),
            '@douyinfe/semi-theme-default': resolve(__dirname, 'node_modules/@douyinfe/semi-theme-default'),
            '@douyinfe/semi-animation': resolve(__dirname, 'node_modules/@douyinfe/semi-animation'),
            // 将 @douyinfe/semi-ui-vue 指向本地源文件，以便在开发时使用
            '@douyinfe/semi-ui-vue': resolve(__dirname, 'src'),
            // 将 @transsionfe/semi-ui-vue 也指向本地源文件（包名已更改）
            '@transsionfe/semi-ui-vue': resolve(__dirname, 'src'),
            // 将 @douyinfe/semi-icons 也指向 semi-ui-vue 的图标（Vue 版本）
            '@douyinfe/semi-icons': resolve(__dirname, 'src/components/icons'),
            // 使用包含编译器的 Vue 版本以支持运行时模板编译
            vue: 'vue/dist/vue.esm-bundler.js',
            // 添加 content 目录的别名，指向 example/docs/content
            '@content': resolve(__dirname, 'example/docs/content'),
            // 添加 components 别名，指向 example/src/components
            '@components': resolve(__dirname, 'example/src/components'),
            // 添加 examples 别名，指向 example/examples/components
            '@examples': resolve(__dirname, 'example/examples'),
            // 添加 example-root 别名指向 example 目录
            '@example-root': resolve(__dirname, 'example'),
            // 添加其他别名
            '@lib': resolve(__dirname, 'example/src/lib'),
            '@assets': resolve(__dirname, 'example/src/assets'),
        },
    },
    assetsInclude: ['**/*.md'],
    optimizeDeps: {
        // 明确指定入口文件，避免扫描包含字符串模板的 Vue 文件
        entries: [resolve(__dirname, 'example/index.html'), resolve(__dirname, 'example/src/app/main.ts')],
        include: [
            'lodash',
            'classnames',
            'prismjs',
            'prismjs/components/prism-markup',
            'prismjs/components/prism-javascript',
            'prismjs/components/prism-typescript',
            'prismjs/components/prism-jsx',
            'prismjs/components/prism-tsx',
            'prismjs/components/prism-css',
            'prismjs/components/prism-scss',
            'prismjs/components/prism-json',
            'prismjs/components/prism-markdown',
            'prismjs/components/prism-bash',
            'prismjs/components/prism-yaml',
        ],
        // 排除本地包，让 Vite 直接使用源文件
        exclude: ['@douyinfe/semi-ui-vue', '@transsionfe/semi-ui-vue', '@douyinfe/semi-icons'],
        esbuildOptions: {
            // 配置 esbuild 以正确处理 TypeScript
            target: 'esnext',
        },
    },
    esbuild: {
        // 配置 esbuild 以正确处理 TypeScript 语法
        target: 'esnext',
        // 确保 TypeScript 语法被正确处理
        tsconfigRaw: {
            compilerOptions: {
                experimentalDecorators: true,
            },
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                // 添加额外的导入路径
                additionalData: '',
                includePaths: [
                    resolve(__dirname, 'node_modules/@douyinfe'), // 用于解析 @import 'semi-theme-default/...'
                    resolve(__dirname, 'node_modules/@douyinfe/semi-foundation'),
                    resolve(__dirname, 'node_modules/@douyinfe/semi-theme-default'),
                ],
                // 忽略 Sass 弃用警告
                silenceDeprecations: ['import', 'legacy-js-api', 'global-builtin'],
                // 忽略依赖包（如 semi-foundation）中的警告
                quietDeps: true,
            },
        },
    },
    server: {
        port: 3333,
        open: true,
        host: '0.0.0.0',
    },
});
