#!/usr/bin/env node
/**
 * scripts/ensure-app-version.mjs — make src/generated/app-version.ts exist
 *
 * src/generated/app-version.ts is a build-time artifact (gitignored since
 * 2026-10-31): `npm run build` creates it via prebuild, but dev / typecheck /
 * test entry points on a FRESH CLONE would fail to import it (Footer.tsx).
 * This hook regenerates it only when missing; it is a no-op otherwise.
 */
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, 'src', 'generated', 'app-version.ts');

if (!existsSync(target)) {
  execSync('node scripts/write-version.mjs', { cwd: root, stdio: 'inherit' });
  console.log('ensure-app-version: generated src/generated/app-version.ts');
}
