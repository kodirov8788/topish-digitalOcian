const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const User = require("../../models/user_model");

// Configure dotenv only once
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
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/bmp",
        "image/webp", // Adding WebP format
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only specified formats are allowed."));
    }
};

const upload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: 'public-read', // Ensure files are publicly readable
        metadata: (req, file, cb) => {
            // console.log("file: ", file)
            // console.log("req: ", req)
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const fileExtension = file.originalname.split(".").pop();
            cb(null, `posts/postImage-${Date.now()}.${fileExtension}`);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
        contentDisposition: "inline",
    }),
    fileFilter: fileFilter,
}).array("postImages", 10);

const deletePostImages = async (userId, imageUrls) => {
    const user = await User.findById(userId);
    if (!user || !user.telegram.post.images || user.telegram.post.images.length === 0) {
        throw new Error("User not found or no images associated.");
    }

    // Extract S3 keys from the URLs
    const keysToDelete = imageUrls.map((url) => {
        const urlParts = url.split("/");
        return urlParts[urlParts.length - 1]; // Assumes the key is the last part of the URL
    });

    // Delete files from S3
    const deletePromises = keysToDelete.map((key) => {
        const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `posts/${key}`,
        };
        return s3.send(new DeleteObjectCommand(deleteParams));
    });

    try {
        await Promise.all(deletePromises);
        // Filter out the deleted file URLs from the user's postImages
        user.telegram.post.images = user.telegram.post.images.filter(
            (url) => !imageUrls.includes(url)
        );
        await user.save();
    } catch (s3Error) {
        console.error("Error deleting images from S3:", s3Error);
        throw new Error("Failed to delete images.");
    }
};
const deleteSinglePostImage = async (userId, imageUrl) => {
    const user = await User.findById(userId);
    if (!user || !user.telegram.post.images || user.telegram.post.images.length === 0) {
        throw new Error("User not found or no images associated.");
    }

    // Extract S3 key from the URL
    const urlParts = imageUrl.split("/");
    const keyToDelete = urlParts[urlParts.length - 1]; // Assumes the key is the last part of the URL

    // Delete file from S3
    const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `posts/${keyToDelete}`,
    };

    try {
        await s3.send(new DeleteObjectCommand(deleteParams));
        // Filter out the deleted file URL from the user's postImages
        user.telegram.post.images = user.telegram.post.images.filter(
            (url) => url !== imageUrl
        );
        await user.save();
    } catch (s3Error) {
        console.error("Error deleting image from S3:", s3Error);
        throw new Error("Failed to delete image.");
    }
};
module.exports = { upload, deletePostImages, deleteSinglePostImage };
