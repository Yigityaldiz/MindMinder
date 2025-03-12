import mongoose, { Schema, Document } from "mongoose";

export interface ILearningProfile {
  learningStyle: string;
  preferences: string[];
  surveyResult: any;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  learningProfile: ILearningProfile;
}
