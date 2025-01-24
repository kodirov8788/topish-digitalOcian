// src/utils/imageUploads/storyUpload.js
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const multer = require("multer");
const { getVideoDurationInSeconds } = require("get-video-duration"); // Library to get video duration
const { PassThrough } = require("stream"); // Node.js stream module
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
// File filter to allow only specific types of files (images and videos)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/mpeg",
    "video/ogg",
    "video/webm",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only images and videos are allowed."),
      false
    );
  }
};

// Configure multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
}).array("media", 5); // The field name 'media' should match the field name used in the request

// Convert buffer to readable stream
const bufferToStream = (buffer) => {
  const stream = new PassThrough();
  stream.end(buffer);
  return stream;
};

// Upload a single file to S3
const uploadFile = async (file) => {
  try {
    const name = file.originalname;
    const fileExtension = file.originalname.split(".").pop();
    const key = `stories/story-${Date.now()}.${fileExtension}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read",
      })
    );

    const url = `https://${process.env.AWS_BUCKET_NAME}.${process.env.AWS_S3_BUCKET_REGION}.digitaloceanspaces.com/${key}`;

    // Get additional metadata for videos
    let duration = null;
    if (file.mimetype.startsWith("video")) {
      const stream = bufferToStream(file.buffer); // Convert buffer to stream
      duration = await getVideoDurationInSeconds(stream);
    }

    // Return the media object with detailed metadata
    return {
      url: url,
      type: file.mimetype.startsWith("image") ? "image" : "video",
      format: fileExtension,
      size: file.size,
      duration: duration, // Only applicable for video files
      createdAt: new Date(),
      name,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Middleware to handle file upload
const uploadStoryMedia = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Upload middleware error:", err);
      return res.status(500).json({ error: "File upload error." });
    }

    // No files to upload
    if (!req.files || req.files.length === 0) {
      req.files = [];
      return next();
    }

    try {
      const uploadPromises = req.files.map((file) => uploadFile(file));
      const results = await Promise.allSettled(uploadPromises);

      // Filter out successfully uploaded files and collect their metadata
      const uploadedFilesData = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      // Store the metadata of the uploaded files in req.files for later use
      req.files = uploadedFilesData;
      next();
    } catch (error) {
      console.error("Error processing files:", error);
      res.status(500).json({ error: "Failed to process files." });
    }
  });
};

// Function to delete files from S3
const deleteStoryMedia = async (fileUrls) => {
  //   console.log("fileUrls: ", fileUrls);
  const keysToDelete = fileUrls.map((url) => url.url.split("/").pop());
  //   console.log("keysToDelete: ", keysToDelete);
  try {
    await Promise.all(
      keysToDelete.map((key) =>
        s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `stories/${key}`,
          })
        )
      )
    );
  } catch (s3Error) {
    console.error("Error deleting files from S3:", s3Error);
    throw new Error("Failed to delete files.");
  }
};

module.exports = { uploadStoryMedia, deleteStoryMedia };
