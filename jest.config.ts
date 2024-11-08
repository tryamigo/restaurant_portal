module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // This resolves @ as the root directory for imports
    '\\.css$': 'identity-obj-proxy', // Mock CSS imports (for Jest)
  },

  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
    '^.+\\.jsx?$': 'babel-jest', // Ensure Jest transforms JS/JSX files
  },

  collectCoverageFrom: [
    'pages/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
  ],

  setupFilesAfterEnv: ['@testing-library/jest-dom'], // Correct setup for jest-dom
};
