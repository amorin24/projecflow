import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'off', // TypeScript handles this with ts(6133)
      '@typescript-eslint/no-unused-vars': 'warn', // Downgrade to warning
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      '@typescript-eslint/no-explicit-any': 'warn', // Downgrade to warning for CI
      'no-undef': 'warn', // Downgrade to warning for CI
      '@typescript-eslint/no-require-imports': 'warn', // Downgrade to warning for CI
    },
    ignores: ['dist/**', 'node_modules/**'],
  },
  // Add Cypress environment configuration
  {
    files: ['**/*.cy.{js,jsx,ts,tsx}', '**/cypress/**/*.{js,jsx,ts,tsx}', '**/tests/e2e/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        cy: 'readonly',
        Cypress: 'readonly',
        it: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        window: 'readonly',
      },
    },
  },
  // Add Node.js environment for config files
  {
    files: ['*.js', '*.cjs', '*.mjs'],
    languageOptions: {
      globals: {
        module: 'writable',
        require: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
  }
);
