import { readdir, stat, unlink, rm } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * 删除 .vue2.js 文件
 * 这些文件是 Vite 为 Vue 2 兼容性生成的，但我们只支持 Vue 3
 * 删除它们可以减少约 50% 的文件数量
 */
async function cleanupVue2Files(dir) {
    let count = 0;
    
    async function walk(currentDir) {
        try {
            const entries = await readdir(currentDir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = join(currentDir, entry.name);
                
                if (entry.isDirectory()) {
                    await walk(fullPath);
                } else if (entry.name.endsWith('.vue2.js')) {
                    // Skipping deletion of .vue2.js build artifacts to ensure ES build
                    // consumers have matching module files (these files are included
                    // in published packages). Previously we removed them which left
                    // companion `.vue.js` files importing missing `.vue2.js` modules.
                    // Keep them present to avoid unresolved import errors for downstream apps.
                    // Intentionally do not delete; keep count unchanged.
                }
            }
        } catch (error) {
            // 忽略错误
        }
    }
    
    await walk(dir);
    return count;
}

// 删除 packages/semi-foundation 目录
async function removeSemiFoundation(dir) {
    const packagesDir = join(dir, 'packages');
    const semiFoundationDir = join(packagesDir, 'semi-foundation');

    try {
        await rm(semiFoundationDir, { recursive: true, force: true });
        console.log(`✓ Removed: ${semiFoundationDir.replace(rootDir, '')}`);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error(`Error removing semi-foundation:`, error.message);
        }
    }
}

// 清理 lib/es 和 lib/cjs 目录
async function main() {
    console.log('Cleaning up build artifacts...\n');

    const esDir = join(rootDir, 'lib/es');
    const cjsDir = join(rootDir, 'lib/cjs');

    // 清理 .vue2.js 文件
    console.log('🧹 删除 Vue2 兼容文件...');
    const esVue2Count = await cleanupVue2Files(esDir);
    const cjsVue2Count = await cleanupVue2Files(cjsDir);
    console.log(`  ✓ lib/es: 删除 ${esVue2Count} 个 .vue2.js 文件`);
    console.log(`  ✓ lib/cjs: 删除 ${cjsVue2Count} 个 .vue2.js 文件\n`);

    // 删除打包进来的 semi-foundation 目录
    await removeSemiFoundation(esDir);
    await removeSemiFoundation(cjsDir);

    console.log('\n✓ Cleanup completed!');
}

main().catch(console.error);
