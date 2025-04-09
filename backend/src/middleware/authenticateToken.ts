import { type Request, type Response, type NextFunction } from "express";

import { verifyToken } from "../utils/tokenUtils";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = await verifyToken(token);

    req.user = payload;
    next();
  } catch (err) {
    console.log("Authentication error", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
}
