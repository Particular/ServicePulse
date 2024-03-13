import { defineConfig } from "vitest/config";
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
    pool: 'forks', //https://github.com/vitest-dev/vitest/issues/2008#issuecomment-187106690
    globals: true,
    clearMocks: true,
    css: true,
    coverage: {
      all: true,
      exclude: [`**/__test__/**/*`, `**/.eslintrc.js`, `**/*.spec.ts`, `test/**/*`],
      provider: `v8`,
      reporter: ["text","text-summary","cobertura"],
    },
    environment: `jsdom`,
    setupFiles: [`./test/drivers/vitest/setup.ts`],
  },
});
