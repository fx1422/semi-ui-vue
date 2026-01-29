import { promises as fs } from 'fs';
import path from 'path';

const root = path.resolve(process.cwd(), 'packages/semi-ui-vue/src');
const exts = ['.ts', '.js', '.vue', '.tsx', '.jsx', '.mjs', '.cjs'];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
    } else if (entry.isFile() && exts.includes(path.extname(entry.name))) {
      await processFile(full);
    }
  }
}

async function processFile(filePath) {
  let content = await fs.readFile(filePath, 'utf8');
  const original = content;

  // from 'lodash/xxx' -> from 'lodash-es/xxx'
  content = content.replace(/from\s+(['"])lodash(\/[^'"]*)\1/g, (m, q, p1) => {
    return `from ${q}lodash-es${p1}${q}`;
  });

  // import 'lodash/xxx' -> import 'lodash-es/xxx'
  content = content.replace(/import\s+(['"])lodash(\/[^'"]*)\1/g, (m, q, p1) => {
    return `import ${q}lodash-es${p1}${q}`;
  });

  // require('lodash/xxx') -> require('lodash-es/xxx')
  content = content.replace(/require\((['"])lodash(\/[^'"]*)\1\)/g, (m, q, p1) => {
    return `require(${q}lodash-es${p1}${q})`;
  });

  // direct 'lodash' imports -> lodash-es
  content = content.replace(/from\s+(['"])lodash['"]/g, (m, q) => {
    return `from ${q}lodash-es${q}`;
  });
  content = content.replace(/import\s+(['"])lodash['"]/g, (m, q) => {
    return `import ${q}lodash-es${q}`;
  });
  content = content.replace(/require\((['"])lodash\1\)/g, (m, q) => {
    return `require(${q}lodash-es${q})`;
  });

  if (content !== original) {
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`patched: ${path.relative(process.cwd(), filePath)}`);
  }
}

(async () => {
  try {
    await walk(root);
    console.log('done');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

