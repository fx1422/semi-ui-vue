#!/usr/bin/env node
/**
 * Run the sass CLI and filter out repetitive deprecation warnings (e.g. @import deprecation).
 * Usage: node scripts/filter-sass-output.mjs [sass args...]
 */
import { spawn } from 'child_process';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node scripts/filter-sass-output.mjs [sass args...]');
  process.exit(2);
}

// Spawn sass in a shell so local node_modules/.bin is resolved in npm scripts
const proc = spawn('sass', args, { shell: true });

function filterAndWrite(stream, isStdout = true) {
  let buffer = '';
  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    let lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';
    for (const line of lines) {
      // Filter rules: hide Sass deprecation warnings about @import and repetitive lines (case-insensitive)
      const lower = line.toLowerCase();
      if (lower.includes('deprecation warning') || lower.includes('deprecati') || lower.includes('repetitive deprecation warnings omitted')) {
        continue;
      }
      // 额外过滤：移除 deprecation 相关的跟随行（"More info..." / code snippet / file location 等）
      if (lower.includes('more info and automated migrator') || line.trim() === '╷' || line.trim() === '╵') {
        continue;
      }
      if (lower.includes('.scss') && lower.includes('root stylesheet')) {
        continue;
      }
      // 移除视觉指示/代码片段行（包含竖线符号）以及建议信息
      if (line.includes('│') || lower.includes('run in verbose mode')) {
        continue;
      }
      if (isStdout) process.stdout.write(line + '\n');
      else process.stderr.write(line + '\n');
    }
  });
  stream.on('end', () => {
    if (buffer) {
      const line = buffer;
      if (!(line.includes('Deprecation Warning') && line.includes('@import')) && !line.includes('repetitive deprecation warnings omitted')) {
        if (isStdout) process.stdout.write(line + '\n');
        else process.stderr.write(line + '\n');
      }
    }
  });
}

filterAndWrite(proc.stdout, true);
filterAndWrite(proc.stderr, false);

proc.on('close', (code) => {
  process.exit(code === null ? 1 : code);
});

