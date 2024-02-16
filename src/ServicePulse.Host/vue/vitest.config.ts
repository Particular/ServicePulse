import { defineConfig } from "vitest/config";
import viteConfig from "./vite.config.js";
export default defineConfig({
	...viteConfig,	
	test: {
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
