// ESLint v9 flat config

// Base
const js = require('@eslint/js');
const globals = require('globals');

// TypeScript
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

// Plugins
const importPlugin = require('eslint-plugin-import');
const unicorn = require('eslint-plugin-unicorn');
const promise = require('eslint-plugin-promise');
const security = require('eslint-plugin-security');
const sonarjs = require('eslint-plugin-sonarjs');
const eslintComments = require('eslint-plugin-eslint-comments');
const preferArrow = require('eslint-plugin-prefer-arrow');

// Import resolver (TypeScript)
require('eslint-import-resolver-typescript');

module.exports = [
  // Ignore patterns
  { ignores: ['build/**', 'node_modules/**', 'dist/**', 'coverage/**'] },

  // Base JS recommended
  js.configs.recommended,

  // TypeScript with type-aware rules
  {
    name: 'typescript-setup',
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: { ...globals.node, ...globals.es2022 },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
      unicorn,
      promise,
      security,
      sonarjs,
      'eslint-comments': eslintComments,
      'prefer-arrow': preferArrow,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.eslint.json',
        },
      },
    },
    rules: {
      // General rigor
      'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'prefer-template': 'error',
      'object-shorthand': ['error', 'always'],

      // Prefer arrow functions
      'prefer-arrow/prefer-arrow-functions': [
        'error',
        { disallowPrototype: true, singleReturnOnly: false, classPropertiesAllowed: false },
      ],

      // Typescript specific
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/no-unnecessary-condition': [
        'error',
        { allowConstantLoopConditions: true },
      ],
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        { ignorePrimitives: { string: true } },
      ],
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',

      // Imports
      'import/no-default-export': 'error',
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          groups: [
            ['builtin', 'external'],
            ['internal'],
            ['parent', 'sibling', 'index', 'object', 'type'],
          ],
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // Unicorn tweaks for Node CLI
      'unicorn/prefer-module': 'off',
      'unicorn/prevent-abbreviations': [
        'error',
        { allowList: { args: true, params: true, env: true } },
      ],
      'unicorn/no-array-reduce': 'off',

      // Promise
      'promise/prefer-await-to-then': 'error',

      // Security
      // Keep plugin active; recommended flat config is not provided, so we enforce key rules manually if needed

      // SonarJS provides a flat config; we use it below
    },
  },
];
