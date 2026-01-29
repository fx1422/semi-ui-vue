/**
 * 生成类型定义文件
 * 
 * 策略：
 * 1. 使用 tsconfig.build.json 生成类型到 lib/types
 * 2. 复制到 lib/es 和 lib/cjs
 * 3. 清理临时文件
 */

import { spawn } from 'child_process';
import { cpSync, existsSync, rmSync, readdirSync, copyFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 需要忽略的错误文件路径
const IGNORED_ERROR_PATTERNS = [
    'semi-animation/src/interpolate.ts',
    'semi-foundation/progress/generates.ts',
    'semi-foundation/timePicker/foundation.ts',
    'semi-foundation/anchor/foundation.ts',
];

function shouldIgnoreError(line) {
    for (const pattern of IGNORED_ERROR_PATTERNS) {
        if (line.includes(pattern)) {
            return true;
        }
    }
    return false;
}

/**
 * 运行 vue-tsc 生成类型
 */
function runVueTsc() {
    return new Promise((resolve, reject) => {
        console.log('📦 生成类型定义文件...\n');
        
        const vueTsc = spawn(
            'vue-tsc',
            ['--project', 'tsconfig.build.json'],
            {
                cwd: rootDir,
                shell: true,
                stdio: ['inherit', 'pipe', 'pipe'],
            }
        );

        let outputBuffer = '';
        let hasRealErrors = false;
        let hasIgnoredErrors = false;
        const realErrors = [];

        vueTsc.stdout.on('data', (data) => {
            outputBuffer += data.toString();
        });

        vueTsc.stderr.on('data', (data) => {
            outputBuffer += data.toString();
        });

        vueTsc.on('close', (code) => {
            // 解析输出，找出所有错误
            const lines = outputBuffer.split('\n');
            
            for (const line of lines) {
                // 匹配错误行
                if (line.includes('error TS')) {
                    if (shouldIgnoreError(line)) {
                        hasIgnoredErrors = true;
                        console.log(`⚠️  忽略已知错误: ${line.trim()}`);
                    } else {
                        hasRealErrors = true;
                        realErrors.push(line);
                    }
                }
            }

            // 输出所有非忽略的错误
            if (hasRealErrors) {
                console.error('\n❌ 发现以下类型错误:');
                realErrors.forEach(err => console.error(err));
                reject(new Error(`vue-tsc 发现 ${realErrors.length} 个类型错误`));
            } else if (code !== 0 && hasIgnoredErrors) {
                // 只有被忽略的错误，认为构建成功
                console.log('✓ 类型检查完成（已忽略已知的外部包错误）\n');
                resolve(0);
            } else if (code === 0) {
                console.log('✓ 类型检查通过\n');
                resolve(0);
            } else {
                // 其他情况，输出原始输出
                console.log(outputBuffer);
                reject(new Error(`vue-tsc 失败，退出码: ${code}`));
            }
        });

        vueTsc.on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * 复制类型文件到目标目录
 */
function copyTypes() {
    // Find generated .d.ts files under lib/types and copy them into lib/es and lib/cjs preserving relative paths.
    const typesRoot = join(rootDir, 'lib/types');
    const esDir = join(rootDir, 'lib/es');
    const cjsDir = join(rootDir, 'lib/cjs');

    if (!existsSync(typesRoot)) {
        console.error('❌ 类型文件目录不存在:', typesRoot);
        throw new Error('类型文件生成失败');
    }

    console.log('📋 复制类型定义到输出目录 (扫描 lib/types/*.d.ts)...\n');

    const walkAndCopy = (dir) => {
        const entries = readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                walkAndCopy(fullPath);
            } else if (entry.isFile() && fullPath.endsWith('.d.ts')) {
                const rel = fullPath.substring(typesRoot.length + 1);
                const destEs = join(esDir, rel);
                const destCjs = join(cjsDir, rel);
                const destEsDir = dirname(destEs);
                const destCjsDir = dirname(destCjs);
                if (!existsSync(destEsDir)) mkdirSync(destEsDir, { recursive: true });
                if (!existsSync(destCjsDir)) mkdirSync(destCjsDir, { recursive: true });
                copyFileSync(fullPath, destEs);
                copyFileSync(fullPath, destCjs);
            }
        }
    };

    walkAndCopy(typesRoot);
    console.log('  ✓ 复制完成\n');
}

/**
 * 清理临时文件
 */
function cleanup() {
    const typesDir = join(rootDir, 'lib/types');
    
    if (existsSync(typesDir)) {
        console.log('🧹 清理临时文件...\n');
        rmSync(typesDir, { recursive: true, force: true });
        console.log('  ✓ 已删除 lib/types/\n');
    }
}

/**
 * 主函数
 */
async function main() {
    try {
        // 1. 生成类型
        await runVueTsc();

        // 2. 复制类型文件
        copyTypes();

        // 3. 清理临时文件
        cleanup();

        console.log('='.repeat(50));
        console.log('✅ 类型定义生成完成！');
        console.log('='.repeat(50));
    } catch (error) {
        console.error('\n❌ 类型生成失败:', error.message);
        process.exit(1);
    }
}

main();
