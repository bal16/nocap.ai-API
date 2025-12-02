import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
      },
    },

    rules: {
      'quotes': ['error', 'single'],
      'no-console': 'warn',
    },
  },
]);
