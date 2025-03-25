import mongoose, { Document, Schema } from "mongoose";

export interface IAnalysisResult extends Document {
  userId: mongoose.Types.ObjectId;
  originalText: string;
  summary: string;
  keywords: string[];
  embeddings: number[];
  createdAt: Date;
  updatedAt?: Date;
}

const AnalysisResultSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  originalText: { type: String, required: true },
  summary: { type: String, required: true },
  keywords: [{ type: String }],
  embeddings: [{ type: Number }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

AnalysisResultSchema.index({ embeddings: "2dsphere" });

export default mongoose.model<IAnalysisResult>(
  "AnalysisResult",
  AnalysisResultSchema
);
