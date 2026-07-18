import express from "express";
import { createServiceHistory, deleteServiceHistory, getByHospitalServiceHistory, getMemberServiceHistory, getPurchaseServiceHistory, getPurchaseServiceHistoryUserId, getServiceHistory, getServiceHistoryById, updateServiceHistory } from "../../controllers/memberShip/serviceHistory.controller.js";


const serviceHistoryroute = express.Router();

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import { auth } from "../../auth/authentication.js";

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

    req.body.bill_Url = imageUrl;
    req.body.bill_publicId = key;

    next();
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
};




// auth
serviceHistoryroute.post("/create", auth,
  upload.single("Invoice"),
  uploadImage, createServiceHistory);


serviceHistoryroute.get("/viewAll", getServiceHistory);


serviceHistoryroute.get("/member/:memberId", getMemberServiceHistory);


serviceHistoryroute.get("/purchase/:purchaseId", getPurchaseServiceHistory);

serviceHistoryroute.get("/purchase-user/:userId", getPurchaseServiceHistoryUserId);


serviceHistoryroute.get("/hospital-wise/:hospitalId",auth, getByHospitalServiceHistory);





serviceHistoryroute.get("/viewOne/:id", getServiceHistoryById);


serviceHistoryroute.put("/update/:id", updateServiceHistory);


serviceHistoryroute.delete("/delete/:id", deleteServiceHistory);

export default serviceHistoryroute;