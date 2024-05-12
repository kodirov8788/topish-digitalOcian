const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const Message = require("../models/message_model");

// Configure dotenv only once
require("dotenv/config");

const s3 = new S3Client({
    region: process.env.AWS_S3_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/bmp",
        "image/webp", // Adding WebP format
        "application/pdf",
        "application/msword", // For DOC files
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // For DOCX files
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only images are allowed."));
    }
};

const upload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.AWS_BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const fileExtension = file.originalname.split('.').pop();
            cb(null, `messages/message-${Date.now()}.${fileExtension}`);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
        contentDisposition: 'inline',
    }),
    fileFilter: fileFilter,
}).array("messageFiles", 10);

const deleteFiles = async (messageId, fileUrls) => {
    const message = await Message.findById(messageId);
    if (!message || !message.fileUrls || message.fileUrls.length === 0) {
        throw new Error("Message not found or no files associated.");
    }

    // Extract S3 keys from the URLs
    const keysToDelete = fileUrls.map(url => {
        const urlParts = url.split('/');
        return urlParts[urlParts.length - 1]; // Assumes the key is the last part of the URL
    });

    // Delete files from S3
    const deletePromises = keysToDelete.map(key => {
        const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `messages/${key}`,
        };
        return s3.send(new DeleteObjectCommand(deleteParams));
    });

    try {
        await Promise.all(deletePromises);
        // Filter out the deleted file URLs from the message
        message.fileUrls = message.fileUrls.filter(url => !fileUrls.includes(url));
        await message.save();
    } catch (s3Error) {
        console.error("Error deleting files from S3:", s3Error);
        throw new Error("Failed to delete files.");
    }
};

module.exports = { upload, deleteFiles };
