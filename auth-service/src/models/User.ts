import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  apiKey: string;
  plan: "FREE" | "PRO";
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    apiKey: { type: String, required: true, unique: true },
    plan: { type: String, enum: ["FREE", "PRO"], default: "FREE" },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
