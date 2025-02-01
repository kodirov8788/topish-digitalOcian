// src/utils/imageUploads/TurnerImageUpload.js
const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const multer = require("multer");
const sharp = require("sharp");
require("dotenv/config");

const s3 = new S3Client({
    endpoint: process.env.AWS_S3_ENDPOINT,
    region: process.env.AWS_S3_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpg",
        "image/jpeg",
        "image/png",
        "image/gif",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only images are allowed."), false);
    }
};

// Configure multer to store files in memory
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: fileFilter,
}).single("image"); // Changed field name to 'image'

const uploadFile = async (file) => {
    try {
        const buffer = await sharp(file.buffer)
            .resize(1024)
            .jpeg({ quality: 40 })
            .toBuffer();

        const fileExtension = file.originalname.split(".").pop();
        const key = `tournaments/tournament-${Date.now()}.${fileExtension}`;

        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
                Body: buffer,
                ContentType: "image/jpeg",
                ACL: "public-read",
            })
        );

        return `https://${process.env.AWS_BUCKET_NAME}.${process.env.AWS_S3_BUCKET_REGION}.digitaloceanspaces.com/${key}`;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};

const uploadFiles = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error("Upload middleware error:", err);
            return res.status(500).json({ error: "File upload error." });
        }
        if (!req.file) {
            req.files = [];
            return next();
        }

        try {
            const uploadedFileUrl = await uploadFile(req.file);
            req.files = [uploadedFileUrl];
            next();
        } catch (error) {
            console.error("Error processing file:", error);
            res.status(500).json({ error: "Failed to process file." });
        }
    });
};

const deleteFiles = async (fileUrls) => {
    const keysToDelete = fileUrls.map((url) => url.split("/").pop());

    try {
        await Promise.all(
            keysToDelete.map((key) =>
                s3.send(
                    new DeleteObjectCommand({
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: `tournaments/${key}`,
                    })
                )
            )
        );
    } catch (s3Error) {
        console.error("Error deleting files from S3:", s3Error);
        throw new Error("Failed to delete files.");
    }
};

module.exports = { uploadFiles, deleteFiles };
