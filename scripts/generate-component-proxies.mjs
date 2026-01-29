#!/usr/bin/env node
import { readdir, stat, mkdir, writeFile } from 'fs/promises';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const libEsComponents = join(root, 'lib', 'es', 'components');
const libCjsComponents = join(root, 'lib', 'cjs', 'components');

function pascalCase(name) {
    return name
        .split(/[-_]/)
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join('');
}

async function existsDir(path) {
    try {
        const s = await stat(path);
        return s.isDirectory();
    } catch {
        return false;
    }
}

async function generateForDir(compDir, isCjs = false) {
    const entries = await readdir(compDir, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const name = entry.name;
        const pascal = pascalCase(name);
        const targetDir = join(compDir, name);

        // ESM proxy
        if (!isCjs) {
            const proxyPath = join(targetDir, 'index.js');
            const stylePath = join(targetDir, 'style.js');
            const proxyContent = `import { ${pascal} } from '../../index.js';\nexport default ${pascal};\nexport { ${pascal} };\n`;
            const styleContent = `import './${name}.css';\n`;
            await writeFile(proxyPath, proxyContent, 'utf8').catch(() => {});
            await writeFile(stylePath, styleContent, 'utf8').catch(() => {});
        } else {
            // CJS proxy
            const proxyPath = join(targetDir, 'index.cjs');
            const stylePath = join(targetDir, 'style.cjs');
            const proxyContent = `const { ${pascal} } = require('../../index.cjs');\nmodule.exports = ${pascal};\nmodule.exports.${pascal} = ${pascal};\n`;
            const styleContent = `require('./${name}.css');\n`;
            await writeFile(proxyPath, proxyContent, 'utf8').catch(() => {});
            await writeFile(stylePath, styleContent, 'utf8').catch(() => {});
        }
    }
}

async function main() {
    const esExists = await existsDir(libEsComponents);
    const cjsExists = await existsDir(libCjsComponents);
    if (!esExists && !cjsExists) {
        console.error('No lib components directory found. Run build first.');
        process.exit(1);
    }

    if (esExists) {
        console.log('Generating ESM proxies...');
        await generateForDir(libEsComponents, false);
    }
    if (cjsExists) {
        console.log('Generating CJS proxies...');
        await generateForDir(libCjsComponents, true);
    }
    console.log('Component proxy generation complete.');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});

