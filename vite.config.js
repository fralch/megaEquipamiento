import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
        host: "0.0.0.0", // Escucha en todas las IPs
        port: 5173, // Puerto de Vite
        strictPort: true, // Usa siempre este puerto
      },
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
});
