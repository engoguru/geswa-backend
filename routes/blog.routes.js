import express from "express"
import { createBlog, deleteBlog, updateBlog, viewAllBlog, viewOneBlog } from "../controllers/blog.controllers.js"
import { auth } from "../auth/authentication.js"

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";

const blogRoute = express.Router()

// S3 config
const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.AWS_BUCKET_SECRET_ACCESS_KEY,
  },
});

// Use memory storage (IMPORTANT)
const upload = multer({
  storage: multer.memoryStorage(),
});

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.file;

    const key = `HospitalImages/${Date.now()}_${file.originalname}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(params));

    // Construct public URL (if bucket is public or via CloudFront)
    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${key}`;

    req.body.imageUrl = imageUrl;
    req.body.imagePublicKey = key;

    next();
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
};

blogRoute.post("/create",
  auth,
  upload.single("file"),
  uploadImage,
  createBlog)

blogRoute.get("/viewall", viewAllBlog)

blogRoute.get("/viewOne/:id", viewOneBlog)
blogRoute.put("/update/:id", updateBlog)
blogRoute.delete("/delete/:id", deleteBlog)





export default blogRoute