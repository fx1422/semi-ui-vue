/**
 * 清理构建产物中的冗余文件
 * 
 * 删除不应该在最终包中的文件和目录：
 * - semi-foundation 类型文件（外部依赖，不应包含）
 * - example 示例代码
 * - _virtual Vite 虚拟模块
 */

import { rmSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 需要删除的目录
const directoriesToRemove = [
    'lib/es/semi-foundation',
    'lib/cjs/semi-foundation',
    'lib/es/example',
    'lib/cjs/example',
];

console.log('🧹 清理构建产物中的冗余文件...\n');

let removedCount = 0;

directoriesToRemove.forEach(dir => {
    const fullPath = join(rootDir, dir);
    if (existsSync(fullPath)) {
        // 计算文件数量
        const fileCount = countFiles(fullPath);
        rmSync(fullPath, { recursive: true, force: true });
        console.log(`  ✓ 已删除: ${dir} (${fileCount} 个文件)`);
        removedCount += fileCount;
    }
});

console.log('');
console.log('='.repeat(50));
console.log(`✅ 清理完成！共删除 ${removedCount} 个冗余文件`);
console.log('='.repeat(50));

/**
 * 递归计算目录中的文件数量
 */
function countFiles(dir) {
    let count = 0;
    
    try {
        const items = readdirSync(dir);
        
        items.forEach(item => {
            const itemPath = join(dir, item);
            const stat = statSync(itemPath);
            
            if (stat.isDirectory()) {
                count += countFiles(itemPath);
            } else {
                count++;
            }
        });
    } catch (error) {
        // 忽略错误
    }
    
    return count;
}
