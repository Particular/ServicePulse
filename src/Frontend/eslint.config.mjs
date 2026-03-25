import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import noRawFetch from "./eslint-rules/no-raw-fetch.ts";

const localPlugin = {
  rules: {
    "no-raw-fetch": noRawFetch,
  },
};

// Configure console rule: error in CI to catch leftover debug calls before merge,
// off locally so developers get no IDE warnings and can use console freely during development.
const consoleRuleSeverity = process.env.CI === "true" ? "error" : "off";

export default tseslint.config(
  {
    ignores: ["node_modules/**", "dist/**", "public/js/app.constants.js", "public/mockServiceWorker.js"],
  },
  {
    files: ["**/*.{js,mjs,ts,vue}"],
    languageOptions: { globals: globals.browser, ecmaVersion: "latest", parserOptions: { parser: tseslint.parser } },
    plugins: {
      local: localPlugin,
    },
    extends: [pluginJs.configs.recommended, ...tseslint.configs.recommended, ...pluginVue.configs["flat/essential"], eslintPluginPrettierRecommended],
    rules: {
      "no-duplicate-imports": "error",
      "require-await": "error",
      "no-await-in-loop": "warn",
      "prefer-rest-params": "error",
      "prefer-spread": "error",
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "smart"],
      "no-throw-literal": "warn",
      "local/no-raw-fetch": "error",
      "no-console": consoleRuleSeverity,
    },
  }
);
