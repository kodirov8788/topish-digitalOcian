const AppVersion = require("../models/app_version_model");
const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");
const semver = require("semver"); // You'll need to install this: npm install semver

class AppVersionCTRL {
  async getVersionInfo(req, res) {
    try {
      const { platform, version } = req.query;

      // Validate input
      if (!platform || !["ios", "android"].includes(platform.toLowerCase())) {
        return handleResponse(
          res,
          400,
          "error",
          "Invalid platform specified. Use 'ios' or 'android'.",
          null,
          0
        );
      }

      // Get version info for the specified platform
      const versionInfo = await AppVersion.findOne({
        platform: platform.toLowerCase(),
      });

      if (!versionInfo) {
        return handleResponse(
          res,
          404,
          "error",
          `No version information found for ${platform}`,
          null,
          0
        );
      }

      // If client provided their version, check if update is needed
      let updateStatus = {
        hasUpdate: false,
        forceUpdate: false,
      };

      if (version) {
        // Compare versions using semver
        updateStatus.hasUpdate = semver.lt(version, versionInfo.latestVersion);
        updateStatus.forceUpdate = semver.lt(
          version,
          versionInfo.minRequiredVersion
        );
      }

      return handleResponse(
        res,
        200,
        "success",
        "Version information retrieved successfully",
        {
          latestVersion: versionInfo.latestVersion,
          minRequiredVersion: versionInfo.minRequiredVersion,
          updateMessage: versionInfo.updateMessage,
          updateUrl: versionInfo.updateUrl,
          updateRequired:
            updateStatus.forceUpdate || versionInfo.updateRequired,
          hasUpdate: updateStatus.hasUpdate,
        },
        1
      );
    } catch (error) {
      console.error("Error in getVersionInfo function:", error);
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

  async createOrUpdateVersion(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findById(req.user.id).select(
        "-password -refreshTokens"
      );
      if (user.role !== "Admin") {
        return handleResponse(
          res,
          403,
          "error",
          "Only admins can manage app versions",
          null,
          0
        );
      }

      const {
        platform,
        latestVersion,
        minRequiredVersion,
        updateMessage,
        updateUrl,
        updateRequired,
      } = req.body;

      // Validate input
      if (!platform || !latestVersion) {
        return handleResponse(
          res,
          400,
          "error",
          "Missing required fields",
          null,
          0
        );
      }

      if (!["ios", "android"].includes(platform.toLowerCase())) {
        return handleResponse(
          res,
          400,
          "error",
          "Platform must be 'ios' or 'android'",
          null,
          0
        );
      }

      // // Validate version format using semver
      // if (!semver.valid(latestVersion) || !semver.valid(minRequiredVersion)) {
      //   return handleResponse(
      //     res,
      //     400,
      //     "error",
      //     "Invalid version format. Use semantic versioning (e.g., 1.0.0)",
      //     null,
      //     0
      //   );
      // }

      // Check if minimum version is not greater than latest version
      // if (semver.gt(minRequiredVersion, latestVersion)) {
      //   return handleResponse(
      //     res,
      //     400,
      //     "error",
      //     "Minimum required version cannot be greater than latest version",
      //     null,
      //     0
      //   );
      // }

      // Find the current version record first
      const currentVersion = await AppVersion.findOne({
        platform: platform.toLowerCase(),
      });

      let versionInfo;

      if (currentVersion) {
        // If a record exists, add current values to history before updating
        currentVersion.versionHistory.push({
          latestVersion: currentVersion.latestVersion,
          minRequiredVersion: currentVersion.minRequiredVersion,
          updateMessage: currentVersion.updateMessage,
          updateUrl: currentVersion.updateUrl,
          updateRequired: currentVersion.updateRequired,
          createdBy: currentVersion.createdBy,
          updatedAt: new Date(),
        });

        // Update the current values
        currentVersion.latestVersion = latestVersion;
        currentVersion.minRequiredVersion = minRequiredVersion;
        currentVersion.updateMessage =
          updateMessage ||
          "Please update to the latest version for new features and bug fixes.";
        currentVersion.updateUrl = updateUrl;
        currentVersion.updateRequired =
          updateRequired !== undefined ? updateRequired : false;
        currentVersion.createdBy = req.user.id;

        versionInfo = await currentVersion.save();
      } else {
        // Create new record with empty history
        versionInfo = await AppVersion.create({
          platform: platform.toLowerCase(),
          latestVersion,
          minRequiredVersion,
          updateMessage:
            updateMessage ||
            "Please update to the latest version for new features and bug fixes.",
          updateUrl,
          updateRequired: updateRequired !== undefined ? updateRequired : false,
          createdBy: req.user.id,
          versionHistory: [],
        });
      }

      return handleResponse(
        res,
        200,
        "success",
        "App version information updated successfully",
        versionInfo,
        1
      );
    } catch (error) {
      console.error("Error in createOrUpdateVersion function:", error);
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

  async getAllVersions(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findById(req.user.id).select(
        "-password -refreshTokens"
      );
      if (user.role !== "Admin") {
        return handleResponse(
          res,
          403,
          "error",
          "Only admins can view all app versions",
          null,
          0
        );
      }

      const versions = await AppVersion.find().sort({ platform: 1 });

      return handleResponse(
        res,
        200,
        "success",
        "All app versions retrieved successfully",
        versions,
        versions.length
      );
    } catch (error) {
      console.error("Error in getAllVersions function:", error);
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

  async getVersionHistory(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findById(req.user.id).select(
        "-password -refreshTokens"
      );
      if (user.role !== "Admin") {
        return handleResponse(
          res,
          403,
          "error",
          "Only admins can view version history",
          null,
          0
        );
      }

      const { platform } = req.params;

      if (!platform || !["ios", "android"].includes(platform.toLowerCase())) {
        return handleResponse(
          res,
          400,
          "error",
          "Invalid platform specified",
          null,
          0
        );
      }

      const versionData = await AppVersion.findOne({
        platform: platform.toLowerCase(),
      }).populate("createdBy", "fullName");

      if (!versionData) {
        return handleResponse(
          res,
          404,
          "error",
          `No version data found for ${platform}`,
          null,
          0
        );
      }

      // Format the response with current and historical data
      const response = {
        current: {
          latestVersion: versionData.latestVersion,
          minRequiredVersion: versionData.minRequiredVersion,
          updateMessage: versionData.updateMessage,
          updateUrl: versionData.updateUrl,
          updateRequired: versionData.updateRequired,
          updatedBy: versionData.createdBy,
          updatedAt: versionData.updatedAt,
        },
        history: versionData.versionHistory.map((entry) => ({
          latestVersion: entry.latestVersion,
          minRequiredVersion: entry.minRequiredVersion,
          updateMessage: entry.updateMessage,
          updateUrl: entry.updateUrl,
          updateRequired: entry.updateRequired,
          updatedBy: entry.createdBy,
          timestamp: entry.updatedAt,
        })),
      };

      return handleResponse(
        res,
        200,
        "success",
        "Version history retrieved successfully",
        response,
        1 + response.history.length
      );
    } catch (error) {
      console.error("Error in getVersionHistory:", error);
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

module.exports = new AppVersionCTRL();
