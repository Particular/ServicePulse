import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: "app-constants-js-cache-busting",
      transformIndexHtml(html) {
        const cachebuster = Math.round(new Date().getTime() / 1000);
        return html.replace(
          /app.constants.js/,
          "app.constants.js?" + cachebuster,
        );
      },
    },
  ],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
      {
        find: "~bootstrap",
        replacement: path.resolve(__dirname, "node_modules/bootstrap"),
      },
      {
        find: "~bootstrap-icons",
        replacement: path.resolve(__dirname, "node_modules/bootstrap-icons"),
      },
    ],
  },
  base: "./",
  build: {
    outDir: "../app",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: ["./js/app.constants.js"],
    },
  },
  server: {
    host: true,
    fs: {
      // Allow serving files from one level up to the project root
      allow: [".."],
    },
  },
});
