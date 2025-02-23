import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, connecting: false };
}

const connectWithRetry = async (retries = 5, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await connectToDb();
      return;
    } catch (err) {
      console.log(`Connection attempt ${i + 1} failed. Retrying in ${delay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Failed to connect to MongoDB after multiple attempts.');
};

export const connectToDb = async () => {
  if (cached.conn) {
    if (cached.conn.connection.readyState === 1) {
      console.log("Using existing connection");
      resetDisconnectTimer();
      return cached.conn;
    } else {
      console.log("Existing connection is not open, reconnecting...");
      cached.conn = null;
    }
  }

  if (cached.connecting) {
    console.log("Connection attempt already in progress");
    return cached.promise;
  }

  cached.connecting = true;

  if (!cached.promise) {
    const opts = {
      maxPoolSize: 10,
      connectTimeoutMS: 300000,
      socketTimeoutMS: 300000,
      serverSelectionTimeoutMS: 300000,
    };

    cached.promise = mongoose.connect(process.env.NEXT_PUBLIC_MONGO, opts).then((mongoose) => {
      cached.conn = mongoose;
      cached.connecting = false;
      resetDisconnectTimer();
      console.log("Connected to database");
      return mongoose;
    }).catch((error) => {
      cached.connecting = false;
      console.log(error);
      throw error;
    });
  }

  return cached.promise;
};

export const disconnectFromDb = async () => {
  if (cached.conn) {
    try {
      await mongoose.disconnect();
      cached.conn = null;
      cached.promise = null;
      console.log("Disconnected from database");
    } catch (error) {
      console.log(error);
    }
  }
};

let disconnectTimeout;

const resetDisconnectTimer = () => {
  if (disconnectTimeout) {
    clearTimeout(disconnectTimeout);
  }
  disconnectTimeout = setTimeout(async () => {
    await disconnectFromDb();
  }, 10 * 60 * 1000); // 5 minutes
};

// Call connectWithRetry to connect with retry logic
connectWithRetry().catch(err => {
  console.error('Unable to establish MongoDB connection:', err);
});
