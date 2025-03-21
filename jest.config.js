module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  testTimeout: 30000,
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: 'coverage',
  testEnvironmentOptions: {
    NODE_ENV: 'test',
    JWT_SECRET: 'test-secret-key',
    PORT: 3001
  },
  globals: {
    'process.env.JWT_SECRET': 'test-secret-key',
    'process.env.MONGODB_URI': 'mongodb://localhost:27017/test'
  }
}; 