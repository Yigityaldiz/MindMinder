import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface ILearningProfile {
  learningStyle: string;
  preferences: string[];
  surveyResults: any;
  quizResults?: Array<{
    quizId: string;
    score: number;
    takenAt: Date;
  }>;
  notes: mongoose.Types.ObjectId[];
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  learningProfile: ILearningProfile;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const LearningProfileShema: Schema = new Schema({
  learningStyle: { type: String, require: true },
  preferences: { type: [String], default: [] },
  surveyResults: { type: Schema.Types.Mixed },
  quizResult: [
    {
      quizId: { type: String, required: true },
      score: { type: Number, required: true },
      takenAt: { type: Date, required: true },
    },
  ],
  notes: [{ type: Schema.Types.ObjectId, ref: "Note" }],
});

const UserSchema: Schema = new Schema({
  name: { type: String, require: true },
  email: { type: String, require: true, unique: true },
  password: { type: String, require: true },
  learningProfile: { type: LearningProfileShema, default: {} },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    console.error("Password hashing error:", err);
    next(err as any);
  }
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
