#!/usr/bin/env node

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const packages = [
  { name: 'root', path: resolve(root, 'package.json') },
  { name: 'web', path: resolve(root, 'web/package.json') },
  { name: 'server', path: resolve(root, 'server/package.json') },
];

const versions = packages.map(({ name, path }) => {
  const { version } = JSON.parse(readFileSync(path, 'utf8'));
  return { name, version };
});

const allMatch = versions.every((v) => v.version === versions[0].version);

if (allMatch) {
  console.log(`✓ All packages at v${versions[0].version}`);
  process.exit(0);
} else {
  console.error('✗ Version mismatch:');
  for (const { name, version } of versions) {
    console.error(`  ${name}: ${version}`);
  }
  process.exit(1);
}
