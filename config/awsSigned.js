import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
    region:process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY,
        secretAccessKey: process.env.AWS_BUCKET_SECRET_ACCESS_KEY,
    },
});


export const generateSignUrl =async(key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    });

    const signedUrl = await getSignedUrl(s3, command, {
        expiresIn: 3600, // 1 hour
    });
    return signedUrl;
}

