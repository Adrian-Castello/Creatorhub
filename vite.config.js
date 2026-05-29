import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// base set to './' so the app works under GitHub Pages subpaths.
export default defineConfig({
    plugins: [react()],
    base: './',
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ['react', 'react-dom', 'react-router-dom'],
                    charts: ['recharts'],
                    motion: ['framer-motion'],
                    supabase: ['@supabase/supabase-js'],
                },
            },
        },
    },
});
