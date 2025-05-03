/**
 * Authentication Registration Controller
 * Manages all registration-related functionality, including:
 * - Sending registration codes
 * - Confirming registration
 * - Creating new user accounts
 * - Admin-based user registration
 */

const BaseAuthController = require("./BaseAuthController");
const Users = require("../../models/user_model");
const PendingUsers = require("../../models/pending_register_model");
const { PromptCode } = require("../../models/other_models");
const { generateTokens, createTokenUser } = require("../../utils/jwt");
const { handleResponse } = require("../../utils/handleResponse");
const { RegisterValidation } = require("../../helpers/AuthValidation");
const {
  getEskizAuthToken,
  sendCustomSms,
  makeVoiceCall,
} = require("../../utils/smsService");
const { sendOtpMessage } = require("../../utils/engagelab_smsService");

class AuthRegistrationController extends BaseAuthController {
  constructor() {
    super();
    // Bind all methods to this instance to preserve context
    this.registerUserByAdmin = this.registerUserByAdmin.bind(this);
    this.sendRegisterCode = this.sendRegisterCode.bind(this);
    this.confirmRegisterCode = this.confirmRegisterCode.bind(this);
    this.resendConfirmationCode = this.resendConfirmationCode.bind(this);
    this.sendVoiceCall = this.sendVoiceCall.bind(this);
    this.addUsernamesToAllUsers = this.addUsernamesToAllUsers.bind(this);
  }

  /**
   * Admin endpoint to create a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async registerUserByAdmin(req, res) {
    try {
      if (!(await this._checkAdminAuth(req, res))) return;

      const { phoneNumber, role } = req.body;

      if (!phoneNumber) {
        return handleResponse(
          res,
          400,
          "error",
          "Phone number and role are required",
          null,
          0
        );
      }

      const phoneNumberWithCountryCode = this._formatPhoneNumber(phoneNumber);

      let existingUser = await Users.findOne({
        phoneNumber: phoneNumberWithCountryCode,
      }).select("-password -refreshTokens");

      if (existingUser) {
        return handleResponse(
          res,
          400,
          "error",
          "User already exists with this phone number",
          null,
          0
        );
      }

      const newUser = new Users({
        phoneNumber: phoneNumberWithCountryCode,
        phoneConfirmed: true,
        fullName: this._createRandomFullname(),
        resume: this._createDefaultResume(),
      });

      await newUser.save();

      return handleResponse(
        res,
        201,
        "success",
        "User registered successfully by admin.",
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

  /**
   * Send registration confirmation code
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async sendRegisterCode(req, res) {
    try {
      const { error } = RegisterValidation(req.body);
      if (error) {
        return handleResponse(res, 400, "error", error.details[0].message);
      }

      const { phoneNumber, mobileToken } = req.body;
      const phoneNumberWithCountryCode = this._formatPhoneNumber(phoneNumber);

      // Check if there's an existing user with this phone number
      const existingUser = await Users.findOne({
        phoneNumber: phoneNumberWithCountryCode,
      }).select("-password -refreshTokens");

      if (existingUser && existingUser.phoneConfirmed) {
        return handleResponse(
          res,
          400,
          "error",
          "An account already exists with this phone number. Please login instead.",
          null,
          0
        );
      }

      const { code: confirmationCode, expires: confirmationCodeExpires } =
        this._generateConfirmationCode(phoneNumberWithCountryCode);

      // For test numbers, just store code without sending SMS
      if (this._isTestPhoneNumber(phoneNumberWithCountryCode)) {
        await PendingUsers.findOneAndUpdate(
          { phoneNumber: phoneNumberWithCountryCode },
          {
            phoneNumber: phoneNumberWithCountryCode,
            confirmationCode,
            confirmationCodeExpires,
            mobileToken: mobileToken || "",
          },
          { upsert: true, new: true }
        );

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

        // Store the pending registration
        await PendingUsers.findOneAndUpdate(
          { phoneNumber: phoneNumberWithCountryCode },
          {
            phoneNumber: phoneNumberWithCountryCode,
            confirmationCode,
            confirmationCodeExpires,
            mobileToken: mobileToken || "",
          },
          { upsert: true, new: true }
        );

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
   * Confirm registration with code and create/update user account
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async confirmRegisterCode(req, res) {
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

      // First check in the pending users collection
      const pendingUser = await PendingUsers.findOne({
        phoneNumber: phoneNumberWithCountryCode,
        confirmationCode,
      });

      if (!pendingUser || new Date() > pendingUser.confirmationCodeExpires) {
        return handleResponse(
          res,
          400,
          "error",
          "Invalid or expired confirmation code",
          null,
          0
        );
      }

      // Check if there's an existing user
      let existingUser = await Users.findOne({
        phoneNumber: phoneNumberWithCountryCode,
      }).select("-password");

      let prompt = await PromptCode.find();

      // Create a new user or update the existing one
      if (!existingUser) {
        // Create a completely new user
        existingUser = new Users({
          phoneNumber: phoneNumberWithCountryCode,
          phoneConfirmed: true,
          savedJobs: [],
          searchJob: true,
          resume: this._createDefaultResume(),
          fullName: this._createRandomFullname(),
          gptPrompt: prompt[0]?.code || "",
          jobTitle: "",
          mobileToken: pendingUser.mobileToken || "",
        });
      } else {
        // Update existing user
        existingUser.phoneConfirmed = true;
        existingUser.confirmationCode = null;
        existingUser.confirmationCodeExpires = null;

        // Add mobile token if it doesn't exist
        if (pendingUser.mobileToken) {
          existingUser.mobileToken = pendingUser.mobileToken;
        }
      }

      await existingUser.save();

      // Generate tokens for the user
      const tokenUser = createTokenUser(existingUser);
      const { accessToken, refreshToken } = generateTokens(tokenUser);

      // Update refresh token
      existingUser.refreshTokens = refreshToken;

      await existingUser.save();

      // Clean up - remove from pending users
      await PendingUsers.findOneAndDelete({
        phoneNumber: phoneNumberWithCountryCode,
      });

      return handleResponse(
        res,
        201,
        "success",
        "User registered successfully.",
        { accessToken, refreshToken, role: existingUser.serverRole }
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
   * Resend confirmation code for registration
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async resendConfirmationCode(req, res) {
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
          400,
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

      if (this._isTestPhoneNumber(phoneNumberWithCountryCode)) {
        return handleResponse(
          res,
          200,
          "success",
          "Confirmation code resent successfully. Please check your phone for the new confirmation code.",
          null,
          0
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
          "Confirmation code resent successfully. Please check your phone for the new confirmation code.",
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

  /**
   * Send voice call with confirmation code
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async sendVoiceCall(req, res) {
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

      const formattedPhoneNumber = this._formatPhoneNumber(phoneNumber);

      const user = await Users.findOne({
        phoneNumber: formattedPhoneNumber,
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

      if (!user.confirmationCode) {
        return handleResponse(
          res,
          400,
          "error",
          "No confirmation code exists for this user. Request a code first.",
          null,
          0
        );
      }

      const confirmationCodeExpires = new Date(Date.now() + 2 * 60 * 1000);
      user.confirmationCodeExpires = confirmationCodeExpires;
      await user.save();

      let newConfirmationCode = String(user.confirmationCode)
        .split("")
        .join(" ");
      await makeVoiceCall(
        formattedPhoneNumber,
        `code is ${newConfirmationCode}`
      );

      return handleResponse(
        res,
        200,
        "success",
        "Voice call initiated. You will receive a call with your confirmation code.",
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

  /**
   * Administrator endpoint to add usernames to all users
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addUsernamesToAllUsers(req, res) {
    try {
      if (!(await this._checkAdminAuth(req, res))) return;

      // Find all users
      const users = await Users.find().select("-password -refreshTokens");
      let updatedCount = 0;

      // Iterate over each user
      for (let user of users) {
        // Ensure fullName is set if empty
        if (!user.fullName || user.fullName.trim() === "") {
          user.fullName = this._createRandomFullname();
          await user.save();
          updatedCount++;
        }
      }

      return handleResponse(
        res,
        200,
        "success",
        `Updated ${updatedCount} users with random fullNames`,
        { updatedCount },
        updatedCount
      );
    } catch (error) {
      console.error("Error updating fullNames:", error);
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

module.exports = new AuthRegistrationController();
