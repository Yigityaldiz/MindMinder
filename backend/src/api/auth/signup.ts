import { type Request, type Response, Router } from "express";
import User from "../../models/User";

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    return res
      .status(201)
      .json({ messsage: "User created succesfully", user: newUser });
  } catch (error) {
    console.log("Sign-Up Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
});
export default router;
