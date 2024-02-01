/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  ignorePatterns: ["node_modules/**/*", "dist/**/*", "*.ts"],
  extends: ["plugin:vue/vue3-essential", "eslint:recommended", "plugin:@typescript-eslint/recommended", "@vue/eslint-config-prettier/skip-formatting"],
  parser: "vue-eslint-parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaVersion: "latest",
    parser: "@typescript-eslint/parser",
    extraFileExtensions: [".vue"],
  },
  rules: {
    "prettier/prettier": "error",
    "prefer-rest-params": "warn",
    "prefer-spread": "warn",
    "no-var": "warn",
    "prefer-const": "warn",
    eqeqeq: ["warn", "smart"],
  },
};
