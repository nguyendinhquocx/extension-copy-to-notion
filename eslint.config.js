module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2020: true,
    webextensions: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules', 'build'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['react-refresh', '@typescript-eslint'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    
    // Vietnamese naming convention rules
    'camelcase': ['error', { 
      properties: 'never',
      ignoreDestructuring: true,
      allow: [
        // Vietnamese camelCase patterns
        '^[a-z][a-zA-Z]*$',
        // Vietnamese snake_case patterns cho variables
        '^[a-z][a-z_]*[a-z]$',
        // Vietnamese PascalCase cho classes/components
        '^[A-Z][a-zA-Z]*$'
      ]
    }],
    
    // Code quality rules
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // Import organization
    'sort-imports': ['error', {
      ignoreCase: true,
      ignoreDeclarationSort: true,
      ignoreMemberSort: false,
      memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      allowSeparatedGroups: true
    }],
    
    // Console statements (allow in development)
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    
    // Extension specific rules
    'no-restricted-globals': ['error', 'window', 'document'],
    'no-restricted-syntax': [
      'error',
      {
        selector: "CallExpression[callee.name='eval']",
        message: 'eval() is not allowed in extensions for security reasons'
      }
    ]
  },
  
  // Override rules cho specific file patterns
  overrides: [
    {
      files: ['src/background/**/*.ts'],
      rules: {
        'no-restricted-globals': 'off' // Background scripts can use globals
      }
    },
    {
      files: ['src/content/**/*.ts'],
      rules: {
        'no-restricted-globals': 'off' // Content scripts can use DOM globals
      }
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off'
      }
    }
  ]
};
