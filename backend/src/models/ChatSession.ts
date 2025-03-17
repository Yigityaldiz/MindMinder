import { timeStamp } from "console";
import mongoose, { Schema, Document } from "mongoose";

export interface IConversation {
  question: string;
  answer: string;
  timestamp: Date;
}

export interface IChatSession extends Document {
  userId: mongoose.Types.ObjectId;
  topic: string;
  conversation: IConversation[];
  startedAt: Date;
  endedAt?: Date;
}

const ConversationSchema: Schema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ChatSessionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  topic: { type: String, required: true },
  conversation: [{ type: ConversationSchema, default: [] }],
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
});

export default mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);
