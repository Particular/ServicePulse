/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: ["plugin:vue/vue3-essential", "eslint:recommended", "@vue/eslint-config-prettier"],
  plugins: ["no-floating-promise"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "prettier/prettier": "error",
    "require-await": "error",
    "no-await-in-loop": "error",
    "no-floating-promise/no-floating-promise": "error",
  },
};
