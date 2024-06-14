const Users = require("../models/user_model");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const multer = require("multer");
const sharp = require("sharp");
require("dotenv").config();

const s3 = new S3Client({
  endpoint: process.env.AWS_S3_ENDPOINT,
  region: process.env.AWS_S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});
const multerStorage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: fileFilter,
});
const uploadFileToS3 = async (buffer, name, type) => {
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: name,
    Body: buffer,
    ContentType: type,
    ACL: "public-read", // Optional: Adjust according to your S3 bucket policies
  };

  await s3.send(new PutObjectCommand(uploadParams));
  return `https://${process.env.AWS_BUCKET_NAME}.${process.env.AWS_S3_BUCKET_REGION}.digitaloceanspaces.com/${name}`;
};
const deleteFileFromS3 = async (fileKey) => {
  const deleteParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
  };

  await s3.send(new DeleteObjectCommand(deleteParams));
};
const router = require("express").Router();
const updateUserAvatarUrl = async (userId, url) => {
  try {
    const result = await Users.findByIdAndUpdate(
      userId,
      { $set: { avatar: url } },
      { new: true } // This option returns the document as it looks after update was applied.
    );

    if (!result) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    console.log("Updated user avatar URL:", result);
    return result; // This will contain the updated user document.
  } catch (error) {
    console.error("Error updating user avatar URL:", error);
    throw error; // Rethrow or handle as needed
  }
};
router.post("/", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) throw new Error("Please upload a file.");

    const compressedImage = await sharp(req.file.buffer)
      .resize(500) // Example: resize to a max width of 500px, keeping aspect ratio
      .jpeg({ quality: 80 }) // Compress and convert to JPEG
      .toBuffer();
    const filename = `avatar/avatar-${req.user.id}-${Date.now()}.jpeg`;

    const fileUrl = await uploadFileToS3(
      compressedImage,
      filename,
      "image/jpeg"
    );
    await updateUserAvatarUrl(req.user.id, fileUrl);
    res.status(200).json({
      message: "Avatar uploaded successfully",
      url: fileUrl,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.patch("/", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) throw new Error("Please upload a file.");

    // Retrieve the user's current avatar URL from the database
    const user = await Users.findById(req.user.id);
    if (!user) throw new Error("User not found.");

    if (user.avatar) {
      // Extract the file key from the URL and delete the old avatar from S3
      const oldFileKey = user.avatar.split("/").pop(); // Adjust this line according to your URL structure
      await deleteFileFromS3(`avatar/${oldFileKey}`);
    }

    // Proceed with the image processing and uploading the new avatar
    const compressedImage = await sharp(req.file.buffer)
      .resize(500)
      .jpeg({ quality: 80 })
      .toBuffer();

    const filename = `avatar/avatar-${req.user.id}-${Date.now()}.jpeg`;
    const fileUrl = await uploadFileToS3(
      compressedImage,
      filename,
      "image/jpeg"
    );

    // Update the user's avatar URL in the database
    await updateUserAvatarUrl(req.user.id, fileUrl);

    res.status(200).json({
      message: "Avatar updated successfully",
      url: fileUrl,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.delete("/", async (req, res) => {
  try {
    // Retrieve the user's current avatar URL from the database
    const user = await Users.findById(req.user.id);
    if (!user) throw new Error("User not found.");

    if (user.avatar) {
      // Extract the file key from the URL and delete the old avatar from S3
      const fileKey = user.avatar.split("/").pop(); // Adjust this line according to your URL structure
      await deleteFileFromS3(`avatar/${fileKey}`);

      // Update the user's record to remove the avatar URL
      await Users.findByIdAndUpdate(req.user.id, { $unset: { avatar: "" } });

      res.status(200).json({ message: "Avatar deleted successfully" });
    } else {
      throw new Error("No avatar to delete.");
    }
  } catch (error) {
    console.error("Error deleting avatar:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
