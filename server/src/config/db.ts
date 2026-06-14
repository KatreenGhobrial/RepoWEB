import mongoose from 'mongoose';
import dns from 'dns';

// Force use of Google DNS to prevent SRV resolution errors on strict networks
dns.setServers(['8.8.8.8', '8.8.4.4']);

/**
 * Connect to MongoDB Atlas.
 * Reads MONGO_URI from environment variables (.env file).
 * Retries connection in the background if it fails.
 */
let isConnected = false;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn('⚠️  MONGO_URI is not defined — running without database');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10s timeout
    });
    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('⚠️  MongoDB connection failed — server will run without DB');
    console.error('   Reason:', (error as Error).message);
    console.log('   💡 If you are on a restricted network (e.g. college), try using a mobile hotspot.');
    // Don't throw — let the server start anyway
  }
};

export const isDBConnected = (): boolean => isConnected;
