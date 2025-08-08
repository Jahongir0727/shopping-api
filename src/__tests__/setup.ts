import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  // We can safely assert the connection exists since we connect in beforeAll
  const collections = await (mongoose.connection.db as mongoose.mongo.Db).collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});
