const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'app/node_modules/**',
      'app/lib/**',
      'lib/**',
      'built-tests/**',
      'coverage/**',
      'app/dist/**',
      'shared/lib/**',
      '**/*.config.js',
      '**/*.config.mjs',
      'eslint.config.js',
      '**/.eslintrc.js',
      'app/src/static/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  prettierConfig,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig-base.json', './src/tsconfig.json', './app/tsconfig.json', './shared/tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      prettier: prettier,
    },
    rules: {
      'no-console': 'error',
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-confusing-non-null-assertion': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-extraneous-class': 'error',
      '@typescript-eslint/no-invalid-void-type': 'error',
      '@typescript-eslint/prefer-ts-expect-error': 'error',
      '@typescript-eslint/typedef': 'error',
      '@typescript-eslint/unified-signatures': 'error',
    },
  },
);