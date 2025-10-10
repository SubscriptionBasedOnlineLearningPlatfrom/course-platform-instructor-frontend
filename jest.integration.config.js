export default {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/src/__tests__/selenium/**/*.test.js'
  ],
  setupFilesAfterEnv: [],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  extensionsToTreatAsEsm: ['.jsx'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
};