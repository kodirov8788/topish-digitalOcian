const {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

const Users = require("../models/user_model");
const multer = require("multer");
const sharp = require("sharp");
require("dotenv").config();

// Initialize S3 client
const s3 = new S3Client({
  endpoint: process.env.AWS_S3_ENDPOINT,
  region: process.env.AWS_S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

// Multer configuration for handling file uploads
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

// Helper function to upload file to S3
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

const deleteUserAvatar = async (userId) => {
  const user = await Users.findById(userId);

  if (!user || !user.avatar) {
    throw new Error("Avatar not found or user does not exist.");
  }

  const avatarKey = user.avatar.split("/").pop();
  const deleteParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `Users-avatar/${avatarKey}`,
  };

  try {
    await s3.send(new DeleteObjectCommand(deleteParams));
  } catch (s3Error) {
    console.error("Error deleting avatar from S3:", s3Error);
    throw new Error("Failed to delete avatar from S3.");
  }

  await Users.findByIdAndUpdate(userId, { $set: { avatar: "" } });
};
class AvatarCTRL {
  async deleteUserAvatar(userId) {
    const user = await Users.findById(userId);

    // Check if the user exists and if the avatar is either not set or an empty string
    // if (!user || !user.avatar || user.avatar.trim() === "") {
    //     // console.log("No avatar to delete or user does not exist.");
    //     return true; // Return early indicating "success" because there's nothing to delete
    // }
    if (!user.avatar === "") {
      const avatarKey = user.avatar.split("/").pop();
      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `Users-avatar/${avatarKey}`,
      };
      try {
        await s3.send(new DeleteObjectCommand(deleteParams));
      } catch (s3Error) {
        console.error("Error deleting avatar from S3:", s3Error);
        throw new Error("Failed to delete avatar from S3.");
      }
    } else {
      await Users.findByIdAndUpdate(userId, { $set: { avatar: "" } });
    }
  }

  async uploadAvatar(req, res, next) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized User!", null, 0);
    }

    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return handleResponse(res, 500, "error", err.message, null, 0);
      } else if (err) {
        // An unknown error occurred when uploading.
        return handleResponse(res, 500, "error", err.message, null, 0);
      }

      if (!req.file) {
        // If no file is provided, send an error.
        return handleResponse(
          res,
          400,
          "error",
          "Please provide an image to upload.",
          null,
          0
        );
      }

      try {
        // Construct the full URL for the avatar
        const bucketName = process.env.AWS_BUCKET_NAME;
        const region = process.env.AWS_S3_BUCKET_REGION;
        const objectKey = req.file.key;
        const avatarUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${objectKey}`;

        // Update the user's avatar field with the full S3 URL
        const userId = req.user.id;
        await Users.findByIdAndUpdate(userId, { avatar: avatarUrl });

        return handleResponse(
          res,
          200,
          "success",
          "User avatar updated successfully",
          { avatar: avatarUrl },
          1
        );
      } catch (error) {
        console.error(error);
        return handleResponse(
          res,
          500,
          "error",
          "Unable to update user avatar.",
          null,
          0
        );
      }
    });
  }

  async updateAvatar(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized!", null, 0);
      }

      // Get the user's current avatar location
      const userId = req.user.id;
      const user = await Users.findById(userId);

      if (user && user.avatar) {
        // Delete the old avatar from S3
        const avatarKey = user.avatar.split("/").pop();
        const deleteParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `Users-avatar/${avatarKey}`,
        };

        await s3.send(new DeleteObjectCommand(deleteParams));
      }

      upload(req, res, async (err) => {
        if (err) {
          return handleResponse(res, 400, "error", err.message, null, 0);
        }

        // Update the user's avatar field with the S3 file location
        const avatarLocation = req.file.location;

        await Users.findByIdAndUpdate(userId, { avatar: avatarLocation });

        return handleResponse(
          res,
          200,
          "success",
          "User avatar updated successfully",
          { avatar: avatarLocation },
          1
        );
      });
    } catch (error) {
      console.error(error);
      return handleResponse(res, 500, "error", "Something went wrong", null, 0);
    }
  }

  async getAvatar(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const userId = req.user.id;
      const user = await Users.findById(userId);

      if (!user || !user.avatar) {
        return handleResponse(res, 404, "error", "Avatar not found", null, 0);
      }

      // Extract the key from the avatar URL
      const url = new URL(user.avatar);
      const objectKey = url.pathname.substring(1); // Remove the leading '/' from the pathname

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: objectKey,
      };

      const getObjectCommand = new GetObjectCommand(params);

      const { Body, ContentType } = await s3.send(getObjectCommand);
      res.setHeader("Content-Type", ContentType || "image/png"); // Use the ContentType from S3 if available, otherwise default to "image/png"
      Body.pipe(res).on("error", (streamError) => {
        console.error("Error streaming avatar image:", streamError);
        return handleResponse(
          res,
          500,
          "error",
          "Error streaming avatar image",
          null,
          0
        );
      });

      return handleResponse(
        res,
        200,
        "success",
        "Avatar retrieved successfully",
        null,
        0
      );
    } catch (error) {
      console.error("Error in getAvatar function:", error);
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong",
        { msg: error.message },
        0
      );
    }
  }

  async deleteAvatar(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      await deleteUserAvatar(req.user.id);
      return handleResponse(
        res,
        200,
        "success",
        "Avatar deleted successfully",
        null,
        0
      );
    } catch (error) {
      console.error("Error in deleteAvatar function:", error);
      return handleResponse(
        res,
        error.status || 500,
        "error",
        error.message || "Something went wrong",
        null,
        0
      );
    }
  }
}

module.exports = new AvatarCTRL();
