import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB Connected (Auth Service)");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};
