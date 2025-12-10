import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'build/**'],
  },

  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  {
    rules: {
      '@typescript-eslint/ban-ts-comment': [
        'warn',
        {
          'ts-ignore': false,
          'ts-expect-error': true,
          'ts-nocheck': true,
          'ts-check': false,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
];
