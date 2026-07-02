import express from "express"
const employeeRoutes = express.Router()
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import { auth } from "../../auth/authentication.js";
import { employeeRegister, employeeUpdate, employeeViewByUserId } from "../../controllers/employee/employee.controller.js";
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


const uploadSingle = async (file, folder) => {
    if (!file) return null;

    const key = `${folder}/${Date.now()}_${file.originalname}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        })
    );

    return {
        url: `https://${process.env.AWS_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${key}`,
        key,
    };
};

export const uploadEmployeeDocs = async (req, res, next) => {
    try {
        const profile = req.files?.profile?.[0];
        const aadhar = req.files?.aadhar?.[0];
        const pan = req.files?.pan?.[0];

        const profileUpload = await uploadSingle(profile, "Employee/Profile");
        const aadharUpload = await uploadSingle(aadhar, "Employee/Aadhar");
        const panUpload = await uploadSingle(pan, "Employee/Pan");

        req.uploadedFiles = {
            profile: profileUpload,
            aadhar: aadharUpload,
            pan: panUpload,
        };

        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "File upload failed",
        });
    }
};

employeeRoutes.post(
    "/create",
    auth,
    upload.fields([
        { name: "profile", maxCount: 1 },
        { name: "aadhar", maxCount: 1 },
        { name: "pan", maxCount: 1 },
    ]),
    uploadEmployeeDocs,
    employeeRegister
);

employeeRoutes.get("/view/:userId", auth, employeeViewByUserId)


employeeRoutes.put(
    "/update/:userId",
    auth,
    upload.fields([
        { name: "profile", maxCount: 1 },
        { name: "aadhar", maxCount: 1 },
        { name: "pan", maxCount: 1 },
    ]),
    uploadEmployeeDocs,
    employeeUpdate
);

export default employeeRoutes