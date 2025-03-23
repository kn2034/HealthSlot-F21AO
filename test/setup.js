const chai = require('chai');
const chaiHttp = require('chai-http');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../app');

// Configure chai
chai.use(chaiHttp);
chai.should();

let mongoServer;

// Export commonly used testing utilities
module.exports = {
  chai,
  expect: chai.expect,
  app,
  
  // Setup hooks that can be used in describe blocks
  mochaHooks: {
    beforeAll: async function() {
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
      const mongoUri = await mongoServer.getUri();
      await mongoose.connect(mongoUri);
    },

    afterAll: async function() {
      await mongoose.disconnect();
      await mongoServer.stop();
    },

    beforeEach: async function() {
      // Clear all collections before each test
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany();
      }
    }
  }
}; 