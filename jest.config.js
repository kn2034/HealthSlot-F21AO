module.exports = {
  testTimeout: 30000,
  testEnvironment: "node",
  setupFilesAfterEnv: ["./jest.setup.js"],
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  testPathIgnorePatterns: ["/node_modules/"],
  globalSetup: "./jest.global-setup.js",
  globalTeardown: "./jest.global-teardown.js",
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