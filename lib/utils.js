import mongoose from "mongoose";
const connection = {};
let disconnectTimeout;

export const connectToDb = async () => {
  if (connection.isConnected) {
    console.log("Using existing connection");
    resetDisconnectTimer();
    return;
  }
  try {
    const db = await mongoose.connect(process.env.NEXT_PUBLIC_MONGO);
    connection.isConnected = db.connections[0].readyState;
    resetDisconnectTimer();
    console.log("Connected to database");
  } catch (error) {
    console.log(error);
  }
};

export const disconnectFromDb = async () => {
  if (connection.isConnected) {
    try {
      await mongoose.disconnect();
      connection.isConnected = false;
      console.log("Disconnected from database");
    } catch (error) {
      console.log(error);
    }
  }
};

const resetDisconnectTimer = () => {
  if (disconnectTimeout) {
    clearTimeout(disconnectTimeout);
  }
  disconnectTimeout = setTimeout(async () => {
    await disconnectFromDb();
  }, 5 * 60 * 1000); // 5 minutes
};