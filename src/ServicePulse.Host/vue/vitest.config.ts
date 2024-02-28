import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";
import path from "path";
import viteConfig from "./vite.config.js";
import path from "path";
export default defineConfig({
  ...viteConfig,
  resolve: {
    alias: [
      {
        find: "@component-test-utils", replacement: "/test/utils.ts"
      },
      {
        find: "@",
        replacement: path.resolve(__dirname, './src'),
      },
    ],
  },
  test: {
    globals: true,
    clearMocks: true,
    css: true,
    coverage: {
      all: true,
      exclude: [`**/__test__/**/*`, `**/.eslintrc.js`, `**/*.spec.ts`, `test/**/*`],
      provider: `v8`,
      reporter: [`html`, `text`],
    },
    environment: `jsdom`,
    setupFiles: [`./test/drivers/vitest/setup.ts`],
  },
});
