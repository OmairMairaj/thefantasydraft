import mongoose from "mongoose"
const connection = {};

export const connectToDb = async () => {
  try {
    if(connection.isConnected) {
      // console.log("Using existing connection");
      return;
    }
    const db = await mongoose.connect(process.env.NEXT_PUBLIC_MONGO)
    connection.isConnected = db.connections[0].readyState;
    return;
  } catch (error) {
    console.log(error);
    return;
  }
};