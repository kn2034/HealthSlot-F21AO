module.exports = {
  testTimeout: 30000,
  testEnvironment: "node",
  setupFilesAfterEnv: ["./test-setup/jest.setup.js"],
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  testMatch: [
    "**/src/__tests__/**/*.test.js",
    "**/test/**/*.spec.js"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/test-setup/"
  ],
  globalSetup: "./test-setup/jest.global-setup.js",
  globalTeardown: "./test-setup/jest.global-teardown.js",
  reporters: [
    "default",
    ["jest-junit", {
      outputDirectory: "test-results",
      outputName: "jest-junit.xml",
      ancestorSeparator: " › ",
      uniqueOutputName: "false",
      suiteNameTemplate: "{filepath}",
      classNameTemplate: "{classname}",
      titleTemplate: "{title}"
    }]
  ]
}; 