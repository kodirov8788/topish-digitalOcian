const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const sharp = require("sharp");
require("dotenv/config");

const s3 = new S3Client({
  region: process.env.AWS_S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpg", "image/jpeg", "image/png", "image/gif"];
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
}).array("company_logo", 1);

const uploadFile = async (file) => {
  try {
    const buffer = await sharp(file.buffer)
      .resize(1024)
      .jpeg({ quality: 40 })
      .toBuffer();

    const fileExtension = file.originalname.split(".").pop();
    const key = `company/company-${Date.now()}.${fileExtension}`;

    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    }));

    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_S3_BUCKET_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

const uploadFiles = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      // Log the error for server-side debugging.
      console.error("Upload middleware error:", err);
      return res.status(500).json({ error: "File upload error." });
    }
    // No files to upload
    console.log("req.files: ", req.files)
    if (!req.files || req.files.length === 0) {
      console.log("No files were uploaded.");
      req.files = []; // Ensure req.files is an empty array to indicate no files were processed
      console.log("req.files in function: ", req.files)
      return next();
    }

    try {
      console.log("req.files in try catch: ", req.files)
      const uploadPromises = req.files.map(file => uploadFile(file));
      const results = await Promise.allSettled(uploadPromises);
      // Filter out the successfully uploaded files and map to their URLs
      const uploadedFilesUrls = results.filter(result => result.status === 'fulfilled').map(result => result.value);

      // Directly return the URLs of the uploaded files
      req.files = uploadedFilesUrls;
      next()
    } catch (error) {
      // Log the error for server-side debugging.
      console.error("Error processing files:", error);
      res.status(500).json({ error: "Failed to process files." });
    }
  });
};


// const deleteFiles = async (fileUrls) => {
//   if (!fileUrls || fileUrls.length === 0) {
//     console.log("No files to delete.");
//     return;
//   }
//   const keysToDelete = fileUrls.map((url) => url.split("/").pop());

//   try {
//     await Promise.all(keysToDelete.map((key) =>
//       s3.send(new DeleteObjectCommand({
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: `company/${key}`,
//       }))
//     ));
//   } catch (s3Error) {
//     console.error("Error deleting files from S3:", s3Error);
//     throw new Error("Failed to delete files.");
//   }
// };

const deleteFiles = async (fileUrls) => {
  if (!fileUrls || fileUrls.length === 0) {
    console.log("No files to delete.");
    return;
  }
  console.log("fileUrls: ", fileUrls);

  // Extract the S3 key from the full URL
  const keysToDelete = fileUrls.map((url) => {
    // Matches "https://topish-bucket.s3.us-east-1.amazonaws.com/"
    const match = url.match(/https:\/\/[^\/]+\/(.+)/);
    // Return the S3 key or null if not matched
    return match ? match[1] : null;
  }).filter(key => key !== null); // Filter out any null values that didn't match the pattern

  // console.log("keysToDelete: ", keysToDelete);

  try {
    const deletePromises = keysToDelete.map((Key) =>
      s3.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key,
      }))
    );

    let deletedImages = await Promise.all(deletePromises);
    // deletedImages.forEach((response, index) => {
    //   // console.log(`File deleted: ${keysToDelete[index]}, status code: ${response.$metadata.httpStatusCode}`);
    // });

    // console.log("Files deleted successfully.");
  } catch (s3Error) {
    console.error("Error deleting files from S3:", s3Error);
    throw new Error("Failed to delete files.");
  }
};



module.exports = { uploadFiles, deleteFiles };
