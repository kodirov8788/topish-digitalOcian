const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const Gallery = require("../models/gallery_model");
const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");
require("dotenv/config");

const s3 = new S3Client({
  endpoint: process.env.AWS_S3_ENDPOINT,
  region: process.env.AWS_S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

// Define the file filter to accept image and video formats
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/quicktime",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file format. Only images (jpeg, png, gif) and videos (mp4, quicktime) are allowed."
      )
    );
  }
};

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const fileExtension = file.originalname.split(".").pop();
      cb(null, "Users-gallery-post/" + `file-${Date.now()}.${fileExtension}`);
    },
  }),
  fileFilter: fileFilter,
}).array("gallery", 10); // Adjust the number of files as needed

class GalleryCTRL {
  async createGalleryPost(req, res) {
    try {

      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const user = await Users.findById(req.user.id).select("-password");
      if (user.role !== "JobSeeker") {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }
      if (!user || !user.jobSeeker) {
        return handleResponse(
          res,
          401,
          "error",
          "User not found or jobSeeker property missing",
          null,
          0
        );
      }

      upload(req, res, async (err) => {
        if (err) {
          return handleResponse(res, 400, "error", err.message, null, 0);
        }

        // Find an existing gallery post or create a new one
        let gallery = await Gallery.findOne({ createdBy: user.id });

        if (!gallery) {
          gallery = new Gallery({
            createdBy: user.id,
            images: req.files.map((file) => file.location), // Use map to get all file locations
          });
        } else {
          // Add new images to the existing images array
          gallery.images.push(...req.files.map((file) => file.location));
        }

        await gallery.save(); // Save changes

        return handleResponse(
          res,
          200,
          "success",
          "Gallery post updated successfully",
          gallery,
          1
        );
      });
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + error.message,
        null,
        0
      );
    }
  }
  async deleteGalleryImage(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const userId = req.user.id; // Using the user's ID to find their gallery
      const imageUrl = req.body.imageUrl; // The URL of the image to be deleted

      // Find the gallery by createdBy (userId)
      const gallery = await Gallery.findOne({ createdBy: userId });

      if (!gallery) {
        return handleResponse(res, 404, "error", "Gallery not found", null, 0);
      }

      // Remove the image URL from the images array
      gallery.images = gallery.images.filter((image) => image !== imageUrl);

      await gallery.save(); // Save the gallery document after removing the image

      // Delete the image from AWS S3 bucket
      const fileName = imageUrl.split("/").pop(); // Extract the file name from the URL
      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `Users-gallery-post/${fileName}`, // Adjust the key based on your S3 file structure
      };

      await s3.send(new DeleteObjectCommand(deleteParams));

      return handleResponse(
        res,
        200,
        "success",
        "Image deleted successfully",
        null,
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + error.message,
        null,
        0
      );
    }
  }

  async getAllGalleryPost(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      // write 404 response

      const galleryPosts = await Gallery.find();

      return handleResponse(
        res,
        200,
        "success",
        "Gallery posts retrieved successfully",
        [...galleryPosts],
        galleryPosts.length
      );
    } catch (error) {
      console.error("Error in getAllGalleryPost function:", error);
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + error.message,
        null,
        0
      );
    }
  }
  async getAllMyGalleryPost(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findById(req.user.id).select("-password");
      if (user.role !== "JobSeeker") {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }

      const userId = req.user.id;
      const galleryPosts = await Gallery.find({ createdBy: userId });

      if (galleryPosts.length === 0) {
        return handleResponse(
          res,
          200,
          "error",
          "Gallery posts not found",
          {},
          0
        );
      }

      return handleResponse(
        res,
        200,
        "success",
        "Your gallery posts retrieved successfully",
        ...galleryPosts,
        galleryPosts.length
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + error.message,
        null,
        0
      );
    }
  }
  async getGalleryPost(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const galleryPostId = req.params.id;
      const galleryPost = await Gallery.findById(galleryPostId);
      if (!galleryPost) {
        return handleResponse(
          res,
          404,
          "error",
          "Gallery post not found",
          null,
          0
        );
      }

      return handleResponse(
        res,
        200,
        "success",
        "Gallery post retrieved successfully",
        galleryPost,
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + error.message,
        null,
        0
      );
    }
  }
  async getJobSeekerGallery(req, res) {
    try {
      // Check if the user is authenticated
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const user = await Users.findById(req.user.id).select("-password");
      // Check if the user is an Employer
      if (user.role !== "Employer") {
        return handleResponse(
          res,
          403,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }

      const userId = req.params.id;
      const galleryPosts = await Gallery.find({ createdBy: userId });

      // Check if galleryPosts array is empty, indicating no posts found
      if (galleryPosts.length === 0) {
        return handleResponse(
          res,
          200,
          "error",
          "Gallery posts not found",
          {},
          0
        );
      }

      // Assuming handleResponse is a utility function to standardize API responses
      // Corrected variable name from galleryPost to galleryPosts to reflect possible multiple posts
      return handleResponse(
        res,
        200,
        "success",
        "Gallery posts retrieved successfully",
        ...galleryPosts,
        galleryPosts.length
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + error.message,
        null,
        0
      );
    }
  }
}

module.exports = new GalleryCTRL();
