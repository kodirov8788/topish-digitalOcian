/**
 * Authentication Account Controller
 * Manages user account operations, including:
 * - Account deletion
 * - Account security management
 * - Delete confirmation verification
 */

const BaseAuthController = require("./BaseAuthController");
const Users = require("../../models/user_model");
const { handleResponse } = require("../../utils/handleResponse");
const { deleteUserAvatar } = require("../../controllers/avatarCTRL");
const { deleteUserCv } = require("../../controllers/resumeCTRL/CvCTRL");
const {
  getEskizAuthToken,
  sendCustomSms,
  checkSmsStatus,
} = require("../../utils/smsService");
const { sendOtpMessage } = require("../../utils/engagelab_smsService");

class AuthAccountController extends BaseAuthController {
  constructor() {
    super();
    // Bind all methods to this instance to preserve context
    this.deleteAccount = this.deleteAccount.bind(this);
    this.sendDeleteAccountCode = this.sendDeleteAccountCode.bind(this);
    this.confirmDeleteAccount = this.confirmDeleteAccount.bind(this);
    this.updateProfileInfo = this.updateProfileInfo.bind(this);
    this.updatePrivacySettings = this.updatePrivacySettings.bind(this);
    this.checkSmsStatus = this.checkSmsStatus.bind(this);
  }

  /**
   * Validate user session and return user object if valid
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object|null} User object if session is valid, null otherwise
   * @private
   */
  async _validateSession(req, res) {
    if (!req.user) {
      handleResponse(res, 401, "error", "Unauthorized!", null, 0);
      return null;
    }

    const user = await Users.findById(req.user.id).select("-password");
    if (!user) {
      handleResponse(res, 404, "error", "User not found", null, 0);
      return null;
    }

    return user;
  }

  /**
   * Delete authenticated user's account
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteAccount(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized!", null, 0);
      }

      const userID = req.user.id;
      const user = await Users.findById(userID).select(
        "-password -refreshTokens"
      );
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Delete associated data
      try {
        await deleteUserAvatar(userID);
      } catch (error) {
        console.error("Error deleting user avatar:", error);
      }

      try {
        await deleteUserCv(userID);
      } catch (error) {
        console.error("Error deleting user CV:", error);
      }

      await user.deleteOne();
      return handleResponse(
        res,
        200,
        "success",
        "Account and associated data deleted successfully",
        null,
        0
      );
    } catch (err) {
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + err.message,
        null,
        0
      );
    }
  }

  /**
   * Send confirmation code for account deletion
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async sendDeleteAccountCode(req, res) {
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        return handleResponse(
          res,
          400,
          "error",
          "Phone number is required",
          null,
          0
        );
      }

      const phoneNumberWithCountryCode = this._formatPhoneNumber(phoneNumber);
      const user = await Users.findOne({
        phoneNumber: phoneNumberWithCountryCode,
      }).select("-password -refreshTokens");

      if (!user) {
        return handleResponse(
          res,
          404,
          "error",
          "User not found with this phone number",
          null,
          0
        );
      }

      const { code: confirmationCode, expires: confirmationCodeExpires } =
        this._generateConfirmationCode(phoneNumberWithCountryCode);

      user.confirmationCode = confirmationCode;
      user.confirmationCodeExpires = confirmationCodeExpires;
      await user.save();

      // For test numbers, don't send SMS
      if (this._isTestPhoneNumber(phoneNumberWithCountryCode)) {
        return handleResponse(
          res,
          200,
          "success",
          "Confirmation code sent. Please check your phone.",
          null,
          1
        );
      } else {
        if (process.env.NODE_ENV === "production") {
          try {
            // For Uzbekistan numbers, use Eskiz service
            if (phoneNumberWithCountryCode.startsWith("+998")) {
              const token = await getEskizAuthToken();
              const message = `topish Ilovasiga kirish uchun tasdiqlash kodingiz: ${confirmationCode} OJt59qMBmYJ`;
              await sendCustomSms(token, phoneNumberWithCountryCode, message);
              console.log(
                `OTP sent to ${phoneNumberWithCountryCode} using Eskiz service`
              );
            }
            // For USA (+1) and China (+86) numbers, use Engagelab
            else if (
              phoneNumberWithCountryCode.startsWith("+1") ||
              phoneNumberWithCountryCode.startsWith("+86")
            ) {
              await sendOtpMessage(
                phoneNumberWithCountryCode,
                confirmationCode
              );
              console.log(
                `OTP sent to ${phoneNumberWithCountryCode} using Engagelab service`
              );
            }
            // For other international numbers, show error
            else {
              console.error(
                `Unsupported phone number format: ${phoneNumberWithCountryCode}`
              );
              return handleResponse(
                res,
                400,
                "error",
                "Unsupported phone number format. Please use a phone number from Uzbekistan, USA, or China.",
                null,
                0
              );
            }
          } catch (smsError) {
            console.error("Error sending SMS:", smsError);
            return handleResponse(
              res,
              500,
              "error",
              "Failed to send SMS. Please try again later.",
              null,
              0
            );
          }
        }

        return handleResponse(
          res,
          200,
          "success",
          "Confirmation code sent. Please check your phone.",
          null,
          1
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

  /**
   * Confirm account deletion with verification code
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async confirmDeleteAccount(req, res) {
    try {
      const { phoneNumber, confirmationCode } = req.body;

      if (!phoneNumber || !confirmationCode) {
        return handleResponse(
          res,
          400,
          "error",
          "Phone number and confirmation code are required",
          null,
          0
        );
      }

      const phoneNumberWithCountryCode = this._formatPhoneNumber(phoneNumber);
      const user = await Users.findOne({
        phoneNumber: phoneNumberWithCountryCode,
        confirmationCode,
      }).select("-password -refreshTokens");

      if (!user || new Date() > user.confirmationCodeExpires) {
        return handleResponse(
          res,
          400,
          "error",
          "Invalid or expired confirmation code",
          null,
          0
        );
      }

      // Delete associated data first
      try {
        await deleteUserAvatar(user._id);
      } catch (avatarError) {
        console.error("Error deleting user avatar:", avatarError);
      }

      try {
        await deleteUserCv(user._id);
      } catch (cvError) {
        console.error("Error deleting user CV:", cvError);
      }

      // Delete the user account
      await user.deleteOne();

      return handleResponse(
        res,
        200,
        "success",
        "Account and associated data deleted successfully",
        null,
        0
      );
    } catch (err) {
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + err.message,
        null,
        0
      );
    }
  }

  /**
   * Update basic user profile information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProfileInfo(req, res) {
    try {
      const user = await this._validateSession(req, res);
      if (!user) return;

      const { fullName, jobTitle, username, gender, location, birthday } =
        req.body;

      // Update fields if provided
      if (fullName !== undefined) {
        user.fullName = fullName;
      }

      if (jobTitle !== undefined) {
        user.jobTitle = jobTitle;
      }

      if (username !== undefined) {
        // Check if username is taken
        if (username) {
          const existingUser = await Users.findOne({
            username,
            _id: { $ne: user._id },
          });

          if (existingUser) {
            return handleResponse(
              res,
              400,
              "error",
              "Username is already taken",
              null,
              0
            );
          }
        }
        user.username = username;
      }

      if (
        gender !== undefined &&
        ["Male", "Female", "Choose"].includes(gender)
      ) {
        user.gender = gender;
      }

      if (location !== undefined) {
        user.location = location;
      }

      if (birthday !== undefined) {
        user.birthday = birthday;
      }

      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Profile information updated successfully",
        {
          fullName: user.fullName,
          jobTitle: user.jobTitle,
          username: user.username,
          gender: user.gender,
          location: user.location,
          birthday: user.birthday,
        }
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

  /**
   * Update account privacy settings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updatePrivacySettings(req, res) {
    try {
      const user = await this._validateSession(req, res);
      if (!user) return;

      const { profileVisibility, accountVisibility, searchJob } = req.body;

      // Update fields if provided
      if (profileVisibility !== undefined) {
        user.resume.profileVisibility = profileVisibility;
      }

      if (accountVisibility !== undefined) {
        user.accountVisibility = accountVisibility;
      }

      if (searchJob !== undefined) {
        user.searchJob = searchJob;
      }

      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Privacy settings updated successfully",
        {
          profileVisibility: user.resume.profileVisibility,
          accountVisibility: user.accountVisibility,
          searchJob: user.searchJob,
        }
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

  /**
   * Check SMS delivery status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async checkSmsStatus(req, res) {
    try {
      const token = await getEskizAuthToken();
      const { dispatchId } = req.body;

      if (!dispatchId) {
        return handleResponse(
          res,
          400,
          "error",
          "Dispatch ID is required",
          null,
          0
        );
      }

      const response = await checkSmsStatus(token, dispatchId);

      return handleResponse(
        res,
        200,
        "success",
        "SMS status checked successfully",
        response
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

module.exports = new AuthAccountController();
