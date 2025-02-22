import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, connecting: false };
}

export const connectToDb = async () => {
  if (cached.conn) {
    console.log("Using existing connection");
    resetDisconnectTimer();
    return cached.conn;
  }

  if (cached.connecting) {
    console.log("Connection attempt already in progress");
    return cached.promise;
  }

  cached.connecting = true; // Set the lock

  if (!cached.promise) {
    const opts = {
      maxPoolSize: 10,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
    };


    cached.promise = await mongoose.connect(process.env.NEXT_PUBLIC_MONGO, opts).then((mongoose) => {
      cached.conn = mongoose;
      cached.connecting = false; // Release the lock
      resetDisconnectTimer();
      console.log("Connected to database");
      return mongoose;
    }).catch((error) => {
      cached.connecting = false; // Release the lock on error
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
  }, 5 * 60 * 1000); // 5 minutes
};