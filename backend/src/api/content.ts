import { Router, type Response, type Request } from "express";
import Content from "../models/Content";

const router = Router();

router.post("/", async (res: Response, req: Request) => {
  try {
    const {
      title,
      description,
      contentType,
      fileUrl,
      categories,
      tags,
      learningStyle,
    } = req.body;

    const newContent = new Content({
      title,
      description,
      contentType,
      fileUrl,
      categories,
      tags,
      learningStyle,
    });

    await newContent.save();

    return res
      .status(201)
      .json({ messsage: "Content created succesfully", content: newContent });
  } catch (err) {
    console.log("Content creation error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (res: Response, req: Request) => {
  try {
    const getAllContent = await Content.find({});

    return res.status(201).json({ getAllContent });
  } catch (err) {
    console.log("Content fetch error ", err);
    return res.status(501).json({ message: "Content fetch error" });
  }
});

router.get("/:id", async (res: Response, req: Request) => {
  try {
    const findOne = await Content.findById(req.params.id);

    if (!findOne) {
      return res.status(501).json({ message: "Content not found" });
    }

    return res.status(201).json({ findOne });
  } catch (err) {
    console.log("Content fetch error", err);

    return res.status(404).json({ message: "Content fetch error" });
  }
});

router.put("/:id", async (res: Response, req: Request) => {
  const updatedContent = await Content.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!updatedContent) {
    return res.status(404).json({ message: "Content not found" });
  }

  return res
    .status(201)
    .json({ message: "Content updated ", content: updatedContent });
});

router.delete("/:id", async (res: Response, req: Request) => {
  try {
    const deleteContent = await Content.findByIdAndDelete(req.params.id);
    if (!deleteContent) {
      return res.status(404).json({ message: "Content not found " });
    }
    return res.status(201).json({ message: "Content deleted" });
  } catch (err) {
    console.log("Content deletion error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
