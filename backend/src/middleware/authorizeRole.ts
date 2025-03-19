// src/middleware/authorizeRole.ts

import { type Request, type Response, type NextFunction } from "express";
import { jwtVerify } from "jose";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export function authorizeRole(requiredRole: string) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const { payload } = await jwtVerify(token, secret);

      // Payload'da rol bilgisi var mı kontrol et
      if (payload.role !== requiredRole) {
        return res
          .status(403)
          .json({ message: "Forbidden: Insufficient permissions." });
      }

      // Eğer yetkilendirme başarılıysa, req.user'a payload'ı ekleyin
      req.user = payload;
      next();
    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}
