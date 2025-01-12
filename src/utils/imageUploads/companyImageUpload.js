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

// File filter to allow only images, PDFs, and document files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only images, PDFs, and documents are allowed."
      ),
      false
    );
  }
};

// Configure multer to handle multiple file fields
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
}).fields([
  { name: "company_logo", maxCount: 1 },
  { name: "logo", maxCount: 1 },
  { name: "licenseFile", maxCount: 10 }, // Can upload multiple license files
]);

// Upload file to S3 without image processing
const uploadFile = async (file) => {
  try {
    const fileExtension = file.originalname.split(".").pop();
    const key = `company/company-${Date.now()}.${fileExtension}`;

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
// Middleware to handle multiple file uploads and keep fields separate
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
      // Upload and process the files in each field
      const uploadResults = {};

      // Process company logo if uploaded
      if (req.files.company_logo) {
        const uploadPromises = req.files.company_logo.map((file) =>
          uploadFile(file)
        );
        const companyLogoUrls = await Promise.allSettled(uploadPromises);
        uploadResults.logo = companyLogoUrls
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value);
      }

      // Process general logo if uploaded
      if (req.files.logo) {
        const uploadPromises = req.files.logo.map((file) => uploadFile(file));
        const logoUrls = await Promise.allSettled(uploadPromises);
        uploadResults.logo = logoUrls
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value);
      }

      // Process license files if uploaded
      if (req.files.licenseFile) {
        const uploadPromises = req.files.licenseFile.map((file) =>
          uploadFile(file)
        );
        const licenseFileUrls = await Promise.allSettled(uploadPromises);
        uploadResults.licenseFile = licenseFileUrls
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
  } catch (s3Error) {
    console.error("Error deleting files from S3:", s3Error);
    throw new Error("Failed to delete files.");
  }
};

module.exports = { uploadFiles, deleteFiles };
