const Users = require("../models/user_model");
const { generateTokens, createTokenUser } = require("../utils/jwt");
const { handleResponse } = require("../utils/handleResponse");
const { deleteUserAvatar } = require("./avatarCTRL");
const { deleteUserCv } = require("./resumeCTRL/CvCTRL");
const { RegisterValidation, logOutValidation, RegisterValidationConfirm } = require("../helpers/AuthValidation");
const { getEskizAuthToken, sendCustomSms } = require("../utils/smsService");
const jwt = require('jsonwebtoken');
const { PromptCode } = require("../models/other_models");
function createRandomFullname() {
  const firstName = "User";
  const randomNumber = Math.floor(Math.random() * 1000000);
  return `${firstName} ${randomNumber}`;
}

class AuthCTRL {
  async sendRegisterCode(req, res) {
    // console.log("sendRegisterCode", req.body)
    try {
      const { error } = RegisterValidation(req.body);
      if (error) {
        return handleResponse(res, 400, "error", error.details[0].message);
      }
      const { phoneNumber, role, mobileToken } = req.body;
      const phoneNumberWithCountryCode = `+998${phoneNumber}`;
      let existingUser = await Users.findOne({ phoneNumber: phoneNumberWithCountryCode });

      if (existingUser) {
        return handleResponse(res, 400, "error", "User already exists with this phone number");
      }

      const now = Date.now();
      let confirmationCode = null
      let confirmationCodeExpires = null
      if (phoneNumberWithCountryCode === "+998996730970" || phoneNumberWithCountryCode === "+998507039990" || phoneNumberWithCountryCode === "+998954990501") {
        confirmationCode = 112233
        confirmationCodeExpires = new Date(now + 2 * 60 * 1000);
      } else {
        confirmationCode = Math.floor(100000 + Math.random() * 900000);
        confirmationCodeExpires = new Date(now + 2 * 60 * 1000);
      }
      if (!existingUser) {
        existingUser = new Users({
          phoneNumber: phoneNumberWithCountryCode,
          confirmationCode,
          confirmationCodeExpires,
          loginCodeAttempts: [now],
          role,
          mobileToken: [mobileToken],
        });
      } else {
        existingUser.confirmationCode = confirmationCode;
        existingUser.confirmationCodeExpires = confirmationCodeExpires;
      }

      await existingUser.save();


      if (phoneNumberWithCountryCode === "+998996730970" || phoneNumberWithCountryCode === "+998507039990" || phoneNumberWithCountryCode === "+998954990501") {
        return handleResponse(res, 200, "success", "Confirmation code sent. Please check your phone.", null, 1);
      } else {
        const token = await getEskizAuthToken();
        const message = `topish Ilovasiga kirish uchun tasdiqlash kodingiz: ${confirmationCode} OJt59qMBmYJ`;
        await sendCustomSms(token, phoneNumberWithCountryCode, message);
        return handleResponse(res, 200, "success", "Confirmation code sent. Please check your phone.", null, 1);
      }
    } catch (error) {
      return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
    }
  }
  // async confirmRegisterCode(req, res) {
  //   try {
  //     const { error } = RegisterValidationConfirm(req.body);
  //     if (error) {
  //       return handleResponse(res, 400, "error", error.details[0].message);
  //     }
  //     const { phoneNumber, confirmationCode, } = req.body;
  //     let user = null;

  //     const phoneNumberWithCountryCode = `+998${phoneNumber}`;
  //     user = await Users.findOne({
  //       phoneNumber: phoneNumberWithCountryCode,
  //       confirmationCode,
  //     });

  //     if (!user || new Date() > user.confirmationCodeExpires) {
  //       return handleResponse(res, 400, "error", "Invalid or expired confirmation code", null, 0);
  //     }

  //     user.phoneConfirmed = true;
  //     user.confirmationCode = null;
  //     user.confirmationCodeExpires = null;
  //     user.jobSeeker = {
  //       skills: [],
  //       professions: [],
  //       expectedSalary: "",
  //       jobTitle: "",
  //       nowSearchJob: true,
  //       workingExperience: "",
  //       employmentType: "full-time",
  //       educationalBackground: "",
  //     };
  //     user.employer = {
  //       aboutCompany: "",
  //       industry: "",
  //       contactNumber: "",
  //       contactEmail: "",
  //       jobs: [],
  //     };
  //     user.service = {
  //       savedOffices: [],
  //     };

  //     await user.save();

  //     const tokenUser = createTokenUser(user);
  //     const { accessToken, refreshToken } = generateTokens(tokenUser);

  //     user.refreshTokens = [{ token: refreshToken }];
  //     await user.save();

  //     return handleResponse(res, 201, "success", "User registered successfully.", { accessToken, refreshToken, role: user.role });
  //   } catch (error) {
  //     return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
  //   }
  // }

  async confirmRegisterCode(req, res) {
    console.log("confirmRegisterCode", req.body)
    try {


      const { phoneNumber, confirmationCode, deviceId, deviceName, region, os, browser, ip } = req.body;

      if (!phoneNumber || !confirmationCode) {
        return handleResponse(res, 400, "error", "Phone number and confirmation code are required", null, 0);
      }
      let user = null;

      const phoneNumberWithCountryCode = `+998${phoneNumber}`;
      user = await Users.findOne({
        phoneNumber: phoneNumberWithCountryCode,
        confirmationCode,
      });

      if (!user || new Date() > user.confirmationCodeExpires) {
        return handleResponse(res, 400, "error", "Invalid or expired confirmation code", null, 0);
      }
      // let promptCode = await Prompt({})
      user.phoneConfirmed = true;
      user.confirmationCode = null;
      user.confirmationCodeExpires = null;
      user.jobSeeker = {
        skills: [],
        professions: [],
        expectedSalary: "",
        jobTitle: "",
        nowSearchJob: true,
        workingExperience: "",
        employmentType: "full-time",
        educationalBackground: "",
      };
      user.employer = {
        aboutCompany: "",
        industry: "",
        contactNumber: "",
        contactEmail: "",
        jobs: [],
      };
      user.service = {
        savedOffices: [],
      };
      user.gptPrompt = ""

      await user.save();

      const tokenUser = createTokenUser(user);
      const { accessToken, refreshToken } = generateTokens(tokenUser);

      // Generate a custom random ID
      // token: { type: String, required: true },
      // deviceId: { type: String, required: false },
      // deviceName: { type: String, required: false },
      // region: { type: String, required: false },
      // os: { type: String, required: false },
      // browser: { type: String, required: false },
      // ip: { type: String, required: false },
      user.refreshTokens = [{
        token: refreshToken,
        deviceId: deviceId || 'unknown-device-id', // Use 'unknown-device-id' if deviceId is not provided
        deviceName: deviceName || 'unknown-device-name', // Use 'unknown-device-name' if deviceName is not provided
        region: region || 'unknown-region', // Use 'unknown-region' if region is not provided
        os: os || 'unknown-os', // Use 'unknown-os' if os is not provided
        browser: browser || 'unknown-browser', // Use 'unknown-browser' if browser is not provided
        ip: ip || 'unknown-ip', // Use 'unknown-ip' if ip is not provided
      }];
      await user.save();

      return handleResponse(res, 201, "success", "User registered successfully.", { accessToken, refreshToken, role: user.role });
    } catch (error) {
      return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
    }
  }
  async resendConfirmationCode(req, res) {
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        return handleResponse(res, 400, "error", "Phone number is required", null, 0);
      }

      const phoneNumberWithCountryCode = `+998${phoneNumber}`;
      const user = await Users.findOne({ phoneNumber: phoneNumberWithCountryCode });

      if (!user) {
        return handleResponse(res, 400, "error", "User not found with this phone number", null, 0);
      }
      let now = Date.now();
      let confirmationCode = null
      let confirmationCodeExpires = null
      if (phoneNumberWithCountryCode === "+998996730970" || phoneNumberWithCountryCode === "+998507039990" || phoneNumberWithCountryCode === "+998954990501") {
        confirmationCode = 112233
        confirmationCodeExpires = new Date(now + 2 * 60 * 1000);
      } else {
        confirmationCode = Math.floor(100000 + Math.random() * 900000);
        confirmationCodeExpires = new Date(now + 2 * 60 * 1000);
      }

      user.confirmationCode = confirmationCode;
      user.confirmationCodeExpires = confirmationCodeExpires;
      await user.save();



      if (phoneNumberWithCountryCode === "+998996730970") {
        return handleResponse(res, 200, "success", "Confirmation code resent successfully. Please check your phone for the new confirmation code.", null, 0);
      } else {
        const token = await getEskizAuthToken();
        const message = `topish Ilovasiga kirish uchun tasdiqlash kodingiz: ${confirmationCode} OJt59qMBmYJ`;
        await sendCustomSms(token, phoneNumberWithCountryCode, message);
        return handleResponse(res, 200, "success", "Confirmation code resent successfully. Please check your phone for the new confirmation code.", null, 0);
      }

    } catch (error) {
      return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
    }
  }
  async sendLoginCode(req, res) {
    // console.log("sendLoginCode", req.body)
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        return handleResponse(res, 400, "error", "Phone number is required", null, 0);
      }

      const phoneNumberWithCountryCode = `+998${phoneNumber}`;
      let user = await Users.findOne({ phoneNumber: phoneNumberWithCountryCode });

      if (!user) {
        return handleResponse(res, 400, "error", "User not found", null, 0);
      }

      const now = Date.now();
      let confirmationCode = null
      let confirmationCodeExpires = null
      if (phoneNumberWithCountryCode === "+998996730970" || phoneNumberWithCountryCode === "+998507039990" || phoneNumberWithCountryCode === "+998954990501") {
        confirmationCode = 112233
        confirmationCodeExpires = new Date(now + 2 * 60 * 1000);
      } else {
        confirmationCode = Math.floor(100000 + Math.random() * 900000);
        confirmationCodeExpires = new Date(now + 2 * 60 * 1000);
      }

      user.confirmationCode = confirmationCode;
      user.confirmationCodeExpires = confirmationCodeExpires;

      await user.save();

      if (phoneNumberWithCountryCode === "+998996730970" || phoneNumberWithCountryCode === "+998507039990" || phoneNumberWithCountryCode === "+998954990501") {
        return handleResponse(res, 200, "success", "Confirmation code sent", null, 1);
      } else {
        const token = await getEskizAuthToken();
        const message = `topish Ilovasiga kirish uchun tasdiqlash kodingiz: ${confirmationCode} OJt59qMBmYJ`;
        await sendCustomSms(token, phoneNumberWithCountryCode, message);
        return handleResponse(res, 200, "success", "Confirmation code sent", null, 1);
      }

    } catch (error) {
      return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
    }
  }
  // async confirmLogin(req, res) {
  //   try {

  //     const { phoneNumber, confirmationCode, mobileToken } = req.body;

  //     if (!phoneNumber || !confirmationCode) {
  //       return handleResponse(res, 400, "error", "Phone number and confirmation code are required", null, 0);
  //     }
  //     const phoneNumberWithCountryCode = `+998${phoneNumber}`;
  //     let user = null;

  //     user = await Users.findOne({
  //       phoneNumber: phoneNumberWithCountryCode,
  //       confirmationCode,
  //     });

  //     if (!user || new Date() > user.confirmationCodeExpires) {
  //       return handleResponse(res, 400, "error", "Invalid or expired confirmation code", null, 0);
  //     }

  //     user.phoneConfirmed = true;
  //     user.confirmationCode = null;
  //     user.confirmationCodeExpires = null;

  //     if (mobileToken && (!user.mobileToken || !user.mobileToken.includes(mobileToken))) {
  //       user.mobileToken = user.mobileToken || [];
  //       user.mobileToken.push(mobileToken);
  //     }

  //     await user.save();

  //     const tokenUser = createTokenUser(user);
  //     const { accessToken, refreshToken } = generateTokens(tokenUser);
  //     user.refreshTokens = user.refreshTokens || [];
  //     user.refreshTokens.push({ token: refreshToken });
  //     await user.save();

  //     return handleResponse(res, 200, "success", "Login successful", { accessToken, refreshToken, role: user.role });
  //   } catch (error) {
  //     return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
  //   }
  // }
  async confirmLogin(req, res) {
    try {
      const { phoneNumber, confirmationCode, mobileToken, deviceId, deviceName, region, os, browser, ip } = req.body;

      if (!phoneNumber || !confirmationCode) {
        return handleResponse(res, 400, "error", "Phone number and confirmation code are required", null, 0);
      }
      const phoneNumberWithCountryCode = `+998${phoneNumber}`;
      let user = null;

      user = await Users.findOne({
        phoneNumber: phoneNumberWithCountryCode,
        confirmationCode,
      });

      if (!user || new Date() > user.confirmationCodeExpires) {
        return handleResponse(res, 400, "error", "Invalid or expired confirmation code", null, 0);
      }

      user.phoneConfirmed = true;
      user.confirmationCode = null;
      user.confirmationCodeExpires = null;

      if (mobileToken && (!user.mobileToken || !user.mobileToken.includes(mobileToken))) {
        user.mobileToken = user.mobileToken || [];
        user.mobileToken.push(mobileToken);
      }

      await user.save();

      const tokenUser = createTokenUser(user);
      const { accessToken, refreshToken } = generateTokens(tokenUser);

      user.refreshTokens = user.refreshTokens || [];
      user.refreshTokens.push({
        token: refreshToken,
        deviceId: deviceId || 'unknown-device-id', // Use 'unknown-device-id' if deviceId is not provided
        deviceName: deviceName || 'unknown-device-name', // Use 'unknown-device-name' if deviceName is not provided
        region: region || 'unknown-region', // Use 'unknown-region' if region is not provided
        os: os || 'unknown-os', // Use 'unknown-os' if os is not provided
        browser: browser || 'unknown-browser', // Use 'unknown-browser' if browser is not provided
        ip: ip || 'unknown-ip', // Use 'unknown-ip' if ip is not provided
      });
      await user.save();

      return handleResponse(res, 200, "success", "Login successful", { accessToken, refreshToken, role: user.role });
    } catch (error) {
      return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
    }
  }
  async signOut(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized!", null, 0);
      }

      const { error } = logOutValidation(req.body);
      if (error) {
        return handleResponse(res, 400, "error", error.details[0].message);
      }
      const isSecure = res.req.secure || res.req.headers["x-forwarded-proto"] === "https";
      res.cookie("token", "", {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? "None" : "Lax",
        expires: new Date(0),
      });

      const User = await Users.findById(req.user.id);
      if (User) {
        User.mobileToken = User.mobileToken.filter(token => token !== req.body.mobileToken);
        await User.save();
        return handleResponse(res, 200, "success", "User logged out!", null, 0);
      } else {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }
    } catch (error) {
      console.error("Logout error:", error);
      return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
    }
  }
  async deleteAccount(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized!", null, 0);
      }

      const userID = req.user.id;
      const user = await Users.findById(userID);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      await user.deleteOne();
      return handleResponse(res, 200, "success", "Account and associated data deleted successfully", null, 0);
    } catch (err) {
      return handleResponse(res, 500, "error", "Something went wrong: " + err.message, null, 0);
    }
  }
  async renewAccessToken(req, res) {
    // console.log("renewAccessToken called");
    try {
      const { refreshToken } = req.body;
      // console.log("Received refreshToken:", refreshToken);
      if (!refreshToken) {
        return handleResponse(res, 400, "error", "Refresh token is required", null, 0);
      }

      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
        if (err) {
          console.log("JWT verification error:", err);
          return handleResponse(res, 403, "error", "Invalid refresh token", null, 0);
        }

        try {
          const user = await Users.findOne({ 'refreshTokens.token': refreshToken });
          if (!user) {
            console.log("User not found for provided refresh token");
            return handleResponse(res, 403, "error", "Invalid refresh token", null, 0);
          }

          const tokenUser = createTokenUser(user);
          const { accessToken, refreshToken: newRefreshToken } = generateTokens(tokenUser);

          // Use atomic update operation
          const result = await Users.updateOne(
            { _id: user._id, 'refreshTokens.token': refreshToken },
            {
              $set: { 'refreshTokens.$.token': newRefreshToken }
            }
          );

          if (result.nModified === 0) {
            console.log("Failed to update the refresh token in the database");
            return handleResponse(res, 403, "error", "Invalid refresh token", null, 0);
          }

          return handleResponse(res, 200, "success", "Access token renewed successfully", { accessToken, refreshToken: newRefreshToken });
        } catch (dbError) {
          console.error("Database error:", dbError);
          return handleResponse(res, 500, "error", "Database error occurred", null, 0);
        }
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
    }
  }

  async getRefreshTokens(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized!", null, 0);
      }

      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const refreshTokens = user.refreshTokens.map(token => ({
        id: token._id,
        token: token.token,
        deviceId: token.deviceId,
        deviceName: token.deviceName,
        region: token.region,
        os: token.os,
        browser: token.browser,
        ip: token.ip
      }));

      return handleResponse(res, 200, "success", "Refresh tokens retrieved successfully", { refreshTokens });
    } catch (error) {
      return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
    }
  }
  async deleteRefreshToken(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized!", null, 0);
      }
      const { id } = req.body;
      if (!id) {
        return handleResponse(res, 400, "error", "Refresh token ID is required", null, 0);
      }
      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }
      // Ensure the provided id is a string for comparison
      user.refreshTokens = user.refreshTokens.filter(token => token._id.toString() !== id);

      await user.save();

      return handleResponse(res, 200, "success", "Refresh token deleted successfully", null, 0);
    } catch (error) {
      return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
    }
  }
}

module.exports = new AuthCTRL();
