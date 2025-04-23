
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'off', // TypeScript handles this with ts(6133)
      '@typescript-eslint/no-unused-vars': 'warn',
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    },
    ignores: ['dist/**', 'node_modules/**'],
  }
);
