import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

const restrictedCoreImports = {
  patterns: [
    {
      group: ['@nestjs/*', 'mongoose', 'bcrypt', 'jsonwebtoken'],
      message: 'Domain and application layers must stay framework-agnostic.',
    },
    {
      group: ['**/infrastructure/**', '**/infrastructure'],
      message: 'Domain and application layers cannot depend on infrastructure.',
    },
  ],
};

const restrictedDomainImports = {
  patterns: [
    ...restrictedCoreImports.patterns,
    {
      group: ['**/application/**', '**/application'],
      message: 'Domain layer cannot depend on application.',
    },
  ],
};

export default defineConfig(
  { ignores: ['dist/', 'coverage/', 'node_modules/', 'eslint.config.js'] },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true },
      ],
      '@typescript-eslint/no-extraneous-class': [
        'error',
        { allowWithDecorator: true },
      ],
      'no-console': 'error',
      eqeqeq: ['error', 'always'],
      complexity: ['error', 8],
      'max-depth': ['error', 3],
      'max-lines-per-function': [
        'error',
        { max: 30, skipBlankLines: true, skipComments: true },
      ],
      'no-nested-ternary': 'error',
    },
  },
  {
    files: ['src/**/domain/**/*.ts', 'src/**/application/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', restrictedCoreImports],
    },
  },
  {
    files: ['src/**/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', restrictedDomainImports],
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
    languageOptions: { globals: globals.vitest },
    rules: {
      'max-lines-per-function': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  prettier,
);
