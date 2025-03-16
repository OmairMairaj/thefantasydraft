import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, connecting: false };
}

// const connectWithRetry = async (retries = 5, delay = 3000) => {
//   for (let i = 0; i < retries; i++) {
//     try {
//       await connectToDb();
//       return;
//     } catch (err) {
//       console.log(`Connection attempt ${i + 1} failed. Retrying in ${delay / 1000} seconds...`);
//       await new Promise(resolve => setTimeout(resolve, delay));
//     }
//   }
//   throw new Error('Failed to connect to MongoDB after multiple attempts.');
// };

const connectWithRetry = async (retries = 5, initialDelay = 2000) => {
  if (cached.connecting) {
    // console.log("Retry is already in progress. Waiting for the existing attempt...");
    return cached.promise; // Wait for the ongoing connection attempt
  }

  let delay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      // console.log(`Connection attempt ${i + 1} in progress with a delay of ${delay / 1000} seconds...`);
      await connectToDb();
      return; // Successfully connected
    } catch (err) {
      console.log(`Connection attempt ${i + 1} failed`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff: double the delay with each retry
    }
  }
  throw new Error('Failed to connect to MongoDB after multiple retry attempts.');
};


// export const connectToDb = async () => {
//   if (cached.conn) {
//     if (cached.conn.connection.readyState === 1) {
//       console.log("Using existing connection");
//       resetDisconnectTimer();
//       return cached.conn;
//     } else {
//       console.log("Existing connection is not open, reconnecting...");
//       cached.conn = null;
//     }
//   }

//   if (cached.connecting) {
//     console.log("Connection attempt already in progress");
//     return cached.promise;
//   }

//   cached.connecting = true;

//   if (!cached.promise) {
//     const opts = {
//       maxPoolSize: 10,
//       connectTimeoutMS: 300000,
//       socketTimeoutMS: 300000,
//       serverSelectionTimeoutMS: 300000,
//     };

//     cached.promise = mongoose.connect(process.env.NEXT_PUBLIC_MONGO, opts).then((mongoose) => {
//       cached.conn = mongoose;
//       cached.connecting = false;
//       resetDisconnectTimer();
//       console.log("Connected to database");
//       return mongoose;
//     }).catch((error) => {
//       cached.connecting = false;
//       console.log(error);
//       throw error;
//     });
//   }

//   return cached.promise;
// };

export const connectToDb = async () => {
  if (cached.conn && cached.conn.connection.readyState === 1) {
    console.log("Using existing connection");
    resetDisconnectTimer();
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = new Promise(async (resolve, reject) => {
      try {
        // console.log("Establishing new connection...");
        const opts = {
          maxPoolSize: 10,
          connectTimeoutMS: 300000,
          socketTimeoutMS: 300000,
          serverSelectionTimeoutMS: 300000,
        };
        const mongooseInstance = await mongoose.connect(process.env.NEXT_PUBLIC_MONGO, opts);
        console.log("Connected to database");
        cached.conn = mongooseInstance;
        resetDisconnectTimer();
        resolve(mongooseInstance);
      } catch (error) {
        cached.conn = null;
        reject(error);
      }
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
  }, 600 * 1000); // 10 minutes
};

// Call connectWithRetry to connect with retry logic
connectWithRetry().catch(err => {
  console.error('Unable to establish MongoDB connection:', err);
});
