#!/usr/bin/env node

/**
 * Script to verify UI assets are in place after build.
 * Vite is configured to build directly to apps/explorer-server/dist/ui,
 * so this script primarily verifies the build completed successfully.
 */

import {
    existsSync,
    readFileSync,
    writeFileSync,
    readdirSync,
    statSync,
} from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const uiDistPath = join(rootDir, 'apps/explorer-server/dist/ui');
const uiIndexPath = join(uiDistPath, 'index.html');
const serverDistPath = join(rootDir, 'apps/explorer-server/dist');

console.log('Verifying UI build and fixing ESM imports...');

// Function to add .js extensions to relative imports in JS files
function fixEsmImports(dirPath) {
    const files = readdirSync(dirPath);

    for (const file of files) {
        const filePath = join(dirPath, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            fixEsmImports(filePath);
        } else if (extname(file) === '.js') {
            let content = readFileSync(filePath, 'utf8');
            let modified = false;

            // Fix relative imports that don't have .js extensions
            content = content.replace(
                /from '(\.\.?[^']*?)'/g,
                (match, importPath) => {
                    // Add .js if it's a relative import without .js extension
                    if (
                        (importPath.startsWith('./') ||
                            importPath.startsWith('../')) &&
                        !importPath.endsWith('.js')
                    ) {
                        modified = true;
                        return `from '${importPath}.js'`;
                    }
                    return match;
                }
            );

            if (modified) {
                writeFileSync(filePath, content, 'utf8');
                console.log('✅ Fixed ESM imports in:', filePath);
            }
        }
    }
}

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

// Fix ESM imports in server dist
console.log('🔧 Fixing ESM imports in server dist...');
fixEsmImports(serverDistPath);

console.log('✅ UI assets verified at:', uiDistPath);
console.log('✅ ESM imports fixed!');
console.log('✅ Build complete!');
