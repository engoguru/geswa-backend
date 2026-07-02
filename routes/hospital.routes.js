import express from "express"
import { auth } from "../auth/authentication.js";
import { createDoctors, createHospital, updateHospital, viewAllHospital, viewOneHospital } from "../controllers/hospital.controller.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";

const hospitalRoute = express.Router()




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

const uploadHospitalImages = async (req, res, next) => {
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

const updateHospitalImages = async (req, res, next) => {
  try {
    if (!req.file) {
      next();
    } else {
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
    }
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
};

// Route
hospitalRoute.post(
  "/create",
  upload.single("file"),
  uploadHospitalImages,
  createHospital
);

// hospitalRoute.post("/create",upload.single(), uploadHospitalImages,createHospital)

hospitalRoute.get("/viewAll", viewAllHospital)

hospitalRoute.get("/viewOne/:id", viewOneHospital)

hospitalRoute.put("/update/:id", auth, upload.single("file"),
 updateHospitalImages, updateHospital)

//  same middleware use also here
hospitalRoute.post("/add", auth, upload.single("file"),
  uploadHospitalImages, createDoctors)

export default hospitalRoute