import mongoose, { Document, Schema } from "mongoose";

export interface IUsage extends Document {
  userId: string;
  monthlyTokenLimit: number;
  usedTokens: number;
  lastResetDate: Date;
}

const UsageSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    monthlyTokenLimit: { type: Number, required: true },
    usedTokens: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model<IUsage>("Usage", UsageSchema);
