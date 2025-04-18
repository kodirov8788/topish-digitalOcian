const BaseController = require("./BaseController");
const Users = require("../../models/user_model");
const { handleResponse } = require("../../utils/handleResponse");
const mongoose = require("mongoose");

class UserQueryController extends BaseController {
  constructor() {
    super();
    // Bind methods to preserve 'this' context
    this.getAllUsers = this.getAllUsers.bind(this);
    this.searchUsers = this.searchUsers.bind(this);
    this.showCurrentUser = this.showCurrentUser.bind(this);
    this.getUser = this.getUser.bind(this);
    this.getRecommendedUsers = this.getRecommendedUsers.bind(this);
  }

  /**
   * Check if the user is authenticated
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {boolean} True if authenticated, false otherwise
   * @private
   */
  _checkAuth(req, res) {
    if (!req.user) {
      handleResponse(res, 401, "error", "Unauthorized", null, 0);
      return false;
    }
    return true;
  }

  async getAllUsers(req, res) {
    try {
      // Admin authorization check
      if ((await this._checkAdminAuth(req, res)) !== true) return;

      // Parse pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Parse filter parameters
      const role = req.query.role;
      const query = {};

      if (role) {
        query.role = role;
      }

      // Count total matching users for pagination metadata
      const totalUsers = await Users.countDocuments(query);

      // Get users with pagination
      const users = await Users.find(query)
        .select("-password -refreshTokens")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalUsers / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return handleResponse(
        res,
        200,
        "success",
        "Users retrieved successfully",
        {
          users,
          pagination: {
            totalUsers,
            totalPages,
            currentPage: page,
            limit,
            hasNextPage,
            hasPrevPage,
          },
        },
        users.length
      );
    } catch (error) {
      console.error("Error retrieving users:", error);
      return handleResponse(
        res,
        500,
        "error",
        "Failed to retrieve users: " + error.message,
        null,
        0
      );
    }
  }

  async searchUsers(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      // Parse pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Parse search parameters
      const { name, skills, location, jobTitle, role } = req.query;

      const query = {};

      // Build search query
      if (name) {
        query.$or = [
          { fullName: { $regex: name, $options: "i" } },
          { username: { $regex: name, $options: "i" } },
        ];
      }

      if (location) {
        query.location = { $regex: location, $options: "i" };
      }

      if (jobTitle) {
        query.jobTitle = { $regex: jobTitle, $options: "i" };
      }

      if (role) {
        query.role = role;
      }

      if (skills) {
        query["resume.skills"] = {
          $in: skills.split(",").map((s) => s.trim()),
        };
      }

      // Add visibility filter - only show users with public profiles unless admin
      const currentUser = await this._getUser(req.user.id);
      const isAdmin =
        currentUser.serverRole && currentUser.serverRole.includes("Admin");

      if (!isAdmin) {
        // Check if profiles are visible (either accountVisibility is public or resume.profileVisibility is true)
        query.$or = [
          ...(query.$or || []),
          { accountVisibility: "public" },
          { "resume.profileVisibility": true },
        ];
      }

      // Count total matches
      const totalUsers = await Users.countDocuments(query);

      // Execute search
      const users = await Users.find(query)
        .select("-password -refreshTokens")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalUsers / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return handleResponse(
        res,
        200,
        "success",
        "Users search completed",
        {
          users,
          pagination: {
            totalUsers,
            totalPages,
            currentPage: page,
            limit,
            hasNextPage,
            hasPrevPage,
          },
        },
        users.length
      );
    } catch (error) {
      console.error("Error searching users:", error);
      return handleResponse(
        res,
        500,
        "error",
        "Failed to search users: " + error.message,
        null,
        0
      );
    }
  }

  async showCurrentUser(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const user = await this._getUser(req.user.id);

      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      return handleResponse(
        res,
        200,
        "success",
        "Current user retrieved successfully",
        user,
        1
      );
    } catch (error) {
      console.error("Error retrieving current user:", error);
      return handleResponse(
        res,
        500,
        "error",
        "Failed to retrieve current user: " + error.message,
        null,
        0
      );
    }
  }

  async getUser(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const { userId } = req.params;

      // Validate userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return handleResponse(
          res,
          400,
          "error",
          "Invalid user ID format",
          null,
          0
        );
      }

      const user = await this._getUser(userId);

      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Check if the requester is the user or an admin - otherwise respect visibility settings
      const currentUser = await this._getUser(req.user.id);
      const isAdmin =
        currentUser.serverRole && currentUser.serverRole.includes("Admin");
      const isSelf = req.user.id === userId;

      if (!isAdmin && !isSelf) {
        // Check if profile is visible
        if (
          user.accountVisibility !== "public" &&
          !user.resume?.profileVisibility
        ) {
          return handleResponse(
            res,
            403,
            "error",
            "This user profile is not publicly visible",
            null,
            0
          );
        }
      }

      return handleResponse(
        res,
        200,
        "success",
        "User retrieved successfully",
        user,
        1
      );
    } catch (error) {
      console.error("Error retrieving user:", error);
      return handleResponse(
        res,
        500,
        "error",
        "Failed to retrieve user: " + error.message,
        null,
        0
      );
    }
  }

  async getRecommendedUsers(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      // Parse pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Get current user to find matches based on
      const currentUser = await this._getUser(req.user.id);

      if (!currentUser) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Build query for recommendations
      const query = {
        _id: { $ne: currentUser._id }, // Exclude current user
        "resume.profileVisibility": true, // Only visible profiles
        accountVisibility: "public",
      };

      // If user has skills, find others with matching skills
      if (
        currentUser.resume &&
        currentUser.resume.skills &&
        currentUser.resume.skills.length > 0
      ) {
        query["resume.skills"] = { $in: currentUser.resume.skills };
      }

      // If user has a location, prefer users in same location
      if (currentUser.location) {
        query.location = currentUser.location;
      }

      // Count total matches
      const totalUsers = await Users.countDocuments(query);

      // Get recommended users
      const recommendedUsers = await Users.find(query)
        .select("-password -refreshTokens")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalUsers / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return handleResponse(
        res,
        200,
        "success",
        "Recommended users retrieved successfully",
        {
          users: recommendedUsers,
          pagination: {
            totalUsers,
            totalPages,
            currentPage: page,
            limit,
            hasNextPage,
            hasPrevPage,
          },
        },
        recommendedUsers.length
      );
    } catch (error) {
      console.error("Error retrieving recommended users:", error);
      return handleResponse(
        res,
        500,
        "error",
        "Failed to retrieve recommended users: " + error.message,
        null,
        0
      );
    }
  }
}

module.exports = new UserQueryController();
