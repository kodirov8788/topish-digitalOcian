// src/utils/imageUploads/discoverImageUpload.js
const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const multer = require("multer");
require("dotenv/config");

// Initialize S3 client
const s3 = new S3Client({
    endpoint: process.env.AWS_S3_ENDPOINT,
    region: process.env.AWS_S3_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/jpg", "image/jpeg", "image/png", "image/gif"];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only images are allowed."), false);
    }
};

// Configure multer to handle multiple file fields
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: fileFilter,
}).fields([
    { name: "image", maxCount: 1 }, // For main image upload
    { name: "locationImage", maxCount: 1 }, // For location image upload
]);

// Upload a single file to S3
const uploadFile = async (file) => {
    try {
        const fileExtension = file.originalname.split(".").pop();
        const key = `discover/discover-${Date.now()}.${fileExtension}`;

        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: "public-read",
            })
        );

        return `https://${process.env.AWS_BUCKET_NAME}.${process.env.AWS_S3_BUCKET_REGION}.digitaloceanspaces.com/${key}`;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};

// Middleware to handle multiple file uploads
const uploadFiles = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error("Upload middleware error:", err);
            return res.status(500).json({ error: "File upload error." });
        }

        // If no files are uploaded, proceed to the next middleware
        if (!req.files) {
            console.log("No files were uploaded.");
            return next();
        }

        try {
            const uploadResults = {};

            // Process main image if uploaded
            if (req.files.image && req.files.image[0]) {
                uploadResults.image = await uploadFile(req.files.image[0]);
            }

            // Process location image if uploaded
            if (req.files.locationImage && req.files.locationImage[0]) {
                uploadResults.locationImage = await uploadFile(req.files.locationImage[0]);
            }

            // Attach the uploaded URLs back to the request object
            req.uploadResults = uploadResults;
            next();
        } catch (error) {
            console.error("Error processing files:", error);
            res.status(500).json({ error: "Failed to process files." });
        }
    });
};

// Function to delete files from S3
const deleteFiles = async (fileUrls) => {
    if (!fileUrls || fileUrls.length === 0) {
        console.log("No files to delete.");
        return;
    }

    console.log("fileUrls:", fileUrls);

    // Filter out undefined or invalid URLs
    const validUrls = fileUrls.filter((url) => typeof url === "string" && url.trim() !== "");

    const keysToDelete = validUrls.map((url) => {
        const match = url.match(/https:\/\/[^\/]+\/(.+)/);
        return match ? match[1] : null;
    }).filter((key) => key); // Filter out null or undefined keys

    if (keysToDelete.length === 0) {
        console.log("No valid keys to delete.");
        return;
    }

    try {
        const deletePromises = keysToDelete.map((Key) =>
            s3.send(
                new DeleteObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key,
                })
            )
        );

        await Promise.all(deletePromises);
        console.log("Files deleted successfully.");
    } catch (s3Error) {
        console.error("Error deleting files from S3:", s3Error);
        throw new Error("Failed to delete files.");
    }
};


module.exports = { uploadFiles, deleteFiles };
