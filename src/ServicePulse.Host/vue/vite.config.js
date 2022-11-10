import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        {
            name: 'app-constants-js-cache-busting',
            transformIndexHtml(html) {
                const cachebuster = Math.round(new Date().getTime() / 1000);
                return html.replace(
                    /app.constants.js/,
                    ('app.constants.js?' + cachebuster)
                );
            }
        }],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        }
    },
    build: {
        outDir: "../app",
        emptyOutDir: true,
        rollupOptions: {
            external: []
        }
    },
    server: {
        host: true,
        fs: {
            // Allow serving files from one level up to the project root
            allow: ['..']
        }
    }
});
