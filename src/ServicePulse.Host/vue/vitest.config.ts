import { defineConfig } from "vitest/config";
import viteConfig from "./vite.config.js";
export default defineConfig({
  ...viteConfig,
  resolve: {
    alias: {
      "@application-test-utils": "/test/drivers/vitest/driver.ts",
    },
  },
  test: {
	pool: 'forks', //https://github.com/vitest-dev/vitest/issues/2008#issuecomment-1871066901     
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
