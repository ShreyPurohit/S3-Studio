/** @type {import("prettier").Config} */
module.exports = {
    semi: true, // ✅ semicolons
    singleQuote: true,
    trailingComma: 'es5',
    printWidth: 80,
    tabWidth: 4, // ✅ 4 spaces
    useTabs: false,
    arrowParens: 'always',
    endOfLine: 'lf',

    overrides: [
        {
            files: '*.json',
            options: {
                trailingComma: 'none',
                tabWidth: 2, // JSON usually stays at 2 spaces (recommended)
            },
        },
    ],
};
