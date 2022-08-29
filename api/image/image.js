import upload from "../../config/multer.js";
import cloudinary from "../../config/cloudinary.js";
import fs from "fs";
import express from "express";

const router = express();

const fileUploader = async (path) => {
  let file = await cloudinary(path, "Images");
  return file;
};

router.post("/upload", upload.array("image"), async (req, res) => {
  try {
    const urls = [];
    const files = req.files;
    if (!files) {
      return res
        .status(400)
        .json({ success: false, status: "Please upload image" });
    }
    for (const file of files) {
      const { path } = file;
      const newPath = await fileUploader(file.path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }

    res
      .status(200)
      .json({ success: true, status: "File uploaded", file: urls });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, status: error?.response, error: error });
    console.log(error);
  }
});

export default router;
