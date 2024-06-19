const Offices = require("../models/office_model");
const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");
const { deleteFiles } = require("../utils/officeImageUpload");
class OfficesCTRL {
  async createOffice(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const user = await Users.findById(req.user.id).select("-password");
      const coins = req.user.coins;
      const allowedRoles = ["Service", "Employer"];
      if (!allowedRoles.includes(user.role)) {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }

      if (coins == null) {
        return handleResponse(
          res,
          400,
          "error",
          "There are some problems with your coins. Please contact support.",
          null,
          0
        );
      }

      if (coins < 5) {
        return handleResponse(res, 400, "error", "Not enough coins.", null, 0);
      }
      if (!user) {
        return handleResponse(res, 400, "error", "User not found.", null, 0);
      }
      const officeDetails = {
        ...req.body,
        createdBy: user._id,
      };
      // console.log(req.body)
      if (req.files && req.files.length > 0) {
        // Map through the files array and extract the S3 file locations
        officeDetails.images = req.files;
      }
      const Office = await Offices.create(officeDetails);
      await Users.findByIdAndUpdate(user._id, { $inc: { coins: -1 } });

      return handleResponse(
        res,
        201,
        "success",
        "Office created successfully",
        Office,
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
  async deleteOffice(req, res, next) {
    try {
      // Check if the user is authenticated
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      // Check if the user role is Employer
      const user = await Users.findById(req.user.id).select("-password");
      const allowedRoles = ["Service", "Admin", "Employer"];
      if (!allowedRoles.includes(user.role)) {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }
      const { id: officeId } = req.params;

      let office = await Offices.findById(officeId);
      await deleteFiles(office.images);
      // Perform the deletion operation
      const deleteJob = await Offices.findOneAndDelete({
        _id: officeId,
        createdBy: req.user.id, // Ensure that the job can only be deleted by its creator
      });

      // If the job doesn't exist or wasn't deleted
      if (!deleteJob) {
        return handleResponse(
          res,
          404,
          "error",
          `Job with id: ${officeId} not found`,
          null,
          0
        );
      }

      // If deletion was successful
      return handleResponse(
        res,
        200,
        "success",
        "Job deleted successfully",
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
  async getAllOffices(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized");
      }

      const {
        recommended,
        title,
        recent,
        location,
        page = 1,
        limit = 10,
        sort,
      } = req.query;
      let queryObject = {};

      if (recommended) {
        queryObject.recommended = recommended === true;
      }
      if (recent) {
        recent === true
          ? (queryObject.createdAt = {
            $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          })
          : (queryObject.createdAt = {
            $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          });
      }

      if (title) {
        if (title.trim() === "") {
          return handleResponse(
            res,
            400,
            "error",
            "Title cannot be empty",
            [],
            0
          );
        } else {
          queryObject.title = { $regex: title, $options: "i" };
        }
      }

      if (location) {
        queryObject.location = { $regex: location, $options: "i" };
      }

      let query = Offices.find(queryObject);

      // Pagination
      const skip = (page - 1) * parseInt(limit); // Ensure limit is an integer
      query = query.skip(skip).limit(parseInt(limit));

      // Sort
      if (sort) {
        const sortList = sort.split(",").join(" ");
        query = query.sort(sortList);
      } else {
      }
      const searchedOffice = await query;
      if (searchedOffice.length === 0) {
        return handleResponse(res, 200, "success", "No jobs found", [], 0);
      }

      // Prepare pagination data
      const totalOffices = await Offices.countDocuments(queryObject); // Efficiently fetch total count
      const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOffices / parseInt(limit)),
        limit: parseInt(limit),
        totalDocuments: totalOffices,
      };

      return handleResponse(
        res,
        200,
        "success",
        "Offices retrieved successfully",
        searchedOffice,
        searchedOffice.length,
        pagination
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
  async getServicePosts(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const user = await Users.findById(req.user.id).select("-password");
      const allowedRoles = ["Service", "Admin", "Employer"];
      if (!allowedRoles.includes(user.role)) {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }

      const page = parseInt(req.query.page) || 1; // Default to first page if not specified
      const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items if not specified
      const skip = (page - 1) * limit;

      const allOffices = await Offices.find({ createdBy: req.user.id })
        .sort("-createdAt")
        .skip(skip)
        .limit(limit);

      const totalOffices = await Offices.countDocuments({
        createdBy: req.user.id,
      });

      if (allOffices.length === 0) {
        return handleResponse(
          res,
          200,
          "success",
          "No employer posts found",
          [],
          0
        );
      }

      // Prepare pagination data
      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(totalOffices / limit),
        limit: limit,
        totalDocuments: totalOffices,
      };

      return handleResponse(
        res,
        200,
        "success",
        "Employer posts retrieved successfully",
        allOffices,
        allOffices.length,
        pagination
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
  async getSingleOffice(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const {
        params: { id: officeId },
      } = req; // request gives the ID of the item

      const singleOffice = await Offices.findOne({ _id: officeId });

      if (!singleOffice) {
        return handleResponse(
          res,
          404,
          "error",
          `Job not found with ID: ${officeId}`,
          null,
          0
        );
      }

      return handleResponse(
        res,
        200,
        "success",
        "Job retrieved successfully",
        singleOffice,
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
  async updateOffice(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const user = await Users.findById(req.user.id).select("-password");
      const allowedRoles = ["Service", "Admin", "Employer"];
      if (!allowedRoles.includes(user.role)) {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }
      const {
        params: { id: officeId },
      } = req;
      let office = await Offices.findById(officeId);
      if (!office || office.createdBy.toString() !== req.user.id) {
        return handleResponse(
          res,
          404,
          "error",
          `Office not found with ID: ${officeId}`,
          null,
          0
        );
      }
      let deleteImages = [];
      let newImages = [];
      let keepImages = [];
      if (req.files && req.files.length > 0) {
        newImages = req.files.map((file) => file);
      }
      if (req.body.images && req.body.images.length > 0) {
        keepImages = req.body.images.split(",").map((item) => item.trim());
        keepImages = keepImages.filter((item) => item !== "");
      }
      let collectedImages = [];
      if (keepImages.length > 0 && newImages.length > 0) {
        collectedImages = [...keepImages, ...newImages];
        deleteImages = office.images.filter(
          (image) => !collectedImages.includes(image)
        );
      } else if (newImages.length > 0 && keepImages.length === 0) {
        collectedImages = [...newImages];
      } else if (keepImages.length > 0 && newImages.length === 0) {
        collectedImages = [...keepImages];
      }
      if (collectedImages.length === 0) {
        deleteImages = office.images.filter(
          (image) => !collectedImages.includes(image)
        );
      }
      if (deleteImages.length > 0) {
        await deleteFiles(deleteImages);
      }
      // Update office with the new data
      office = await Offices.findOneAndUpdate(
        { _id: officeId, createdBy: req.user.id },
        {
          ...req.body,
          images: [...collectedImages], // Combine kept and new images
        },
        { new: true, runValidators: true }
      );
      return handleResponse(
        res,
        200,
        "success",
        "Office updated successfully",
        office,
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
  async postFavoriteOffice(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { officeId } = req.params; // Correctly extracting the office ID from request parameters
      const userID = req.user.id;

      // Verify the user exists
      const user = await Users.findById(userID);
      if (!user) {
        // This message was originally about job seekers, which may not be appropriate if your app isn't job-related
        return handleResponse(res, 400, "error", "User not found", null, 0);
      }

      // Find the office by its ID
      const office = await Offices.findById(officeId);
      if (!office) {
        // Updated message for consistency with the "office" context
        return handleResponse(res, 404, "error", "Office not found", null, 0);
      }

      // Initialize likedBy array if it doesn't exist
      if (!office.likedBy) {
        office.likedBy = [];
      }

      // Check if the user has already liked the office
      if (office.likedBy.includes(userID)) {
        return handleResponse(
          res,
          400,
          "error",
          "You have already liked this office",
          null,
          0
        );
      }

      // Add the user's ID to the likedBy array
      office.likedBy.push(userID);
      await office.save();

      // Updated message to reflect successful liking of an office
      return handleResponse(
        res,
        201,
        "success",
        "Office liked successfully",
        null,
        0
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
  async getFavoriteOffices(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const userID = req.user.id;
      // Ensure the user exists
      const user = await Users.findById(userID);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Directly query for offices that the user has liked
      const favoriteOffices = await Offices.find({ likedBy: userID });
      // Check if the user has any favorite offices
      if (!favoriteOffices || favoriteOffices.length === 0) {
        return handleResponse(
          res,
          200,
          "success",
          "No favorite offices found",
          null,
          0
        );
      }
      // Successful response returning the favorite offices
      return handleResponse(
        res,
        200,
        "success",
        "Favorite offices retrieved successfully",
        favoriteOffices,
        favoriteOffices.length
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
  async deleteFavoriteOffice(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { officeId } = req.params; // Correctly extracting the office ID from request parameters
      const userID = req.user.id;

      // Verify the user exists (the check for user.jobSeeker is removed to generalize the function)
      const user = await Users.findById(userID);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Find the office by its ID
      const office = await Offices.findById(officeId);
      if (!office) {
        return handleResponse(res, 404, "error", "Office not found", null, 0);
      }

      // Check if the user has already liked the office
      if (office.likedBy && office.likedBy.includes(userID)) {
        // Remove the user's ID from the likedBy array
        office.likedBy = office.likedBy.filter(
          (id) => id.toString() !== userID
        );
        await office.save();
        return handleResponse(
          res,
          200,
          "success",
          "Office removed from favorites successfully",
          null,
          0
        );
      } else {
        return handleResponse(
          res,
          404,
          "error",
          "Office not found in favorites",
          null,
          0
        );
      }
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

module.exports = new OfficesCTRL();
