const tsParser = require('@typescript-eslint/parser')

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'out/**',
      'drizzle/meta/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',

    },
    rules: {
      'max-lines': ['error', { max: 100, skipBlankLines: false, skipComments: false }],
    },
  },
  {
    files: ['src/components/ui/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'max-lines': 'off',
    },
  },
]
