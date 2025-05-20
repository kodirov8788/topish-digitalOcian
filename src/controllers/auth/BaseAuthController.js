/**
 * Base Authentication Controller
 * Contains shared methods and utilities used across authentication controllers
 */

const Users = require("../../models/user_model");
const { handleResponse } = require("../../utils/handleResponse");

class BaseAuthController {
  /**
   * Formats a phone number to ensure it has proper country code
   * @param {string} phoneNumber - The phone number to format
   * @returns {string} Formatted phone number with country code
   */
  _formatPhoneNumber(phoneNumber) {
    if (!phoneNumber || typeof phoneNumber !== "string") {
      return "";
    }

    // Remove any non-digit characters except + sign
    const cleaned = phoneNumber.replace(/[^\d+]/g, "");

    if (!cleaned.includes("+")) {
      return `+998${cleaned}`;
    }
    return cleaned;
  }

  /**
   * Generates a confirmation code based on environment and user's phone number
   * @param {string} phoneNumber - The user's phone number
   * @returns {Object} Object containing code and expiration time
   */
  _generateConfirmationCode(phoneNumber) {
    const now = Date.now();
    const testNumbers = [
      "+998996730970",
      "+998507039990",
      "+998954990501",
      "+998951112233",
    ];

    // Use test code for test numbers or in development
    if (
      testNumbers.includes(phoneNumber) ||
      process.env.NODE_ENV !== "production"
    ) {
      return {
        code: 112233,
        expires: new Date(now + 2 * 60 * 1000), // 2 minutes
      };
    }

    // Generate random code for real users
    return {
      code: Math.floor(100000 + Math.random() * 900000),
      expires: new Date(now + 5 * 60 * 1000), // 5 minutes for production
    };
  }

  /**
   * Creates a random fullname for a new user
   * @returns {string} Random fullname
   */
  _createRandomFullname() {
    const firstName = "User";
    const randomNumber = Math.floor(Math.random() * 1000000);
    return `${firstName}-${randomNumber}`;
  }

  /**
   * Creates a default resume structure for a new user
   * @returns {Object} Default resume object
   */
  _createDefaultResume() {
    return {
      summary: null,
      industry: [], // Simple array of strings to avoid schema validation issues
      contact: {
        email: null,
        phone: null,
        location: null,
      },
      employmentType: [],
      workExperience: [],
      education: [],
      projects: [],
      certificates: [],
      awards: [],
      languages: [],
      cv: {
        path: null,
        filename: null,
        size: null,
        key: null,
      },
      skills: [],
      expectedSalary: "",
      profileVisibility: false,
    };
  }

  /**
   * Checks if the user has admin authorization
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {boolean|Object} False if not authorized, user object if authorized
   */
  async _checkAdminAuth(req, res) {
    if (!req.user) {
      handleResponse(res, 401, "error", "Unauthorized", null, 0);
      return false;
    }

    const user = await Users.findById(req.user.id).select(
      "-password -refreshTokens"
    );

    if (!user) {
      handleResponse(res, 404, "error", "User not found", null, 0);
      return false;
    }

    if (!user.roles || !user.roles.includes("Admin")) {
      handleResponse(
        res,
        403,
        "error",
        "Forbidden: Only admins can perform this action",
        null,
        0
      );
      return false;
    }

    return user;
  }

  /**
   * Checks if test phone number (for bypassing SMS)
   * @param {string} phoneNumber - Phone number to check
   * @returns {boolean} True if test number
   */
  _isTestPhoneNumber(phoneNumber) {
    const testNumbers = [
      "+998996730970",
      "+998507039990",
      "+998954990501",
      "+998951112233",
    ];
    console.log("Test phone number check:", phoneNumber);
    console.log(
      'testNumbers.includes(phoneNumber) || process.env.NODE_ENV !== "production" :',
      testNumbers.includes(phoneNumber) || process.env.NODE_ENV !== "production"
    );
    return (
      testNumbers.includes(phoneNumber) || process.env.NODE_ENV !== "production"
    );
  }

  /**
   * Validates a user's session token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {boolean|Object} False if invalid, user object if valid
   */
  async _validateSession(req, res) {
    if (!req.user) {
      handleResponse(res, 401, "error", "Unauthorized", null, 0);
      return false;
    }

    const user = await Users.findById(req.user.id).select("-password");

    if (!user) {
      handleResponse(res, 404, "error", "User not found", null, 0);
      return false;
    }

    // Update last activity timestamp
    user.lastActivity = new Date();
    await user.save();

    return user;
  }

  /**
   * Determines which SMS service to use based on phone number
   * @param {string} phoneNumber - The formatted phone number
   * @returns {string} SMS service to use ('eskiz', 'engagelab', or 'unsupported')
   */
  _determineSmsService(phoneNumber) {
    if (phoneNumber.startsWith("+998")) {
      return "eskiz";
    } else if (phoneNumber.startsWith("+1") || phoneNumber.startsWith("+86")) {
      return "engagelab";
    } else {
      return "unsupported";
    }
  }

  /**
   * Safely updates user fields without risking undefined values
   * @param {Object} user - User document to update
   * @param {Object} updates - Object with fields to update
   * @returns {Object} Updated user object
   */
  _safeUpdateUser(user, updates) {
    if (!user || !updates) return user;

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        user[key] = updates[key];
      }
    });

    return user;
  }
}

module.exports = BaseAuthController;
