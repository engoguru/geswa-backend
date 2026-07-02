import express from "express"
import { createApplication, createJob, deleteJob, updateApplication, viewAllApplication, viewAllJob, viewOneApplication, viewOneJob } from "../controllers/career.controller.js"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import multer from "multer"
import { auth } from "../auth/authentication.js"

const careerRoute=express.Router()



careerRoute.post("/create",createJob)

careerRoute.get("/viewall-job", viewAllJob)

careerRoute.get("/view-jobdetail/:id", viewOneJob)

careerRoute.delete("/delete-job/:id",auth,deleteJob)


// aPPLICATION
const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.AWS_BUCKET_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
    storage: multer.memoryStorage(),
});

const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

          const file = req.file;
      
          const key = `Resume/${Date.now()}_${file.originalname}`;
      
          const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          };
      
          await s3.send(new PutObjectCommand(params));
      
          // Construct public URL (if bucket is public or via CloudFront)
          const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${key}`;
      
          req.body.resume_Url = imageUrl;
          req.body.resume_publicId = key;
      
          next();
        }catch(error){
            console.error("Upload error:", error);
        }
    }


careerRoute.post("/create/application",upload.single("resume"),uploadImage, createApplication)

careerRoute.get("/viewAll/application",auth,viewAllApplication)

careerRoute.get("/viewOne/application/:id",auth,viewOneApplication)


careerRoute.post("/update/application/:id",auth,updateApplication)



export default careerRoute