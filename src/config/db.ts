import mongoose from "mongoose";
import { DB_URI } from "../utils/env";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    const dbURI = DB_URI || process.env.DB_URI;
    console.log("Connecting to MongoDB...");
    if (!dbURI) {
      console.error("❌ DB_URI is not defined in environment variables");
      process.exit(1);
    }
    await mongoose.connect(dbURI);

    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
 