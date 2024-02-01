/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: ["plugin:vue/vue3-essential", "eslint:recommended", "@vue/eslint-config-prettier", "plugin:storybook/recommended"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  plugins: ["github"],
  rules: {
    "prettier/prettier": "error",
    "require-await": "error",
    "no-await-in-loop": "error",
    "github/no-then": "error",
  },
};
