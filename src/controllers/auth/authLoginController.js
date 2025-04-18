/**
 * Authentication Login Controller
 * Manages all login-related functionality, including:
 * - Sending login verification codes
 * - Verifying login attempts
 * - Session management (login/logout)
 */

const BaseAuthController = require("./BaseAuthController");
const Users = require("../../models/user_model");
const { generateTokens, createTokenUser } = require("../../utils/jwt");
const { handleResponse } = require("../../utils/handleResponse");
const jwt = require("jsonwebtoken");
const { getEskizAuthToken, sendCustomSms } = require("../../utils/smsService");
const { sendOtpMessage } = require("../../utils/engagelab_smsService");

class AuthLoginController extends BaseAuthController {
  constructor() {
    super();
    // Bind all methods to this instance to preserve context in Express callbacks
    this.sendLoginCode = this.sendLoginCode.bind(this);
    this.confirmLogin = this.confirmLogin.bind(this);
    this.signOut = this.signOut.bind(this);
    this.renewAccessToken = this.renewAccessToken.bind(this);
    this.getRefreshTokens = this.getRefreshTokens.bind(this);
    this.deleteRefreshToken = this.deleteRefreshToken.bind(this);
  }

  /**
   * Send login verification code to user's phone
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async sendLoginCode(req, res) {
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

      let user = await Users.findOne({
        phoneNumber: phoneNumberWithCountryCode,
      }).select("-password -refreshTokens");

      if (!user) {
        return handleResponse(res, 400, "error", "User not found", null, 0);
      }

      if (user.blocked) {
        return handleResponse(res, 400, "error", "User is blocked", null, 0);
      }

      const { code: confirmationCode, expires: confirmationCodeExpires } =
        this._generateConfirmationCode(phoneNumberWithCountryCode);

      user.confirmationCode = confirmationCode;
      user.confirmationCodeExpires = confirmationCodeExpires;

      // Track login code attempts for security auditing
      user.loginCodeAttempts = user.loginCodeAttempts || [];
      user.loginCodeAttempts.push({
        code: confirmationCode,
        date: new Date(),
      });

      // Keep only the last 10 attempts to avoid document growth
      if (user.loginCodeAttempts.length > 10) {
        user.loginCodeAttempts = user.loginCodeAttempts.slice(-10);
      }

      // FIXED: Handle mobileToken properly - ensure it's always a string
      if (Array.isArray(user.mobileToken)) {
        // If it's an array, just use an empty string to avoid schema validation issues
        user.mobileToken = "";
      } else if (user.mobileToken === null || user.mobileToken === undefined) {
        // Ensure null/undefined values are converted to empty string
        user.mobileToken = "";
      }
      // If it's already a string, no action needed

      await user.save();

      // For test numbers, don't send SMS
      if (this._isTestPhoneNumber(phoneNumberWithCountryCode)) {
        return handleResponse(
          res,
          200,
          "success",
          "Confirmation code sent",
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
          "Confirmation code sent",
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
   * Confirm login with verification code
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async confirmLogin(req, res) {
    try {
      const { phoneNumber, confirmationCode, mobileToken } = req.body;

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
      console.log("Confirmation code:", confirmationCode);
      console.log("Phone number:", phoneNumber);
      console.log("Mobile token:", mobileToken);

      const phoneNumberWithCountryCode = this._formatPhoneNumber(phoneNumber);

      const user = await Users.findOne({
        phoneNumber: phoneNumberWithCountryCode,
        confirmationCode,
      }).select("-password");

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

      // Set user as confirmed and clear codes
      user.phoneConfirmed = true;
      user.confirmationCode = null;
      user.confirmationCodeExpires = null;

      // FIXED: Add mobile token if provided - always store as string
      if (mobileToken) {
        // Always ensure mobileToken is a string
        if (Array.isArray(mobileToken)) {
          // If an array is provided, store as empty string to avoid validation issues
          user.mobileToken = "";
        } else if (typeof mobileToken === "string") {
          // If it's already a string, use it directly
          user.mobileToken = mobileToken;
        } else {
          // For any other type, use empty string
          user.mobileToken = "";
        }
      }

      // Record login activity
      user.lastSeen = new Date();
      user.lastActivity = new Date();

      // Generate tokens for the user
      const tokenUser = createTokenUser(user);
      const { accessToken, refreshToken } = generateTokens(tokenUser);

      // Update refresh token - as string per schema
      user.refreshTokens = refreshToken;

      await user.save();

      return handleResponse(res, 200, "success", "Login successful", {
        accessToken,
        refreshToken,
        role: user.role,
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

  /**
   * Sign out (logout) user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async signOut(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized!", null, 0);
      }

      const user = await Users.findById(req.user.id).select("-password");
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Clear refresh tokens - as string per schema
      user.refreshTokens = "";

      // FIXED: Clear mobile token - ensure it's a string
      user.mobileToken = "";

      await user.save();

      return handleResponse(res, 200, "success", "User logged out!", null, 0);
    } catch (error) {
      console.error("Logout error:", error);
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
   * Renew access token using refresh token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async renewAccessToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        console.warn("No refresh token provided");
        return handleResponse(
          res,
          400,
          "error",
          "Refresh token is required",
          null,
          0
        );
      }

      // Promisify jwt.verify
      const verifyToken = (token, secret) => {
        return new Promise((resolve, reject) => {
          jwt.verify(token, secret, (err, decoded) => {
            if (err) {
              reject(err);
            } else {
              resolve(decoded);
            }
          });
        });
      };

      try {
        // Verify the token
        const decoded = await verifyToken(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );

        // Find the user with the matching refresh token (exact match since it's a string)
        const user = await Users.findOne({
          refreshTokens: refreshToken,
        }).select("-password");

        if (!user) {
          console.warn("User not found for provided refresh token");
          return handleResponse(
            res,
            404,
            "error",
            "User not found for provided refresh token",
            null,
            0
          );
        }

        // Generate new tokens
        const tokenUser = createTokenUser(user);
        const { accessToken, refreshToken: newRefreshToken } =
          generateTokens(tokenUser);

        // Update refresh token - as string per schema
        user.refreshTokens = newRefreshToken;

        // Update last activity
        user.lastActivity = new Date();

        await user.save();

        return handleResponse(
          res,
          200,
          "success",
          "Access token renewed successfully",
          { accessToken, refreshToken: newRefreshToken }
        );
      } catch (tokenError) {
        console.error("JWT verification error:", tokenError);
        return handleResponse(
          res,
          401,
          "error",
          "Invalid refresh token",
          null,
          0
        );
      }
    } catch (error) {
      console.error("Unexpected error:", error);
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
   * Get list of active refresh tokens
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRefreshTokens(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized!", null, 0);
      }

      const user = await Users.findById(req.user.id).select("-password");
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Since refreshTokens is a string in the schema, return as single token
      const refreshToken = user.refreshTokens || "";

      return handleResponse(
        res,
        200,
        "success",
        "Refresh token retrieved successfully",
        { refreshToken }
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
   * Delete a specific refresh token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteRefreshToken(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized!", null, 0);
      }

      const user = await Users.findById(req.user.id).select("-password");
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Clear refresh token (string in schema)
      user.refreshTokens = "";

      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Refresh token deleted successfully",
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
}

module.exports = new AuthLoginController();
