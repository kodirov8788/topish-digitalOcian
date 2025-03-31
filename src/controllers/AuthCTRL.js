// src/controllers/AuthCTRL.js
const Users = require("../models/user_model");
const { generateTokens, createTokenUser } = require("../utils/jwt");
const { handleResponse } = require("../utils/handleResponse");
const { deleteUserAvatar } = require("./avatarCTRL");
const { deleteUserCv } = require("./resumeCTRL/CvCTRL");
const {
  RegisterValidation,
  logOutValidation,
} = require("../helpers/AuthValidation");
const {
  getEskizAuthToken,
  sendCustomSms,
  sendGlobalSms,
  checkSmsStatus,
  makeVoiceCall,
} = require("../utils/smsService");
const jwt = require("jsonwebtoken");
const { sendOtpMessage } = require("../utils/engagelab_smsService");
const { PromptCode } = require("../models/other_models");
const PendingUsers = require("../models/pending_register_model");
function createRandomFullname() {
  const firstName = "User";
  const randomNumber = Math.floor(Math.random() * 1000000);
  return `${firstName}-${randomNumber}`;
}
function createDefaultResume() {
  return {
    summary: null,
    industry: [],
    contact: {
      email: null,
      phone: null,
      location: null,
    },
    employmentType: "",
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
  };
}
class AuthCTRL {
  async registerUserByAdmin(req, res) {
    try {
      // console.log("req.user: ", req.user);
      if (!req.user || req.user.role !== "Admin") {
        return handleResponse(
          res,
          403,
          "error",
          "Forbidden: Only admins can perform this action",
          null,
          0
        );
      }

      const { phoneNumber, role } = req.body;

      if (!phoneNumber || !role) {
        return handleResponse(
          res,
          400,
          "error",
          "Phone number and role are required",
          null,
          0
        );
      }

      let phoneNumberWithCountryCode = null;

      if (!phoneNumber.includes("+")) {
        phoneNumberWithCountryCode = `${"+998" + phoneNumber}`;
      } else {
        phoneNumberWithCountryCode = phoneNumber;
      }

      let existingUser = await Users.findOne({
        phoneNumber: phoneNumberWithCountryCode,
      });

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
        role,
        phoneConfirmed: true,
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
  async sendRegisterCode(req, res) {
    try {
      const { error } = RegisterValidation(req.body);
      if (error) {
        return handleResponse(res, 400, "error", error.details[0].message);
      }
      const { phoneNumber, mobileToken } = req.body;

      let phoneNumberWithCountryCode = null;

      if (!phoneNumber.includes("+")) {
        phoneNumberWithCountryCode = `${"+998" + phoneNumber}`;
      } else {
        phoneNumberWithCountryCode = phoneNumber;
      }

      // Check if there's an existing user with this phone number
      const existingUser = await Users.findOne({
        phoneNumber: phoneNumberWithCountryCode,
      });

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

      const now = Date.now();
      let confirmationCode = null;
      let confirmationCodeExpires = null;

      if (process.env.NODE_ENV === "production") {
        if (
          phoneNumberWithCountryCode === "+998996730970" ||
          phoneNumberWithCountryCode === "+998507039990" ||
          phoneNumberWithCountryCode === "+998954990501" ||
          phoneNumberWithCountryCode === "+998951112233"
        ) {
          confirmationCode = 112233;
          confirmationCodeExpires = new Date(now + 2 * 60 * 1000);
        } else {
          confirmationCode = Math.floor(100000 + Math.random() * 900000);
          confirmationCodeExpires = new Date(now + 2 * 60 * 1000);
        }
      } else {
        confirmationCode = 112233;
        confirmationCodeExpires = new Date(now + 2 * 60 * 1000);
      }

      if (
        phoneNumberWithCountryCode === "+998996730970" ||
        phoneNumberWithCountryCode === "+998507039990" ||
        phoneNumberWithCountryCode === "+998954990501" ||
        phoneNumberWithCountryCode === "+998951112233"
      ) {
        // Store in pending users collection
        await PendingUsers.findOneAndUpdate(
          { phoneNumber: phoneNumberWithCountryCode },
          {
            phoneNumber: phoneNumberWithCountryCode,
            confirmationCode,
            confirmationCodeExpires,
            mobileToken: [mobileToken],
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

            // Store in pending users collection after successful SMS
            await PendingUsers.findOneAndUpdate(
              { phoneNumber: phoneNumberWithCountryCode },
              {
                phoneNumber: phoneNumberWithCountryCode,
                confirmationCode,
                confirmationCodeExpires,
                mobileToken: [mobileToken],
              },
              { upsert: true, new: true }
            );
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
        } else {
          // In development, store without sending SMS
          await PendingUsers.findOneAndUpdate(
            { phoneNumber: phoneNumberWithCountryCode },
            {
              phoneNumber: phoneNumberWithCountryCode,
              confirmationCode,
              confirmationCodeExpires,
              mobileToken: [mobileToken],
            },
            { upsert: true, new: true }
          );
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

      const user = await Users.findOne({ phoneNumber });

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

      const now = Date.now();
      let confirmationCode = user.confirmationCode;
      let confirmationCodeExpires;

      confirmationCodeExpires = new Date(now + 2 * 60 * 1000);

      user.confirmationCodeExpires = confirmationCodeExpires;
      await user.save();

      let newConfirmationCode = String(confirmationCode).split("").join(" ");
      await makeVoiceCall(phoneNumber, `code is ${newConfirmationCode}`);

      return handleResponse(
        res,
        200,
        "success",
        "Confirmation code sent. Please check your phone.",
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
  async confirmRegisterCode(req, res) {
    try {
      const {
        phoneNumber,
        confirmationCode,
        deviceId,
        deviceName,
        region,
        os,
        browser,
        ip,
      } = req.body;

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

      let phoneNumberWithCountryCode = null;

      if (!phoneNumber.includes("+")) {
        phoneNumberWithCountryCode = `${"+998" + phoneNumber}`;
      } else {
        phoneNumberWithCountryCode = phoneNumber;
      }

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
      });

      let prompt = await PromptCode.find();

      // Create a new user or update the existing one
      if (!existingUser) {
        // Create a completely new user
        existingUser = new Users({
          phoneNumber: phoneNumberWithCountryCode,
          phoneConfirmed: true,
          savedJobs: [],
          searchJob: true,
          employer: {
            aboutCompany: "",
            industry: "",
            contactNumber: "",
            contactEmail: "",
            jobs: [],
            profileVisibility: true,
          },
          service: {
            savedOffices: [],
          },
          resume: createDefaultResume(),
          fullName: createRandomFullname(),
          gptPrompt: prompt[0]?.code || "",
          jobTitle: "",
          profileVisibility: false,
          mobileToken: pendingUser.mobileToken,
          role: "JobSeeker",
        });
      } else {
        // Update existing user
        existingUser.phoneConfirmed = true;
        existingUser.confirmationCode = null;
        existingUser.confirmationCodeExpires = null;

        // Add mobile token if it doesn't exist
        if (pendingUser.mobileToken && pendingUser.mobileToken.length > 0) {
          existingUser.mobileToken = existingUser.mobileToken || [];
          for (const token of pendingUser.mobileToken) {
            if (!existingUser.mobileToken.includes(token)) {
              existingUser.mobileToken.push(token);
            }
          }
        }
      }

      await existingUser.save();

      // Generate tokens for the user
      const tokenUser = createTokenUser(existingUser);
      const { accessToken, refreshToken } = generateTokens(tokenUser);

      existingUser.refreshTokens = [
        {
          token: refreshToken,
          deviceId: deviceId || "unknown-device-id",
          deviceName: deviceName || "unknown-device-name",
          region: region || "unknown-region",
          os: os || "unknown-os",
          browser: browser || "unknown-browser",
          ip: ip || "unknown-ip",
        },
      ];

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
        { accessToken, refreshToken, role: existingUser.role }
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

      let phoneNumberWithCountryCode = null;

      if (!phoneNumber.includes("+")) {
        phoneNumberWithCountryCode = `${"+998" + phoneNumber}`;
      } else {
        phoneNumberWithCountryCode = phoneNumber;
      }

      const user = await Users.findOne({
        phoneNumber: phoneNumberWithCountryCode,
      });

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

      let now = Date.now();
      let confirmationCode = null;
      let confirmationCodeExpires = null;

      if (
        phoneNumberWithCountryCode === "+998996730970" ||
        phoneNumberWithCountryCode === "+998507039990" ||
        phoneNumberWithCountryCode === "+998954990501" ||
        phoneNumberWithCountryCode === "+998951112233"
      ) {
        confirmationCode = 112233;
        confirmationCodeExpires = new Date(now + 2 * 60 * 1000);
      } else {
        confirmationCode = Math.floor(100000 + Math.random() * 900000);
        confirmationCodeExpires = new Date(now + 2 * 60 * 1000);
      }

      user.confirmationCode = confirmationCode;
      user.confirmationCodeExpires = confirmationCodeExpires;
      await user.save();

      if (
        phoneNumberWithCountryCode === "+998996730970" ||
        phoneNumberWithCountryCode === "+998507039990" ||
        phoneNumberWithCountryCode === "+998954990501" ||
        phoneNumberWithCountryCode === "+998951112233"
      ) {
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

      let phoneNumberWithCountryCode = null;

      if (!phoneNumber.includes("+")) {
        phoneNumberWithCountryCode = `${"+998" + phoneNumber}`;
      } else {
        phoneNumberWithCountryCode = phoneNumber;
      }

      let user = await Users.findOne({
        phoneNumber: phoneNumberWithCountryCode,
      });

      if (!user) {
        return handleResponse(res, 400, "error", "User not found", null, 0);
      }

      if (user.blocked) {
        return handleResponse(res, 400, "error", "User is blocked", null, 0);
      }

      const now = Date.now();
      let confirmationCode = null;
      let confirmationCodeExpires = null;

      if (process.env.NODE_ENV === "production") {
        if (
          phoneNumberWithCountryCode === "+998996730970" ||
          phoneNumberWithCountryCode === "+998507039990" ||
          phoneNumberWithCountryCode === "+998954990501" ||
          phoneNumberWithCountryCode === "+998951112233"
        ) {
          confirmationCode = 112233;
          confirmationCodeExpires = new Date(now + 2 * 60 * 1000);
        } else {
          confirmationCode = Math.floor(100000 + Math.random() * 900000);
          confirmationCodeExpires = new Date(now + 2 * 60 * 1000);
        }
      } else {
        confirmationCode = 112233;
        confirmationCodeExpires = new Date(now + 2 * 60 * 1000);
      }

      user.confirmationCode = confirmationCode;
      user.confirmationCodeExpires = confirmationCodeExpires;
      await user.save();

      if (
        phoneNumberWithCountryCode === "+998996730970" ||
        phoneNumberWithCountryCode === "+998507039990" ||
        phoneNumberWithCountryCode === "+998954990501" ||
        phoneNumberWithCountryCode === "+998951112233"
      ) {
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
  async confirmLogin(req, res) {
    try {
      const {
        phoneNumber,
        confirmationCode,
        mobileToken,
        deviceId,
        deviceName,
        region,
        os,
        browser,
        ip,
      } = req.body;

      if (!phoneNumber || !confirmationCode) {
        // console.log("phoneNumber: ", phoneNumber);
        // console.log("confirmationCode: ", confirmationCode);
        return handleResponse(
          res,
          400,
          "error",
          "Phone number and confirmation code are required",
          null,
          0
        );
      }

      let phoneNumberWithCountryCode = null;
      // console.log("phoneNumber: ", phoneNumber)
      if (!phoneNumber.includes("+")) {
        phoneNumberWithCountryCode = `${"+998" + phoneNumber}`;
      } else {
        phoneNumberWithCountryCode = phoneNumber;
      }
      // console.log("phoneNumberWithCountryCode: ", phoneNumberWithCountryCode);

      const user = await Users.findOne({
        phoneNumber: phoneNumberWithCountryCode,
        confirmationCode,
      });
      // console.log("user: ", user)
      if (!user || new Date() > user.confirmationCodeExpires) {
        console.log("user: ", user);
        return handleResponse(
          res,
          400,
          "error",
          "Invalid or expired confirmation code",
          null,
          0
        );
      }

      user.phoneConfirmed = true;
      user.confirmationCode = null;
      user.confirmationCodeExpires = null;

      if (
        mobileToken &&
        (!user.mobileToken || !user.mobileToken.includes(mobileToken))
      ) {
        user.mobileToken = user.mobileToken || [];
        user.mobileToken.push(mobileToken);
      }

      const tokenUser = createTokenUser(user);
      const { accessToken, refreshToken } = generateTokens(tokenUser);

      user.refreshTokens = user.refreshTokens || [];

      let tokenUpdated = false;
      for (let tokenObj of user.refreshTokens) {
        if (
          tokenObj.mobileToken === mobileToken &&
          tokenObj.browser === browser
        ) {
          tokenObj.token = refreshToken;
          tokenUpdated = true;
          break;
        }
      }
      // console.log("tokenUpdated: ", tokenUpdated)
      if (!tokenUpdated) {
        user.refreshTokens.push({
          token: refreshToken,
          mobileToken: mobileToken,
          deviceId: deviceId || "unknown-device-id",
          deviceName: deviceName || "unknown-device-name",
          region: region || "unknown-region",
          os: os || "unknown-os",
          browser: browser || "unknown-browser",
          ip: ip || "unknown-ip",
        });
      }
      // console.log(" user.refreshTokens: ", user.refreshTokens)
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
  async signOut(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized!", null, 0);
      }
      // console.log("signOut: ", req.user)
      // console.log("req body: ", req.body)
      // const { error } = logOutValidation(req.body);
      // if (error) {
      //   return handleResponse(
      //     res,
      //     400,
      //     "error",
      //     error.details[0].message,
      //     null,
      //     0
      //   );
      // }

      // const user = await Users.findById(req.user.id);
      // if (!user) {
      //   return handleResponse(res, 404, "error", "User not found", null, 0);
      // }

      // user.mobileToken = user.mobileToken.filter(
      //   (token) => token !== req.body.mobileToken
      // );
      // user.refreshTokens = user.refreshTokens.filter(
      //   (tokenObj) => tokenObj.token !== req.body.refreshToken
      // );

      // await user.save();

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
  // async renewAccessToken(req, res) {
  //   console.log("renewAccessToken called");

  //   try {
  //     const { refreshToken } = req.body;
  //     // console.log("Received refreshToken: ", refreshToken);

  //     if (!refreshToken) {
  //       console.warn("No refresh token provided");
  //       return handleResponse(
  //         res,
  //         400,
  //         "error",
  //         "Refresh token is required",
  //         null,
  //         0
  //       );
  //     }

  //     jwt.verify(
  //       refreshToken,
  //       process.env.JWT_REFRESH_SECRET,
  //       async (err, decoded) => {
  //         if (err) {
  //           console.error("JWT verification error:", err);
  //           console.log("Auth error chiqdi....");
  //           return handleResponse(
  //             res,
  //             451,
  //             "error",
  //             "Invalid refresh token",
  //             null,
  //             0
  //           );
  //         }

  //         try {
  //           const user = await Users.findOne({
  //             "refreshTokens.token": refreshToken,
  //           });

  //           if (!user) {
  //             console.warn("User not found for provided refresh token");
  //             return handleResponse(
  //               res,
  //               471,
  //               "error",
  //               "User not found for provided refresh token",
  //               null,
  //               0
  //             );
  //           }

  //           const tokenUser = createTokenUser(user);
  //           const { accessToken, refreshToken: newRefreshToken } =
  //             generateTokens(tokenUser);
  //           let tokenUpdated = false;

  //           user.refreshTokens = user.refreshTokens.map((tokenObj) => {
  //             if (tokenObj.token === refreshToken) {
  //               tokenObj.token = newRefreshToken;
  //               tokenUpdated = true;
  //             }
  //             return tokenObj;
  //           });
  //           if (!tokenUpdated) {
  //             console.error("Failed to find the refresh token in the database");
  //             return handleResponse(
  //               res,
  //               472,
  //               "error",
  //               "Failed to find the refresh token in the database",
  //               null,
  //               0
  //             );
  //           }

  //           await user.save();
  //           console.info(
  //             "Access token renewed successfully for user:",
  //             user.phoneNumber
  //           );
  //           return handleResponse(
  //             res,
  //             208,
  //             "success",
  //             "Access token renewed successfully",
  //             { accessToken, refreshToken: newRefreshToken }
  //           );
  //         } catch (dbError) {
  //           console.error("Database error:", dbError);
  //           return handleResponse(
  //             res,
  //             473,
  //             "error",
  //             "Database error occurred",
  //             null,
  //             0
  //           );
  //         }
  //       }
  //     );
  //   } catch (error) {
  //     console.error("Unexpected error:", error);
  //     return handleResponse(
  //       res,
  //       500,
  //       "error",
  //       "Something went wrong: " + error.message,
  //       null,
  //       0
  //     );
  //   }
  // }

  async renewAccessToken(req, res) {
    try {
      console.log("renewAccessToken called");
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

      // Using promisify to convert the callback-based jwt.verify to a promise
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

        // Find the user
        const user = await Users.findOne({
          "refreshTokens.token": refreshToken,
        });

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

        // Update the refresh token in the database
        let tokenUpdated = false;
        user.refreshTokens = user.refreshTokens.map((tokenObj) => {
          if (tokenObj.token === refreshToken) {
            tokenObj.token = newRefreshToken;
            tokenUpdated = true;
          }
          return tokenObj;
        });

        if (!tokenUpdated) {
          console.error("Failed to find the refresh token in the database");
          return handleResponse(
            res,
            400,
            "error",
            "Failed to find the refresh token in the database",
            null,
            0
          );
        }

        // Save the updated user
        await user.save();

        console.info(
          "Access token renewed successfully for user:",
          user.phoneNumber
        );

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
  async getRefreshTokens(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized!", null, 0);
      }

      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const refreshTokens = user.refreshTokens.map((token) => ({
        id: token._id,
        token: token.token,
        mobileToken: token.mobileToken,
        deviceId: token.deviceId,
        deviceName: token.deviceName,
        region: token.region,
        os: token.os,
        browser: token.browser,
        ip: token.ip,
      }));

      return handleResponse(
        res,
        200,
        "success",
        "Refresh tokens retrieved successfully",
        { refreshTokens }
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
  async deleteRefreshToken(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized!", null, 0);
      }
      const { id } = req.body;
      if (!id) {
        return handleResponse(
          res,
          400,
          "error",
          "Refresh token ID is required",
          null,
          0
        );
      }
      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }
      // Ensure the provided id is a string for comparison
      user.refreshTokens = user.refreshTokens.filter(
        (token) => token._id.toString() !== id
      );

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

      const phoneNumberWithCountryCode = phoneNumber;
      const user = await Users.findOne({
        phoneNumber: phoneNumberWithCountryCode,
      });

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

      const now = Date.now();
      let confirmationCode;
      let confirmationCodeExpires;

      if (
        phoneNumberWithCountryCode === "+998996730970" ||
        phoneNumberWithCountryCode === "+998507039990" ||
        phoneNumberWithCountryCode === "+998954990501"
      ) {
        confirmationCode = 112233;
        confirmationCodeExpires = new Date(now + 2 * 60 * 1000);
      } else {
        confirmationCode = Math.floor(100000 + Math.random() * 900000);
        confirmationCodeExpires = new Date(now + 2 * 60 * 1000);
      }

      user.confirmationCode = confirmationCode;
      user.confirmationCodeExpires = confirmationCodeExpires;
      await user.save();

      if (
        phoneNumberWithCountryCode !== "+998996730970" &&
        phoneNumberWithCountryCode !== "+998507039990" &&
        phoneNumberWithCountryCode !== "+998954990501"
      ) {
        const token = await getEskizAuthToken();
        const message = `topish Ilovasiga kirish uchun tasdiqlash kodingiz: ${confirmationCode} OJt59qMBmYJ`;
        await sendCustomSms(token, phoneNumberWithCountryCode, message);
      }

      return handleResponse(
        res,
        200,
        "success",
        "Confirmation code sent. Please check your phone.",
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

      const phoneNumberWithCountryCode = phoneNumber;
      const user = await Users.findOne({
        phoneNumber: phoneNumberWithCountryCode,
        confirmationCode,
      });

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

      await deleteUserAvatar(user._id);
      await deleteUserCv(user._id);
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
  async checkSmsStatus(req, res) {
    try {
      const token = await getEskizAuthToken();
      const { dispatchId } = req.body;
      const response = await checkSmsStatus(token, dispatchId);
      // console.log("SMS status response:", response);
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
  async addUsernamesToAllUsers(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized!", null, 0);
      }

      // Find all users
      const users = await Users.find();

      // Iterate over each user
      for (let user of users) {
        // Ensure fullName is set if username is empty
        if (!user.fullName || user.fullName.trim() === "") {
          user.fullName = createRandomFullname();
        }

        // Save the updated user
        await user.save();
      }

      return handleResponse(
        res,
        200,
        "success",
        "Usernames and fullNames updated successfully",
        null,
        0
      );
    } catch (error) {
      console.error("Error updating usernames and fullNames:", error);
    }
  }
}

module.exports = new AuthCTRL();
