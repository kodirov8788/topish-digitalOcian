// src/utils/imageUploads/messageFilesUpload.js
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
require("dotenv/config");

const s3 = new S3Client({
    endpoint: process.env.AWS_S3_ENDPOINT,
    region: process.env.AWS_S3_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
});

const getMimeType = (extension) => {
    const mimeTypes = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        bmp: 'image/bmp',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        zip: 'application/zip',
        rar: 'application/vnd.rar',
        tar: 'application/x-tar',
        gz: 'application/gzip',
        wav: 'audio/wav',
    };
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};

const uploadFile = async (file) => {
    try {
        if (!file || !file.buffer || !file.originalname) {
            throw new Error("Invalid file object. Make sure it contains 'buffer' and 'originalname'.");
        }
        const fileExtension = file.originalname.split(".").pop();
        const fileName = `uploadMessages/${uuidv4()}.${fileExtension}`;
        const mimeType = getMimeType(fileExtension);
        const originalName = file.originalname;

        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: file.buffer,
            ContentType: mimeType,
            ACL: "public-read",
            ContentDisposition: mimeType.includes('image') || mimeType.includes('wav') ? 'inline' : 'attachment',
        };

        await s3.send(new PutObjectCommand(uploadParams));

        const fileSize = file.buffer.length;
        const url = `https://${process.env.AWS_BUCKET_NAME}.${process.env.AWS_S3_BUCKET_REGION}.digitaloceanspaces.com/${fileName}`;
        console.log(`File uploaded: ${url}`);

        return { url, name: fileName, type: mimeType, size: fileSize, originalName };
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};

const deleteFiles = async (fileUrls) => {
    if (!fileUrls || fileUrls.length === 0) {
        console.log("No files to delete.");
        return;
    }

    const keysToDelete = fileUrls
        .map((url) => {
            const match = url.match(/https:\/\/[^\/]+\/(.+)/);
            return match ? match[1] : null;
        })
        .filter((key) => key !== null);

    try {
        const deletePromises = keysToDelete.map((Key) =>
            s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key }))
        );

        await Promise.all(deletePromises);
    } catch (s3Error) {
        console.error("Error deleting files from S3:", s3Error);
        throw new Error("Failed to delete files.");
    }
};

module.exports = { uploadFile, deleteFiles };
