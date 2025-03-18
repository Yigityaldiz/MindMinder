// src/api/auth/signup.ts

import { Router, type Request, type Response } from "express";
import User from "../../models/User";

const router = Router();

router.post(
  "/api/auth/signup",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { name, email, password } = req.body;

      // Kullanıcı var mı kontrolü
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Yeni kullanıcı oluşturma
      const newUser = new User({ name, email, password });
      await newUser.save();

      return res
        .status(201)
        .json({ message: "User created successfully", user: newUser });
    } catch (error) {
      console.error("Sign up error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
