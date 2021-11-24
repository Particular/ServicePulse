module.exports = {
    "env": {
        "browser": true,
        "es6": false,
        "node": false,
        "jquery": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 5,
        "sourceType": "script"
    },
    "rules": {
        "no-unused-vars": ["error", { "argsIgnorePattern": "$" }]
    },
    "ignorePatterns": ["*.dist.js"],
};
