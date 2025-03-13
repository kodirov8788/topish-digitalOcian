const axios = require("axios");

/**
 * EngageLab SMS Service for sending OTP messages
 * This utility provides functions to send SMS messages via the EngageLab API
 */

// API endpoint for sending OTP messages
const OTP_API_URL = "https://otp.api.engagelab.cc/v1/messages";

// Configure these values from environment variables or config
const ENGAGELAB_USERNAME = process.env.ENGAGELAB_USERNAME;
const ENGAGELAB_PASSWORD = process.env.ENGAGELAB_PASSWORD;
const ENGAGELAB_TEMPLATE_ID = process.env.ENGAGELAB_TEMPLATE_ID; // Default template ID

/**
 * Send OTP message via EngageLab API
 *
 * @param {string} phoneNumber - Recipient phone number in E.164 format (e.g., +8613711112222)
 * @param {string} otpCode - The OTP code to send
 * @param {string} [templateId='checking'] - Template ID to use
 * @returns {Promise<Object>} - Response from the EngageLab API
 */
const sendOtpMessage = async (
  phoneNumber,
  otpCode,
  templateId = ENGAGELAB_TEMPLATE_ID
) => {
  try {
    // Validate phone number format
    if (!phoneNumber.startsWith("+")) {
      throw new Error(
        "Phone number must be in E.164 format (include + prefix)"
      );
    }

    // Construct authorization header
    const authHeader =
      "Basic " +
      Buffer.from(`${ENGAGELAB_USERNAME}:${ENGAGELAB_PASSWORD}`).toString(
        "base64"
      );

    // Prepare request payload according to the correct API format
    const data = {
      to: phoneNumber,
      template: {
        id: templateId,
        language: "default",
        params: {
          code: otpCode.toString(),
        },
      },
    };

    // Make API request
    const response = await axios.post(OTP_API_URL, data, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });
    console.log("EngageLab API Response:", response.data);

    // Return response data
    return response.data;
  } catch (error) {
    // Enhanced error handling
    if (error.response) {
      console.error(
        "EngageLab API Error:",
        error.response.status,
        error.response.data
      );
      throw new Error(
        `EngageLab API Error: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )}`
      );
    } else if (error.request) {
      console.error("EngageLab API No Response:", error.request);
      throw new Error("No response received from EngageLab API");
    } else {
      console.error("EngageLab API Request Error:", error.message);
      throw error;
    }
  }
};

/**
 * Send custom message via EngageLab API with a different template
 *
 * @param {string} phoneNumber - Recipient phone number in E.164 format
 * @param {string} templateId - Custom template ID to use
 * @param {Object} params - Template parameters
 * @param {string} [language='default'] - Template language
 * @returns {Promise<Object>} - Response from the EngageLab API
 */
const sendCustomMessage = async (
  phoneNumber,
  templateId,
  params,
  language = "default"
) => {
  try {
    // Validate phone number format
    if (!phoneNumber.startsWith("+")) {
      throw new Error(
        "Phone number must be in E.164 format (include + prefix)"
      );
    }

    // Construct authorization header
    const authHeader =
      "Basic " +
      Buffer.from(`${ENGAGELAB_USERNAME}:${ENGAGELAB_PASSWORD}`).toString(
        "base64"
      );

    // Prepare request payload according to the correct API format
    const data = {
      to: phoneNumber,
      template: {
        id: templateId,
        language: language,
        params: params,
      },
    };

    // Make API request
    const response = await axios.post(OTP_API_URL, data, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    console.log("EngageLab API Response:", response.data);
    return response.data;
  } catch (error) {
    // Enhanced error handling
    if (error.response) {
      console.error(
        "EngageLab API Error:",
        error.response.status,
        error.response.data
      );
      throw new Error(
        `EngageLab API Error: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )}`
      );
    } else if (error.request) {
      console.error("EngageLab API No Response:", error.request);
      throw new Error("No response received from EngageLab API");
    } else {
      console.error("EngageLab API Request Error:", error.message);
      throw error;
    }
  }
};

module.exports = {
  sendOtpMessage,
  sendCustomMessage,
};
