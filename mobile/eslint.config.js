// Lightweight ESLint config for the Expo app
// If you prefer, replace with your team's rules.
module.exports = {
    root: true,
    extends: [
        "universe/native",
        "plugin:@typescript-eslint/recommended",
        "plugin:react-hooks/recommended",
    ],
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
    },
    rules: {
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
};
