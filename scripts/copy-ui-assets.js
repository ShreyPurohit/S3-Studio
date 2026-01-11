#!/usr/bin/env node

/**
 * Script to verify UI assets are in place after build.
 * Vite is configured to build directly to apps/explorer-server/dist/ui,
 * so this script primarily verifies the build completed successfully.
 */

import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const uiDistPath = join(rootDir, 'apps/explorer-server/dist/ui');
const uiIndexPath = join(uiDistPath, 'index.html');

console.log('Verifying UI build...');

if (!existsSync(uiDistPath)) {
    console.error('❌ UI dist directory not found:', uiDistPath);
    console.error('   Make sure to run "pnpm build:ui" first');
    process.exit(1);
}

if (!existsSync(uiIndexPath)) {
    console.error('❌ UI index.html not found:', uiIndexPath);
    console.error('   UI build may have failed');
    process.exit(1);
}

console.log('✅ UI assets verified at:', uiDistPath);
console.log('✅ Build complete!');
