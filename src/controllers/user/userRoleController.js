const BaseController = require("./BaseController");
const Users = require("../../models/user_model");
const { handleResponse } = require("../../utils/handleResponse");
const mongoose = require("mongoose");

class UserRoleController extends BaseController {
  constructor() {
    super();
    // Bind methods to preserve 'this' context
    this.updateRole = this.updateRole.bind(this);
    this.addServerRoles = this.addServerRoles.bind(this);
    this.removeServerRole = this.removeServerRole.bind(this);
    this.getUsersWithRole = this.getUsersWithRole.bind(this);
    this.checkUserPermission = this.checkUserPermission.bind(this);
    this.normalizeMobileTokens = this.normalizeMobileTokens.bind(this);
    this.normalizeRefreshTokens = this.normalizeRefreshTokens.bind(this);
  }

  async updateRole(req, res) {
    try {
      // Only admins can update user roles
      if ((await this._checkAdminAuth(req, res)) !== true) return;

      const userId = req.params.id;
      const { role } = req.body;

      // Validate userId
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

      // Validate role
      if (!role) {
        return handleResponse(
          res,
          400,
          "error",
          "Please provide a valid role",
          null,
          0
        );
      }

      // List of allowed role values
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

      // Find user and update
      const user = await this._getUser(userId);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      user.role = role;
      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "User role updated successfully",
        { userId, previousRole: user.role, newRole: role },
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to update user role: " + error.message,
        null,
        0
      );
    }
  }

  async addServerRoles(req, res) {
    try {
      // Only admins can update server roles
      if ((await this._checkAdminAuth(req, res)) !== true) return;

      const { userId, roles } = req.body;

      // Validate userId
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

      // Validate roles
      if (!roles || !Array.isArray(roles) || roles.length === 0) {
        return handleResponse(
          res,
          400,
          "error",
          "Please provide an array of valid roles",
          null,
          0
        );
      }

      // List of allowed server role values
      const validServerRoles = [
        "Admin",
        "Supervisor",
        "Consultant",
        "Copywriter",
      ];

      // Filter out any invalid roles
      const validRoles = roles.filter((role) =>
        validServerRoles.includes(role)
      );

      if (validRoles.length === 0) {
        return handleResponse(
          res,
          400,
          "error",
          "No valid roles provided. Allowed roles are: " +
            validServerRoles.join(", "),
          null,
          0
        );
      }

      // Find user and update
      const user = await this._getUser(userId);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const previousRoles = [...user.serverRole];
      user.serverRole = validRoles;
      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Server roles updated successfully",
        {
          userId,
          previousRoles,
          currentRoles: user.serverRole,
        },
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to update server roles: " + error.message,
        null,
        0
      );
    }
  }

  async removeServerRole(req, res) {
    try {
      // Only admins can remove server roles
      if ((await this._checkAdminAuth(req, res)) !== true) return;

      const { userId, role } = req.body;

      // Validate userId
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

      // Validate role
      if (!role) {
        return handleResponse(
          res,
          400,
          "error",
          "Please provide a valid role to remove",
          null,
          0
        );
      }

      // Find user
      const user = await this._getUser(userId);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Check if user has the role
      if (!user.serverRole || !user.serverRole.includes(role)) {
        return handleResponse(
          res,
          400,
          "error",
          "User does not have the specified role",
          null,
          0
        );
      }

      // Make sure we don't remove the last Admin role if the user performing the action is removing their own Admin role
      if (role === "Admin" && userId === req.user.id) {
        // Check if there are other admins in the system
        const adminCount = await Users.countDocuments({
          serverRole: "Admin",
          _id: { $ne: userId },
        });

        if (adminCount === 0) {
          return handleResponse(
            res,
            400,
            "error",
            "Cannot remove the last Admin role from your account",
            null,
            0
          );
        }
      }

      // Remove the role
      const previousRoles = [...user.serverRole];
      user.serverRole = user.serverRole.filter((r) => r !== role);
      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        `Role '${role}' removed successfully`,
        {
          userId,
          previousRoles,
          currentRoles: user.serverRole,
        },
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to remove role: " + error.message,
        null,
        0
      );
    }
  }

  async getUsersWithRole(req, res) {
    try {
      // Only admins can view all users with specific roles
      if ((await this._checkAdminAuth(req, res)) !== true) return;

      const { role, serverRole } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Build query
      const query = {};

      if (role) {
        query.role = role;
      }

      if (serverRole) {
        query.serverRole = serverRole;
      }

      // Get total count for pagination
      const totalUsers = await Users.countDocuments(query);

      // Execute query with pagination
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
        `Retrieved users with ${role ? "role " + role : ""}${
          role && serverRole ? " and " : ""
        }${serverRole ? "server role " + serverRole : ""}`,
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

  async checkUserPermission(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const userId = req.params.userId || req.user.id;
      const { permission } = req.params;

      if (!permission) {
        return handleResponse(
          res,
          400,
          "error",
          "Permission parameter is required",
          null,
          0
        );
      }

      const user = await this._getUser(userId);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Check permissions based on serverRole
      let hasPermission = false;

      // Define permission mappings to server roles
      const permissionMap = {
        manageUsers: ["Admin"],
        manageRoles: ["Admin"],
        manageContent: ["Admin", "Supervisor", "Copywriter"],
        viewAnalytics: ["Admin", "Supervisor", "Consultant"],
        editSettings: ["Admin", "Supervisor"],
      };

      if (permissionMap[permission]) {
        for (const role of user.serverRole) {
          if (permissionMap[permission].includes(role)) {
            hasPermission = true;
            break;
          }
        }
      }

      return handleResponse(
        res,
        200,
        "success",
        "Permission check completed",
        {
          userId,
          permission,
          hasPermission,
          userRoles: user.serverRole,
        },
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to check permission: " + error.message,
        null,
        0
      );
    }
  }
  async normalizeMobileTokens(req, res) {
    try {
      // Only admins can perform this operation
      // if ((await this._checkAdminAuth(req, res)) !== true) return;

      // Find users with array-type mobileToken
      const users = await Users.find({
        $or: [
          { mobileToken: { $type: "array" } },
          { mobileToken: { $exists: true, $ne: null } },
        ],
      });
      let usersMobileToken = users.map((user) => user.mobileToken);
      console.log("usersMobileToken: ", usersMobileToken);
      console.log(
        `Found ${users.length} users that may need refreshTokens normalization`
      );
      console.log(
        `Found ${users.length} users that may need mobileToken normalization`
      );

      let updated = 0;
      let skipped = 0;
      let errors = 0;

      for (const user of users) {
        try {
          const originalToken = user.mobileToken;

          // Convert array to string
          if (
            Array.isArray(originalToken) ||
            originalToken === null ||
            originalToken === undefined
          ) {
            // Join array elements with comma or take the first element
            user.mobileToken = "";

            await user.save();
            updated++;
            console.log(
              `Normalized mobileToken for user ${user._id}: [${originalToken}] -> "${user.mobileToken}"`
            );
          } else {
            // Already a string or null/undefined
            skipped++;
          }
        } catch (userError) {
          errors++;
          console.error(
            `Error normalizing user ${user._id}: ${userError.message}`
          );
        }
      }

      return handleResponse(
        res,
        200,
        "success",
        "mobileToken normalization completed",
        {
          totalProcessed: users.length,
          updated,
          skipped,
          errors,
        },
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to normalize mobileTokens: " + error.message,
        null,
        0
      );
    }
  }
  async normalizeRefreshTokens(req, res) {
    try {
      // Only admins can perform this operation
      // if ((await this._checkAdminAuth(req, res)) !== true) return;

      // Find users with array-type refreshTokens
      const users = await Users.find();

      let updated = 0;
      let skipped = 0;
      let errors = 0;

      for (const user of users) {
        try {
          const originalTokens = user.refreshTokens;

          // Convert array to string
          if (
            Array.isArray(originalTokens) ||
            originalTokens === null ||
            originalTokens === undefined
          ) {
            // Join array elements with comma or take an empty string
            user.refreshTokens =
              originalTokens.length > 0 ? JSON.stringify(originalTokens) : "";

            await user.save();
            updated++;
            console.log(`Normalized refreshTokens for user ${user._id}`);
          } else {
            // Already a string or null/undefined
            skipped++;
          }
        } catch (userError) {
          errors++;
          console.error(
            `Error normalizing user ${user._id}: ${userError.message}`
          );
        }
      }

      return handleResponse(
        res,
        200,
        "success",
        "refreshTokens normalization completed",
        {
          totalProcessed: users.length,
          updated,
          skipped,
          errors,
        },
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to normalize refreshTokens: " + error.message,
        null,
        0
      );
    }
  }
}

module.exports = new UserRoleController();
