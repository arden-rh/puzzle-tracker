import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Simplified Vite config for Docker builds - no SSL certificate generation
export default defineConfig({
    base: '/', // Serve from root
    plugins: [
        plugin(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        assetsDir: 'assets', // Explicitly set assets directory
        manifest: false,
        rollupOptions: {
            output: {
                manualChunks: undefined, // Single bundle for simplicity
            }
        }
    }
});
