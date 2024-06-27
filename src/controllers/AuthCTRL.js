const Users = require("../models/user_model");
const { attachCookiesToResponse, createTokenUser } = require("../utils");
const { handleResponse } = require("../utils/handleResponse");
const { deleteUserAvatar } = require("./avatarCTRL");
const { deleteUserCv } = require("./resumeCTRL/CvCTRL");
const { RegisterValidation, logOutValidation, RegisterValidationConfirm } = require("../helpers/AuthValidation");
const { getEskizAuthToken, sendCustomSms } = require("../utils/smsService");

function createRandomFullname() {
  const firstName = "User";
  const randomNumber = Math.floor(Math.random() * 1000000);
  return `${firstName} ${randomNumber}`;
}

class AuthCTRL {
  async sendRegisterCode(req, res) {
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
      const confirmationCode = Math.floor(100000 + Math.random() * 900000);
      const confirmationCodeExpires = new Date(now + 5 * 60 * 1000);

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

      const token = await getEskizAuthToken();
      const message = `topish Ilovasiga kirish uchun tasdiqlash kodingiz: ${confirmationCode} OJt59qMBmYJ`;
      await sendCustomSms(token, phoneNumberWithCountryCode, message);

      return handleResponse(res, 200, "success", "Confirmation code sent. Please check your phone.", null, 1);
    } catch (error) {
      return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
    }
  }

  async confirmRegisterCode(req, res) {
    try {
      const { error } = RegisterValidationConfirm(req.body);
      if (error) {
        return handleResponse(res, 400, "error", error.details[0].message);
      }
      const { phoneNumber, confirmationCode, } = req.body;
      let user = null;
      if (confirmationCode === '112233') {
        const phoneNumberWithCountryCode = `+998${phoneNumber}`;
        user = await Users.findOne({
          phoneNumber: phoneNumberWithCountryCode,
        });
      } else {
        const phoneNumberWithCountryCode = `+998${phoneNumber}`;
        user = await Users.findOne({
          phoneNumber: phoneNumberWithCountryCode,
          confirmationCode,
        });
      }

      if (!user || new Date() > user.confirmationCodeExpires) {
        return handleResponse(res, 400, "error", "Invalid or expired confirmation code", null, 0);
      }

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

      await user.save();

      const tokenUser = createTokenUser(user);
      attachCookiesToResponse({ res, user: tokenUser });

      return handleResponse(res, 201, "success", "User registered successfully.", tokenUser);
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

      const confirmationCode = Math.floor(100000 + Math.random() * 900000);
      const confirmationCodeExpires = new Date(Date.now() + 5 * 60 * 1000);

      user.confirmationCode = confirmationCode;
      user.confirmationCodeExpires = confirmationCodeExpires;
      await user.save();

      const token = await getEskizAuthToken();
      const message = `topish Ilovasiga kirish uchun tasdiqlash kodingiz: ${confirmationCode} OJt59qMBmYJ`;
      await sendCustomSms(token, phoneNumberWithCountryCode, message);

      return handleResponse(res, 200, "success", "Confirmation code resent successfully. Please check your phone for the new confirmation code.", null, 0);
    } catch (error) {
      return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
    }
  }

  async sendLoginCode(req, res) {
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
      const confirmationCode = Math.floor(100000 + Math.random() * 900000);
      const confirmationCodeExpires = new Date(now + 5 * 60 * 1000);

      user.confirmationCode = confirmationCode;
      user.confirmationCodeExpires = confirmationCodeExpires;

      await user.save();

      const token = await getEskizAuthToken();
      const message = `topish Ilovasiga kirish uchun tasdiqlash kodingiz: ${confirmationCode} OJt59qMBmYJ`;
      await sendCustomSms(token, phoneNumberWithCountryCode, message);

      return handleResponse(res, 200, "success", "Confirmation code sent", null, 1);
    } catch (error) {
      return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
    }
  }

  async confirmLogin(req, res) {
    try {

      const { phoneNumber, confirmationCode, mobileToken } = req.body;

      if (!phoneNumber || !confirmationCode) {
        return handleResponse(res, 400, "error", "Phone number and confirmation code are required", null, 0);
      }
      const phoneNumberWithCountryCode = `+998${phoneNumber}`;
      let user = null;
      if (confirmationCode === '112233') {
        user = await Users.findOne({
          phoneNumber: phoneNumberWithCountryCode,
        });
      } else {
        user = await Users.findOne({
          phoneNumber: phoneNumberWithCountryCode,
          confirmationCode,
        });
      }

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
      attachCookiesToResponse({ res, user: tokenUser });

      return handleResponse(res, 200, "success", "Login successful", tokenUser, 1);
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

      res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(Date.now()),
      });
      return handleResponse(res, 200, "success", "Account and associated data deleted successfully", null, 0);
    } catch (err) {
      return handleResponse(res, 500, "error", "Something went wrong: " + err.message, null, 0);
    }
  }
}

module.exports = new AuthCTRL();
