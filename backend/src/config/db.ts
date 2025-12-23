import mongoose from "mongoose";

export const ConnectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL as string);
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("MongoDB Error:", err);
  }
};

