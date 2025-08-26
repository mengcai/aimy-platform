module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'next/core-web-vitals',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
  },
  env: {
    node: true,
    browser: true,
    es2022: true,
  },
  ignorePatterns: [
    'dist/',
    'build/',
    'node_modules/',
    '.next/',
    'out/',
    '*.config.js',
    '*.config.ts',
  ],
};
