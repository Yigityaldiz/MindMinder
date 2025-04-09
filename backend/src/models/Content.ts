import mongoose, { Schema, Document } from "mongoose";
import { describe } from "node:test";

export interface IContent extends Document {
  title: string;
  description?: string;
  contentType: "document" | "audio";
  fileUrl: string;
  categories: string[];
  tags: string[];
  publishedAt: Date;
  learningStyle: "visual" | "auditory" | "kinesthetic" | string;
  user: mongoose.Types.ObjectId;
}

const ContentSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  contentType: { type: String, required: true, enum: ["document", "audio"] },
  fileUrl: { type: String, required: true },
  categories: [{ type: String }],
  tags: [{ type: String }],
  publishedAt: { type: Date, default: Date.now },
  learningStyle: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", require: true },
});

export default mongoose.model<IContent>("Content", ContentSchema);
