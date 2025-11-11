module.exports = {
  root: true,
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'out/',
    'drizzle/meta/**',
  ],
  overrides: [
    {
      files: ['**/*.{ts,tsx,js,jsx}'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      rules: {
        'max-lines': ['error', { max: 100, skipBlankLines: false, skipComments: false }],
      },
    },
    {
      // Exception: les composants UI peuvent dépasser 100 lignes
      files: ['src/components/ui/**/*.{ts,tsx,js,jsx}'],
      rules: {
        'max-lines': 'off',
      },
    },
  ],
}

