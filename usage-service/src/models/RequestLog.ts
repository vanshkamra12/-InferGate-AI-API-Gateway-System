import mongoose, { Document, Schema } from "mongoose";

export interface IRequestLog extends Document {
  userId: string;
  tokensUsed: number;
  responseTimeMs: number;
  status: "SUCCESS" | "FAILED";
  createdAt: Date;
}

const RequestLogSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    tokensUsed: { type: Number, required: true },
    responseTimeMs: { type: Number, required: true },
    status: { type: String, enum: ["SUCCESS", "FAILED"], required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IRequestLog>("RequestLog", RequestLogSchema);
