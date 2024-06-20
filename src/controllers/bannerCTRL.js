const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const multer = require("multer");
const sharp = require("sharp");
const Banner = require("../models/banner_model");
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

// Multer configuration for handling file uploads in memory
const multerStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/png"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file format. Only images ( png) are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
}).array("banner", 1); // Adjust the number of files as needed

class BannerCTRL {
  async createBanner(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }

    upload(req, res, async (err) => {
      if (err) {
        return handleResponse(
          res,
          400,
          "error",
          "Upload Error: " + err.message,
          null,
          0
        );
      }
      try {
        const files = req.files;
        let uploadPromises = files.map(async (file) => {
          const buffer = await sharp(file.buffer)
            .png({ quality: 10 }) // Keep as PNG, adjust compression level as needed
            .toBuffer();
          const fileName = `banner-post/file-${Date.now()}.png`; // Maintain PNG extension
          await s3.send(
            new PutObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: fileName,
              Body: buffer,
              ContentType: "image/png",
              ACL: "public-read",
            })
          );
          return `https://${process.env.AWS_BUCKET_NAME}.${process.env.AWS_S3_BUCKET_REGION}.digitaloceanspaces.com/${fileName}`;
        });
        const imageUrls = await Promise.all(uploadPromises);

        let banners = await Banner.find();
        let banner;

        if (banners.length < 1) {
          banner = new Banner({
            bannerImages: imageUrls.filter(
              (url) => url !== "Non-PNG file skipped or default image URL"
            ), // Filter out placeholders
          });
        } else {
          banner = banners[0];
          banner.bannerImages.push(
            ...imageUrls.filter(
              (url) => url !== "Non-PNG file skipped or default image URL"
            )
          ); // Filter out placeholders
        }

        await banner.save();
        return handleResponse(
          res,
          200,
          "success",
          "Banner updated successfully",
          banner,
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
    });
  }
  async deleteBanner(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized");
    }

    // Uncomment if role-based authorization is needed
    // if (req.user.role !== "admin") {
    //     return handleResponse(res, 401, 'error', 'You are not allowed!');
    // }

    try {
      const imageUrl = req.body.imageUrl; // The URL of the image to be deleted
      if (!imageUrl) {
        return handleResponse(res, 400, "error", "Image URL is required");
      }

      // Extract the filename from the imageUrl
      const fileName = imageUrl.split("/").pop();

      // Delete the image from AWS S3 bucket
      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `banner-post/${fileName}`, // Adjust based on your S3 file structure
      };
      await s3.send(new DeleteObjectCommand(deleteParams));

      // Find the banner and update it by removing the image URL
      const banner = await Banner.findOne();
      if (!banner) {
        return handleResponse(res, 404, "error", "Banner not found");
      }
      banner.bannerImages = banner.bannerImages.filter(
        (image) => image !== imageUrl
      );
      await banner.save();

      return handleResponse(
        res,
        200,
        "success",
        "Image deleted successfully",
        banner
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
  async getAllBanner(req, res) {
    // if (!req.user) {
    //     return handleResponse(res, 401, 'error', 'Unauthorized');
    // }

    // Optional: Check for admin or specific role if necessary
    // if (req.user.role !== "admin") {
    //     return handleResponse(res, 401, 'error', 'You are not allowed!');
    // }

    try {
      const banners = await Banner.find();
      if (banners.length === 0) {
        return handleResponse(res, 404, "error", "No banners found");
      }

      // Here, spreading the banner objects may not be necessary or even incorrect depending on your handleResponse implementation.
      // Assuming handleResponse can handle passing an array directly.
      return handleResponse(
        res,
        200,
        "success",
        "Banners retrieved successfully",
        ...banners,
        banners.length
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
  async moveIndexPosition(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      // if (req.user.role !== "admin") {
      //     return handleResponse(res, 401, 'error', 'You are not allowed!', null, 0);
      // }
      const { oldIndex, newIndex } = req.body;
      const banners = await Banner.find();
      if (banners.length === 0) {
        return handleResponse(res, 404, "error", "Banner not found", null, 0);
      }
      const banner = banners[0];
      if (
        oldIndex < 0 ||
        oldIndex >= banner.bannerImages.length ||
        newIndex < 0 ||
        newIndex >= banner.bannerImages.length
      ) {
        return handleResponse(res, 400, "error", "Invalid index", null, 0);
      }
      const [removed] = banner.bannerImages.splice(oldIndex, 1);
      banner.bannerImages.splice(newIndex, 0, removed);
      await banner.save();
      return handleResponse(
        res,
        200,
        "success",
        "Banner updated successfully",
        banner,
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
}

module.exports = new BannerCTRL();
