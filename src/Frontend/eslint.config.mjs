import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default tseslint.config({
  ignores: ["node_modules/**/*", "dist/**/*", "/public/js/app.constants.js"],
  files: ["**/*.{js,mjs,ts,vue}"],
  languageOptions: { globals: globals.browser, ecmaVersion: "latest", parserOptions: { parser: tseslint.parser } },
  extends: [pluginJs.configs.recommended, ...tseslint.configs.recommended, ...pluginVue.configs["flat/essential"], eslintPluginPrettierRecommended],
  rules: {
    "require-await": "error",
    "no-await-in-loop": "warn",
    "prefer-rest-params": "error",
    "prefer-spread": "error",
    "no-var": "error",
    "prefer-const": "error",
    eqeqeq: ["error", "smart"],
    "no-throw-literal": "warn",
  },
});
