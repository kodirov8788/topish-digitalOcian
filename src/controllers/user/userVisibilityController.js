const BaseController = require("./BaseController");
const Users = require("../../models/user_model");
const { handleResponse } = require("../../utils/handleResponse");
const mongoose = require("mongoose");

class UserVisibilityController extends BaseController {
  constructor() {
    super();
    // Bind methods to preserve 'this' context
    this.updateUserVisibility = this.updateUserVisibility.bind(this);
    this.updateUserVisibilityById = this.updateUserVisibilityById.bind(this);
    this.updateAllUsersVisibility = this.updateAllUsersVisibility.bind(this);
    this.updateVisibilityByRole = this.updateVisibilityByRole.bind(this);
    this.getUserVisibilityStatus = this.getUserVisibilityStatus.bind(this);
  }

  async updateUserVisibility(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const user = await this._getUser(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const { visible } = req.body;

      // Validate the 'visible' field
      if (typeof visible !== "boolean") {
        return handleResponse(
          res,
          400,
          "error",
          "Invalid value for visible - must be true or false",
          null,
          0
        );
      }

      // Update visibility in resume section
      if (!user.resume) {
        user.resume = {};
      }

      user.resume.profileVisibility = visible;

      // Also update account visibility setting
      user.accountVisibility = visible ? "public" : "private";

      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Profile visibility updated successfully",
        { profileVisibility: user.resume.profileVisibility },
        1
      );
    } catch (error) {
      console.error("Error updating visibility for user:", error);
      return handleResponse(
        res,
        500,
        "error",
        "Failed to update visibility: " + error.message,
        null,
        0
      );
    }
  }

  async updateUserVisibilityById(req, res) {
    try {
      // Only admins can update other users' visibility
      if ((await this._checkAdminAuth(req, res)) !== true) return;

      const { userId } = req.params;
      const { visible } = req.body;

      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return handleResponse(
          res,
          400,
          "error",
          "Valid user ID is required",
          null,
          0
        );
      }

      // Validate the 'visible' field
      if (typeof visible !== "boolean") {
        return handleResponse(
          res,
          400,
          "error",
          "Invalid value for visible - must be true or false",
          null,
          0
        );
      }

      const user = await this._getUser(userId);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Update visibility in resume section
      if (!user.resume) {
        user.resume = {};
      }

      user.resume.profileVisibility = visible;

      // Also update account visibility setting
      user.accountVisibility = visible ? "public" : "private";

      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "User profile visibility updated successfully",
        {
          userId,
          profileVisibility: user.resume.profileVisibility,
          accountVisibility: user.accountVisibility,
        },
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to update user visibility: " + error.message,
        null,
        0
      );
    }
  }

  async updateAllUsersVisibility(req, res) {
    try {
      // Only admins can update all users' visibility
      if ((await this._checkAdminAuth(req, res)) !== true) return;

      const { visible } = req.body;

      // Validate the 'visible' field
      if (typeof visible !== "boolean") {
        return handleResponse(
          res,
          400,
          "error",
          "Invalid value for visible - must be true or false",
          null,
          0
        );
      }

      // First, count how many users will be updated
      const totalUsers = await Users.countDocuments({});

      // Update all users
      const result = await Users.updateMany(
        {},
        {
          $set: {
            "resume.profileVisibility": visible,
            accountVisibility: visible ? "public" : "private",
          },
        }
      );

      return handleResponse(
        res,
        200,
        "success",
        `Visibility updated for ${result.modifiedCount} users`,
        {
          modifiedCount: result.modifiedCount,
          matchedCount: result.matchedCount,
          totalUsers,
        },
        result.modifiedCount
      );
    } catch (error) {
      console.error("Error updating visibility for all users:", error);
      return handleResponse(
        res,
        500,
        "error",
        "Failed to update visibility for all users: " + error.message,
        null,
        0
      );
    }
  }

  async updateVisibilityByRole(req, res) {
    try {
      // Only admins can update visibility by role
      if ((await this._checkAdminAuth(req, res)) !== true) return;

      const { role, visible } = req.body;

      if (!role) {
        return handleResponse(
          res,
          400,
          "error",
          "Role parameter is required",
          null,
          0
        );
      }

      // Validate the 'visible' field
      if (typeof visible !== "boolean") {
        return handleResponse(
          res,
          400,
          "error",
          "Invalid value for visible - must be true or false",
          null,
          0
        );
      }

      // Validate role
      const validRoles = [
        "JobSeeker",
        "Employer",
        "Service",
        "Admin",
        "SubAdmin",
        "Manager",
      ];
      if (!validRoles.includes(role)) {
        return handleResponse(
          res,
          400,
          "error",
          "Invalid role. Allowed roles are: " + validRoles.join(", "),
          null,
          0
        );
      }

      // Update users with the specified role
      const result = await Users.updateMany(
        { role },
        {
          $set: {
            "resume.profileVisibility": visible,
            accountVisibility: visible ? "public" : "private",
          },
        }
      );

      return handleResponse(
        res,
        200,
        "success",
        `Visibility updated for ${result.modifiedCount} users with role ${role}`,
        {
          role,
          modifiedCount: result.modifiedCount,
          matchedCount: result.matchedCount,
        },
        result.modifiedCount
      );
    } catch (error) {
      console.error("Error updating visibility by role:", error);
      return handleResponse(
        res,
        500,
        "error",
        "Failed to update visibility by role: " + error.message,
        null,
        0
      );
    }
  }

  async getUserVisibilityStatus(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const userId = req.params.userId || req.user.id;

      // If checking another user's visibility status, check if admin
      if (userId !== req.user.id) {
        const isAdmin = await this._checkAdminAuth(req, res);
        if (!isAdmin) return;
      }

      const user = await this._getUser(userId);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Get visibility status from different places
      const visibility = {
        profileVisibility: user.resume?.profileVisibility || false,
        accountVisibility: user.accountVisibility || "private",
        isPublic:
          user.resume?.profileVisibility === true ||
          user.accountVisibility === "public",
      };

      return handleResponse(
        res,
        200,
        "success",
        "User visibility status retrieved",
        visibility,
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to get visibility status: " + error.message,
        null,
        0
      );
    }
  }
}

module.exports = new UserVisibilityController();
