import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import checker from "vite-plugin-checker";

function createCSPOverrides(hostPort: number, configuredDestinations: string[]) {
  const destinations = configuredDestinations.join(" ");

  return (
    "default-src 'none';" +
    `connect-src ws://localhost:${hostPort} https://platformupdate.particular.net ${destinations} 'self';` +
    "font-src 'self' data:;" +
    `img-src data: 'self';` +
    `script-src eval: inline: https://platformupdate.particular.net ${destinations} 'self' 'unsafe-eval' 'unsafe-inline';` +
    `style-src inline: 'self' 'unsafe-inline';` +
    "worker-src 'self';" +
    "block-all-mixed-content;" +
    "sandbox allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads;"
  );
}

const port = 5173;
const defaultUrls = [
  "http://10.211.55.3:*", // The default Parallels url to access Windows VM
  "http://localhost:*",
];

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    devSourcemap: true,
  },
  plugins: [
    vue(),
    checker({ overlay: { initialIsOpen: "error" }, vueTsc: { tsconfigPath: "tsconfig.app.json" }, eslint: { lintCommand: "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --ignore-path .gitignore" } }),
    {
      name: "app-constants-js-cache-busting",
      transformIndexHtml(html) {
        const cachebuster = Math.round(new Date().getTime() / 1000);
        return html.replace(/app.constants.js/, "app.constants.js?" + cachebuster);
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
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: ["./js/app.constants.js"],
    },
  },
  server: {
    headers: {
      "Content-Security-Policy": createCSPOverrides(port, defaultUrls),
    },
    host: true,
    port: port,
    fs: {
      // Allow serving files from one level up to the project root
      allow: [".."],
    },
  },
});
