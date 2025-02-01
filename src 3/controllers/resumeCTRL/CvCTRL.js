// src/controllers/resumeCTRL/CvCTRL.js
const Users = require("../../models/user_model"); // Update with the correct path to your model file
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { handleResponse } = require("../../utils/handleResponse");
require("dotenv/config");

const s3 = new S3Client({
  endpoint: process.env.AWS_S3_ENDPOINT,
  region: process.env.AWS_S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const fileExtension = file.originalname.split(".").pop();
      cb(null, "Users-cv/" + `cv-${Date.now()}.${fileExtension}`);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file format. Only images (jpeg, png, gif) and documents (pdf, doc, docx) are allowed."
        )
      );
    }
  },
}).single("cv");

class Cv {
  deleteUserCv = async (userId) => {
    const user = await Users.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.resume || !user.resume.cv || !user.resume.cv.key) {
      console.log("CV not found");
      return true;
    }

    // Delete the CV from S3
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: user.resume.cv.key,
    };

    try {
      await s3.send(new DeleteObjectCommand(deleteParams));
    } catch (deleteError) {
      console.error("Error deleting CV from S3:", deleteError);
      throw new Error("Error deleting CV from S3");
    }

    // Remove the CV field from the resume document
    user.resume.cv = { path: null, filename: null, size: null, key: null };
    await user.save();
  };

  addAndUpdateCvFile = async (req, res) => {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }
    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return handleResponse(res, 500, "error", err.message, null, 0);
      } else if (err) {
        return handleResponse(res, 500, "error", err.message, null, 0);
      }

      try {
        const userId = req.user.id;
        const user = await Users.findById(userId);
        if (!user) {
          return handleResponse(res, 404, "error", "User not found", null, 0);
        }

        const newFileDetails = {
          path: req.file.location,
          filename: req.file.originalname,
          size: req.file.size,
          key: req.file.key,
        };

        if (user.resume && user.resume.cv && user.resume.cv.key) {
          // Delete the old CV from S3
          const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: user.resume.cv.key,
          };

          try {
            await s3.send(new DeleteObjectCommand(deleteParams));
          } catch (deleteError) {
            console.error("Error deleting old CV from S3:", deleteError);
          }
        }

        if (!user.resume) {
          // If the resume doesn't exist, create a new one and link it to the user
          user.resume = { cv: newFileDetails };
        } else {
          // Update the CV field with the new file details
          user.resume.cv = newFileDetails;
        }

        await user.save();
        return handleResponse(
          res,
          200,
          "success",
          user.resume ? "CV updated successfully" : "New CV added successfully",
          user.resume.cv,
          1
        );
      } catch (error) {
        console.error(error);
        return handleResponse(
          res,
          500,
          "error",
          "An error occurred while adding/updating the CV file",
          null,
          0
        );
      }
    });
  };

  // GET - Retrieve the CV file path for a user
  getCvFile = async (req, res) => {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }

    try {
      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      if (!user.resume) {
        return handleResponse(res, 404, "error", "Resume not found", null, 0);
      }

      if (!user.resume.cv || !user.resume.cv.key) {
        return handleResponse(res, 404, "error", "CV files not found", null, 0);
      }

      return handleResponse(
        res,
        200,
        "success",
        "CV files retrieved successfully",
        user.resume.cv,
        1
      );
    } catch (error) {
      console.error(error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while retrieving the CV files",
        null,
        0
      );
    }
  };

  deleteCvFile = async (req, res) => {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }

    try {
      await this.deleteUserCv(req.user.id);
      return handleResponse(
        res,
        200,
        "success",
        "CV deleted successfully",
        null,
        0
      );
    } catch (error) {
      console.error("Error in deleteCvFile function:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while deleting the CV file",
        null,
        0
      );
    }
  };
}

module.exports = new Cv();
