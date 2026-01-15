import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const isProduction = mode === 'production';

    return {
        plugins: [react()],
        base: '/', // UI will be served from root
        build: {
            outDir: isProduction
                ? path.resolve(__dirname, '../explorer-server/dist/ui')
                : 'dist',
            emptyOutDir: true,
            // Ensure assets are properly referenced
            assetsDir: 'assets',
        },
        server: {
            proxy: {
                '/api': {
                    target: 'http://127.0.0.1:4570',
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
    };
});
