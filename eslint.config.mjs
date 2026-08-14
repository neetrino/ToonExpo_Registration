import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  {
    files: ['src/app/apple-icon.tsx', 'src/app/opengraph-image.tsx', 'src/lib/brand/create-brand-icon.tsx'],
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'src/generated/**',
    ],
  },
];

export default eslintConfig;
