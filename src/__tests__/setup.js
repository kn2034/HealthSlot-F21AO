const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../../app');
let mongod;
let server;

// Connect to the in-memory database and start server
module.exports.connect = async () => {
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    // Set environment variables
    process.env.MONGODB_URI = uri;
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3001';
    
    await mongoose.connect(uri);

    // Start server on a different port for tests
    server = app.listen(3001);
    return server;
  } catch (error) {
    console.error('Error in test setup:', error);
    throw error;
  }
};

// Close the database and server
module.exports.closeDatabase = async () => {
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    if (mongod) {
      await mongod.stop();
    }
  } catch (error) {
    console.error('Error in test cleanup:', error);
    throw error;
  }
};

// Clear all data in the database
module.exports.clearDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  }
}; 