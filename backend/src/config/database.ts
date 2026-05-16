import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

let retryCount = 0;

export async function connectDatabase(): Promise<void> {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    retryCount = 0;
    console.log(`MongoDB connected successfully: ${mongoose.connection.host}`);
  } catch (error) {
    retryCount++;
    console.error(
      `MongoDB connection attempt ${retryCount}/${MAX_RETRIES} failed:`,
      error instanceof Error ? error.message : error,
    );

    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDatabase();
    }

    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
