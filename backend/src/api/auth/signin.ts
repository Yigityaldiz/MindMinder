// src/api/auth/signin.ts

import { Router, type Request, type Response } from "express";
import User from "../../models/User";
import dotenv from "dotenv";
import { SignJWT } from "jose";

dotenv.config();

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı e-posta ile bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Şifre kontrolü
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const role = email === process.env.ADMIN_EMAIL ? "admin" : "user"; // JWT token oluşturma: jose kullanarak
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

    const token = await new SignJWT({
      id: user._id.toString(),
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime("15h")
      .sign(secret);

    // Kullanıcı verilerini hazırlama (şifre gibi hassas bilgileri dışarıya göndermiyoruz)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role,
    };

    return res.status(200).json({ token, user: userData });
  } catch (error) {
    console.error("Sign in error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
