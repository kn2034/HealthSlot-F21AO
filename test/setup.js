const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Configure chai
chai.use(chaiHttp);
chai.should();

let mongoServer;

// Global hooks
before(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: {
      dbName: 'test',
      storageEngine: 'wiredTiger'
    },
    binary: {
      version: process.env.MONGOMS_VERSION || '7.0.5',
      systemBinary: process.env.MONGOMS_SYSTEM_BINARY || '/opt/homebrew/bin/mongod'
    }
  });
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// Export commonly used testing utilities
module.exports = {
  chai,
  expect: chai.expect,
  app
}; 