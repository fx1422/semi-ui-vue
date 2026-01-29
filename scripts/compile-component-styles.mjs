/**
 * 编译组件 SCSS 为 CSS
 * 对齐 React 版本的 compileScss 任务
 *
 * 功能：
 * 1. 收集所有组件的 .scss 文件
 * 2. 编译为 .css 文件
 * 3. 输出到 lib/es 和 lib/cjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, relative, sep } from 'path';
import { fileURLToPath } from 'url';
import { compileString } from 'sass';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');

// 关键路径：优先使用本地仓库的 theme/foundation，若不存在则降级到 node_modules 中的包
const LOCAL_THEME_ROOT = join(rootDir, '..', 'semi-theme-default', 'scss');
const LOCAL_FOUNDATION_ROOT = join(rootDir, '..', 'semi-foundation');

const NODE_THEME_ROOT = join(rootDir, 'node_modules', '@douyinfe', 'semi-theme-default', 'scss');
const NODE_FOUNDATION_ROOT = join(rootDir, 'node_modules', '@douyinfe', 'semi-foundation');

// 最终使用的路径（若本地不存在则使用 node_modules 中的包）
const THEME_ROOT = existsSync(LOCAL_THEME_ROOT) ? LOCAL_THEME_ROOT : (existsSync(NODE_THEME_ROOT) ? NODE_THEME_ROOT : LOCAL_THEME_ROOT);
const FOUNDATION_ROOT = existsSync(LOCAL_FOUNDATION_ROOT) ? LOCAL_FOUNDATION_ROOT : (existsSync(NODE_FOUNDATION_ROOT) ? NODE_FOUNDATION_ROOT : LOCAL_FOUNDATION_ROOT);

// 验证关键路径，尝试本地与 node_modules 两个位置
if (!existsSync(THEME_ROOT)) {
    console.error(`❌ Theme root not found: ${THEME_ROOT}`);
    console.error('Tried local path and node_modules. Please install @douyinfe/semi-theme-default or provide a local semi-theme-default folder.');
    process.exit(1);
}
if (!existsSync(FOUNDATION_ROOT)) {
    console.error(`❌ Foundation root not found: ${FOUNDATION_ROOT}`);
    console.error('Tried local path and node_modules. Please install @douyinfe/semi-foundation or provide a local semi-foundation folder.');
    process.exit(1);
}

console.log(`📁 Theme root: ${THEME_ROOT}`);
console.log(`📁 Foundation root: ${FOUNDATION_ROOT}\n`);

/**
 * 递归查找所有 .scss 文件
 */
function findScssFiles(dir, fileList = []) {
    const files = readdirSync(dir);

    files.forEach((file) => {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            if (!file.startsWith('_') && file !== 'node_modules' && file !== 'example') {
                findScssFiles(filePath, fileList);
            }
        } else if (file.endsWith('.scss')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

/**
 * 编译单个 SCSS 文件
 */
function compileScssFile(scssFilePath, outputDir) {
    try {
        // 读取 SCSS 文件内容
        const scssContent = readFileSync(scssFilePath, 'utf-8');

        // 编译 SCSS
        const result = compileString(scssContent, {
            // 提供基础搜索路径
            loadPaths: [
                FOUNDATION_ROOT,
                THEME_ROOT,
                dirname(scssFilePath),
                join(FOUNDATION_ROOT, '..'),
            ],
            // 自定义导入器，处理 @douyinfe 包路径
            importers: [
                {
                    findFileUrl(url) {
                        // 处理 @douyinfe/semi-foundation
                        if (url.includes('@douyinfe/semi-foundation')) {
                            const cleanUrl = url
                                .replace(/^~?@douyinfe\/semi-foundation\//, '')
                                .replace(/\.scss$/, '');

                            // 尝试多种路径组合
                            const candidates = [
                                join(FOUNDATION_ROOT, cleanUrl + '.scss'),
                                join(FOUNDATION_ROOT, cleanUrl, 'index.scss'),
                                join(FOUNDATION_ROOT, cleanUrl),
                            ];

                            for (const candidate of candidates) {
                                if (existsSync(candidate)) {
                                    // 使用 file:/// 协议，并将 Windows 路径转换为 URL 兼容格式
                                    const urlPath = candidate.split(sep).join('/');
                                    return new URL(`file:///${urlPath}`);
                                }
                            }
                        }

                        // 处理 @douyinfe/semi-theme-default
                        if (url.includes('@douyinfe/semi-theme-default')) {
                            const cleanUrl = url
                                .replace(/^~?@douyinfe\/semi-theme-default\/scss\//, '')
                                .replace(/\.scss$/, '');

                            const candidates = [
                                join(THEME_ROOT, cleanUrl + '.scss'),
                                join(THEME_ROOT, cleanUrl),
                            ];

                            for (const candidate of candidates) {
                                if (existsSync(candidate)) {
                                    const urlPath = candidate.split(sep).join('/');
                                    return new URL(`file:///${urlPath}`);
                                }
                            }
                        }

                        return null;
                    },
                },
            ],
            quietDeps: true,
            silenceDeprecations: ['import', 'legacy-js-api', 'global-builtin'],
        });

        // 计算输出路径
        const relativePath = relative(srcDir, scssFilePath);
        const cssFileName = relativePath.replace(/\.scss$/, '.css');
        const outputPath = join(outputDir, cssFileName);

        // 确保输出目录存在
        const outputFileDir = dirname(outputPath);
        if (!existsSync(outputFileDir)) {
            mkdirSync(outputFileDir, { recursive: true });
        }

        // 写入 CSS 文件
        writeFileSync(outputPath, result.css, 'utf-8');

        return { success: true, file: relativePath };
    } catch (error) {
        return {
            success: false,
            file: relative(srcDir, scssFilePath),
            error: error.message
        };
    }
}

/**
 * 主函数
 */
async function main() {
    console.log('🎨 Compiling component SCSS files to CSS...\n');

    // 查找所有 SCSS 文件
    const scssFiles = findScssFiles(srcDir);
    console.log(`Found ${scssFiles.length} SCSS files\n`);

    const results = { success: [], failed: [] };

    // 编译到 lib/es
    console.log('📦 Compiling to lib/es...');
    const esOutputDir = join(rootDir, 'lib/es');
    scssFiles.forEach((file) => {
        const result = compileScssFile(file, esOutputDir);
        if (result.success) {
            console.log(`✓ ${result.file}`);
            if (!results.success.includes(result.file)) {
                results.success.push(result.file);
            }
        } else {
            console.error(`✗ ${result.file}`);
            console.error(`  ${result.error}`);
            if (!results.failed.find(f => f.file === result.file)) {
                results.failed.push(result);
            }
        }
    });

    console.log('');

    // 编译到 lib/cjs
    console.log('📦 Compiling to lib/cjs...');
    const cjsOutputDir = join(rootDir, 'lib/cjs');
    scssFiles.forEach((file) => {
        const result = compileScssFile(file, cjsOutputDir);
        if (result.success) {
            console.log(`✓ ${result.file}`);
        } else {
            console.error(`✗ ${result.file}`);
            console.error(`  ${result.error}`);
        }
    });

    console.log('');
    console.log('='.repeat(50));
    console.log(`✅ Successfully compiled: ${results.success.length} files`);
    if (results.failed.length > 0) {
        console.log(`❌ Failed: ${results.failed.length} files`);
        console.log('\nFailed files:');
        results.failed.forEach(({ file, error }) => {
            console.log(`  - ${file}`);
            console.log(`    ${error}`);
        });
        process.exit(1);
    }
    console.log('='.repeat(50));
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
