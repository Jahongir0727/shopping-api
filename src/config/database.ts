import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    // Use actual MongoDB instance for development
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-cart';

    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected...');

  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error disconnecting from MongoDB:', err);
  }
};
