module.exports = {
  require: ['./test/setup.js'],
  timeout: 10000,
  exit: true,
  recursive: true,
  spec: ['test/**/*.spec.js'],
  reporter: 'spec',
  ui: 'bdd'
}; 