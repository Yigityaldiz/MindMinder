import { Router, type Request, type Response } from "express";
import crypto from "node:crypto";
import User from "../../models/User";
import nodemailer from "nodemailer";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const fifteenMinutes = 15 * 60 * 1000;
    user.resetPasswordExpires = new Date(Date.now() + fifteenMinutes);
    await user.save();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const frontendBaseUrl = process.env.FRONTEND_URL;
    const resetLink = `${frontendBaseUrl}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"Uygulamanızın Adı" <${process.env.EMAIL_USER}>`, // Gönderen adı ve e-postası
      to: user.email, // Alıcı e-posta adresi
      subject: "Şifre Sıfırlama Talebi", // E-posta konusu
      html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Şifre Sıfırlama Talebi</h2>
            <p>Merhaba ${user.name || "Kullanıcı"},</p>
            <p>Hesabınız için bir şifre sıfırlama talebi aldık. Aşağıdaki butona tıklayarak şifrenizi sıfırlayabilirsiniz. Bu link <strong>15 dakika</strong> geçerlidir.</p>
            <p style="text-align: center;">
              <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 12px 25px; font-size: 16px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">
                Şifremi Sıfırla
              </a>
            </p>
            <p>Eğer bu butona tıklayamıyorsanız, aşağıdaki linki kopyalayıp tarayıcınızın adres çubuğuna yapıştırabilirsiniz:</p>
            <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
            <p>Eğer bu şifre sıfırlama talebini siz yapmadıysanız, bu e-postayı güvenle görmezden gelebilirsiniz. Hesabınız güvendedir.</p>
            <br>
            <p>Teşekkürler,<br/>Uygulamanızın Adı Ekibi</p>
          </div>
        `, // HTML formatındaki e-posta
      text: `Merhaba ${
        user.name || "Kullanıcı"
      },\n\nHesabınız için bir şifre sıfırlama talebi aldık.\nŞifrenizi sıfırlamak için aşağıdaki linki ziyaret edin. Bu link 15 dakika geçerlidir:\n${resetLink}\n\nEğer bu şifre sıfırlama talebini siz yapmadıysanız, bu e-postayı güvenle görmezden gelebilirsiniz. Hesabınız güvendedir.\n\nTeşekkürler,\nUygulamanızın Adı Ekibi`, // Düz metin formatındaki e-posta (HTML desteklemeyen istemciler için)
    };
    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
