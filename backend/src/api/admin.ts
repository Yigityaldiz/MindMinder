// src/api/admin.ts

import { Router, type Request, type Response } from "express";
import { authorizeRole } from "../middleware/authorizeRole";

const router = Router();

// Yalnızca admin rolü olan kullanıcıların erişebileceği endpoint
router.get(
  "/dashboard",
  authorizeRole("admin"),
  (req: Request, res: Response) => {
    res.json({ message: "Welcome, admin!" });
  }
);

export default router;
