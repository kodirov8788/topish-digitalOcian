const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
require("dotenv").config();

const s3 = new S3Client({
  endpoint: process.env.AWS_S3_ENDPOINT,
  region: process.env.AWS_S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload only images."), false);
    }
  },
}).fields([
  { name: 'images', maxCount: 10 },
  { name: 'licenseFile', maxCount: 10 },
  { name: 'company_logo', maxCount: 1 },
  { name: 'logo', maxCount: 1 }
]);

const uploadFileToS3 = async (file) => {
  const key = `uploads/${Date.now()}_${file.originalname}`;
  try {
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

// Middleware to handle multiple file uploads and return only the links
const uploadFiles = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Upload middleware error:", err);
      return res.status(500).json({ error: "File upload error." });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      console.log("No files were uploaded.");
      return next();
    }

    try {
      const uploadResults = {};

      // Process image files if uploaded
      if (req.files.images) {
        const uploadPromises = req.files.images.map((file) => uploadFileToS3(file));
        const imageUrls = await Promise.allSettled(uploadPromises);
        uploadResults.images = imageUrls
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value);
      }

      // Process license files if uploaded
      if (req.files.licenseFile) {
        const uploadPromises = req.files.licenseFile.map((file) => uploadFileToS3(file));
        const licenseFileUrls = await Promise.allSettled(uploadPromises);
        uploadResults.licenseFile = licenseFileUrls
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value);
      }

      // Process company_logo if uploaded
      if (req.files.company_logo) {
        const uploadPromises = req.files.company_logo.map((file) => uploadFileToS3(file));
        const companyLogoUrls = await Promise.allSettled(uploadPromises);
        uploadResults.company_logo = companyLogoUrls
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value);
      }

      // Process logo if uploaded
      if (req.files.logo) {
        const uploadPromises = req.files.logo.map((file) => uploadFileToS3(file));
        const logoUrls = await Promise.allSettled(uploadPromises);
        uploadResults.logo = logoUrls
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value);
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

  const keysToDelete = fileUrls
    .map((url) => {
      const match = url.match(/https:\/\/[^\/]+\/(.+)/);
      return match ? match[1] : null;
    })
    .filter((key) => key !== null);

  const deleteParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Delete: {
      Objects: keysToDelete.map((Key) => ({ Key })),
    },
  };

  try {
    await s3.send(new DeleteObjectCommand(deleteParams));
    console.log("Files deleted successfully.");
  } catch (error) {
    console.error("Error deleting files:", error);
  }
};

module.exports = { uploadFiles, deleteFiles };