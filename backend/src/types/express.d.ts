// src/types/express.d.ts
import { User } from "../models/User";

declare global {
  namespace Express {
    export interface Request {
      user?: {
        _id: string;
        email: string;
        role: string;
      };
    }
  }
}
