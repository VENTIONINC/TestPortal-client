import fs from 'node:fs';
import path from 'node:path';

import {
  ensureParentDirectory,
  fail,
  getHeaderForExtension,
  getSupportedExtensions,
  normalizeHeader,
} from './license-header-utils.js';

const args = process.argv.slice(2);
const targetArg = args[0] === '--' ? args[1] : args[0];

if (!targetArg) {
  fail('Usage: yarn new:file -- <path>');
}

const targetPath = path.resolve(process.cwd(), targetArg);
const extension = path.extname(targetPath).toLowerCase();
const header = getHeaderForExtension(targetPath);

if (!header) {
  const supportedExtensions = getSupportedExtensions().join(', ');
  fail(`Unsupported extension '${extension || '(none)'}'. Supported extensions: ${supportedExtensions}`);
}

if (fs.existsSync(targetPath)) {
  fail(`File already exists: ${targetArg}`);
}

ensureParentDirectory(targetPath);
fs.writeFileSync(targetPath, normalizeHeader(header), 'utf8');

console.log(`Created ${path.relative(process.cwd(), targetPath)}`);
