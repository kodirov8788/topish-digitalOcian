const BaseController = require("./BaseController");
const Users = require("../../models/user_model");
const { attachCookiesToResponse, createTokenUser } = require("../../utils");
const { handleResponse } = require("../../utils/handleResponse");

class UserProfileController extends BaseController {
  constructor() {
    super();
    // Bind methods to preserve 'this' context
    this.updateUserNumber = this.updateUserNumber.bind(this);
    this.updateUserEmail = this.updateUserEmail.bind(this);
    this.updateUserPurpose = this.updateUserPurpose.bind(this);
    this.updateUserPassword = this.updateUserPassword.bind(this);
    this.updateUserProfile = this.updateUserProfile.bind(this);
    this.updateUsername = this.updateUsername.bind(this);
    this.updateJobTitle = this.updateJobTitle.bind(this);
    this.updateAvatar = this.updateAvatar.bind(this);
  }

  async updateUserNumber(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return handleResponse(
          res,
          400,
          "error",
          "Please provide a phone number",
          null,
          0
        );
      }

      // Check if phone number is already in use by another user
      const existingUser = await Users.findOne({
        phoneNumber,
        _id: { $ne: req.user.id },
      });

      if (existingUser) {
        return handleResponse(
          res,
          400,
          "error",
          "Phone number already in use",
          null,
          0
        );
      }

      const user = await this._getUser(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      user.phoneNumber = phoneNumber;
      await user.save();

      const tokenUser = createTokenUser(user);
      attachCookiesToResponse({ res, user: tokenUser });

      return handleResponse(
        res,
        200,
        "success",
        "Phone number updated successfully",
        tokenUser,
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

  async updateUserEmail(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const { email } = req.body;
      if (!email) {
        return handleResponse(
          res,
          400,
          "error",
          "Please provide an email",
          null,
          0
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return handleResponse(
          res,
          400,
          "error",
          "Please provide a valid email address",
          null,
          0
        );
      }

      const user = await this._getUser(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Check if email exists in resume.contact
      if (user.resume && user.resume.contact) {
        user.resume.contact.email = email;
      }

      // Also update main email field if it exists
      if (user.email !== undefined) {
        user.email = email;
      }

      await user.save();

      const tokenUser = createTokenUser(user);
      attachCookiesToResponse({ res, user: tokenUser });

      return handleResponse(
        res,
        200,
        "success",
        "Email updated successfully",
        tokenUser,
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

  async updateUserPurpose(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const { purpose } = req.body;
      let user = await this._getUser(req.user.id);

      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      user.purpose = purpose?.length ? purpose : "";
      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Purpose updated successfully",
        user,
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

  async updateUserPassword(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return handleResponse(
          res,
          400,
          "error",
          "Please provide old and new passwords",
          null,
          0
        );
      }

      if (newPassword.length < 8) {
        return handleResponse(
          res,
          400,
          "error",
          "Password must be at least 8 characters long",
          null,
          0
        );
      }

      const user = await this._getUser(req.user.id, true);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const isPasswordCorrect = await user.comparePassword(oldPassword);
      if (!isPasswordCorrect) {
        return handleResponse(
          res,
          401,
          "error",
          "Current password is incorrect",
          null,
          0
        );
      }

      user.password = newPassword;
      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Password updated successfully",
        null,
        0
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }

  async updateUserProfile(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const user = await this._getUser(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Extract the fields from the request body
      const {
        fullName,
        location,
        purpose,
        jobTitle,
        gender,
        birthday,
        expectedSalary,
        skills,
        industry,
        employmentType,
      } = req.body;

      // Update basic user fields if provided
      if (fullName !== undefined) user.fullName = fullName;
      if (location !== undefined) user.location = location;
      if (purpose !== undefined) user.purpose = purpose;
      if (jobTitle !== undefined) user.jobTitle = jobTitle;
      if (
        gender !== undefined &&
        ["Male", "Female", "Choose"].includes(gender)
      ) {
        user.gender = gender;
      }
      if (birthday !== undefined) user.birthday = birthday;

      // Create or update resume fields
      if (!user.resume) {
        user.resume = {};
      }

      // Update resume fields if provided
      if (expectedSalary !== undefined)
        user.resume.expectedSalary = expectedSalary;
      if (skills !== undefined && Array.isArray(skills))
        user.resume.skills = skills;
      if (industry !== undefined && Array.isArray(industry))
        user.resume.industry = industry;
      if (employmentType !== undefined && Array.isArray(employmentType))
        user.resume.employmentType = employmentType;

      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Profile updated successfully",
        user,
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

  async updateUsername(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const userId = req.user.id;
      let { username } = req.body;

      if (!username) {
        return handleResponse(
          res,
          400,
          "error",
          "Please provide a username",
          null,
          0
        );
      }

      // Sanitize and validate username
      username = username
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "")
        .replace(/[^a-zA-Z0-9]/g, "");

      if (username.length < 3) {
        return handleResponse(
          res,
          400,
          "error",
          "Username must be at least 3 characters long",
          null,
          0
        );
      }

      // Check if the username already exists
      const existingUser = await Users.findOne({
        username,
        _id: { $ne: userId },
      }).select("-password -refreshTokens");

      if (existingUser) {
        return handleResponse(
          res,
          400,
          "error",
          "Username already in use",
          null,
          0
        );
      }

      const user = await this._getUser(userId);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      user.username = username;
      const updatedUser = await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Username updated successfully",
        updatedUser,
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

  async updateJobTitle(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const { jobTitle } = req.body;
      if (!jobTitle) {
        return handleResponse(
          res,
          400,
          "error",
          "Please provide a job title",
          null,
          0
        );
      }

      const user = await this._getUser(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      user.jobTitle = jobTitle;
      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Job title updated successfully",
        user,
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

  async updateAvatar(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const { avatarUrl } = req.body;
      if (!avatarUrl) {
        return handleResponse(
          res,
          400,
          "error",
          "Please provide an avatar URL",
          null,
          0
        );
      }

      const user = await this._getUser(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      user.avatar = avatarUrl;
      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Avatar updated successfully",
        user,
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

module.exports = new UserProfileController();
