const Resume = require("../../models/resume_model"); // Update with the correct path to your model file
const Users = require("../../models/user_model"); // Update
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { handleResponse } = require("../../utils/handleResponse");
require("dotenv/config");
const s3 = new S3Client({
  region: process.env.AWS_S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});
upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const fileExtension = file.originalname.split(".").pop();
      cb(null, "Users-cv/" + `cv-${Date.now()}.${fileExtension}`);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
  fileFilter: this.fileFilter,
}).single("cv");

class Cv {
  async deleteUserCv(userId) {
    const user = await Users.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const resume = await Resume.findById(user.resumeId);
    if (!resume || !resume.cv || !resume.cv.key) {
      console.log("CV not found");
      return true;
    }

    // Delete the CV from S3
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: resume.cv.key,
    };

    try {
      await s3.send(new DeleteObjectCommand(deleteParams));
    } catch (deleteError) {
      console.error("Error deleting CV from S3:", deleteError);
      // Handle the error as needed, possibly re-throwing it or logging it
    }

    // Remove the CV field from the resume document
    resume.cv = { path: null, filename: null, size: null, key: null };
    await resume.save();
  }

  fileFilter(req, file, cb) {
    const allowedMimeTypes = [
      "image/jpeg",
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
  }

  async addAndUpdateCvFile(req, res) {
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

        const resume = await Resume.findById(user.resumeId);
        const newFileDetails = {
          path: req.file.location,
          filename: req.file.originalname,
          size: req.file.size,
          key: req.file.key,
        };

        if (resume && resume.cv && resume.cv.key) {
          // Delete the old CV from S3
          const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: resume.cv.key,
          };

          try {
            await s3.send(new DeleteObjectCommand(deleteParams));
          } catch (deleteError) {
            console.error("Error deleting old CV from S3:", deleteError);
          }
        }

        if (!resume) {
          // If the resume doesn't exist, create a new one and link it to the user
          const newResume = new Resume({
            cv: newFileDetails,
          });
          await newResume.save();
          user.resumeId = newResume._id;
          await user.save();
          return handleResponse(
            res,
            201,
            "success",
            "New CV added successfully",
            newResume.cv,
            1
          );
        }

        // Update the CV field with the new file details
        resume.cv = newFileDetails;
        await resume.save();

        return handleResponse(
          res,
          200,
          "success",
          "CV updated successfully",
          resume.cv,
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
  }
  // GET - Retrieve the CV file path for a user
  async getCvFile(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }

    try {
      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const resume = await Resume.findById(user.resumeId);
      if (!resume) {
        return handleResponse(res, 404, "error", "Resume not found", null, 0);
      }

      if (!resume.cv || resume.cv.length === 0) {
        return handleResponse(res, 404, "error", "CV files not found", null, 0);
      }

      return handleResponse(
        res,
        200,
        "success",
        "CV files retrieved successfully",
        resume.cv,
        resume.cv.length
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
  }

  async deleteCvFile(req, res) {
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
        error.status || 500,
        "error",
        error.message || "Something went wrong",
        null,
        0
      );
    }
  }
}

module.exports = new Cv();
