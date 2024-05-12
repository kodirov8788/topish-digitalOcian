const Users = require("../models/user_model");
const Resume = require("../models/resume_model");
const { attachCookiesToResponse, createTokenUser } = require("../utils");
const { handleResponse } = require("../utils/handleResponse");
const { deleteUserAvatar } = require("./avatarCTRL");
const { deleteUserCv } = require("./resumeCTRL/CvCTRL");
const {
  RegisterValidation,
  validateLogin,
  logOutValidation,
} = require("../helpers/AuthValidation");
function createRandomFullname() {
  const firstName = "User";
  const randomNumber = Math.floor(Math.random() * 1000000);
  return `${firstName} ${randomNumber}`;
}
class AuthCTRL {
  async register(req, res) {
    const ROLE_JOB_SEEKER = "JobSeeker";
    const ROLE_EMPLOYER = "Employer";
    const ROLE_SERVICE = "Service";
    const ROLE_ADMIN = "Admin";

    try {
      const { error } = RegisterValidation(req.body);
      if (error) {
        return handleResponse(res, 400, "error", error.details[0].message);
      }
      const { phoneNumber, password, role, mobileToken } = req.body;

      const phoneNumberWithCountryCode = `+998${phoneNumber}`;
      const existingUser = await Users.findOne({
        phoneNumber: phoneNumberWithCountryCode,
      });

      if (existingUser) {
        return handleResponse(
          res,
          400,
          "error",
          "User already exists with this phone number"
        );
      }
      // Prepare data based on the role
      let userData = { phoneNumber: phoneNumberWithCountryCode };
      switch (role) {
        case ROLE_JOB_SEEKER:
          const resume = await new Resume().save();
          userData = {
            ...userData,
            jobSeeker: { fullName: createRandomFullname() },
            resumeId: resume._id,
          };
          break;
        case ROLE_EMPLOYER:
          userData = {
            ...userData,
            employer: { fullName: createRandomFullname() },
          };
          break;
        case ROLE_SERVICE:
          userData = {
            ...userData,
            service: { fullName: createRandomFullname() },
          };
          break;
        case ROLE_ADMIN:
          userData = {
            ...userData,
            admin: { fullName: createRandomFullname() },
          };
          break;
      }
      // Create user
      const user = await new Users({
        ...userData,
        password,
        role,
        mobileToken: [mobileToken], // Assuming `mobileToken` is an array in the schema
      }).save();
      const tokenUser = createTokenUser(user);
      attachCookiesToResponse({ res, user: tokenUser });
      return handleResponse(
        res,
        201,
        "success",
        "User registered successfully",
        tokenUser
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
  async initiateCodeSending(req, res) {
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

      // Generate confirmation code
      const confirmationCode = await generateConfirmationCode();

      // Save the confirmation code by phone number
      await saveConfirmationCodeByPhoneNumber(phoneNumber, confirmationCode);

      // Send the confirmation code via SMS or any other method
      sendConfirmationCodeViaPhoneNumber(phoneNumber, confirmationCode);

      handleResponse(
        res,
        200,
        "success",
        "Confirmation code sent successfully",
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
  async confirmPhoneNumberWithCode(req, res) {
    try {
      const { phoneNumber, confirmationCode } = req.body;

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

      // Retrieve the saved confirmation code by phone number
      const savedCode = await getConfirmationCodeByPhoneNumber(phoneNumber);

      // Check if the provided confirmation code matches the saved one
      if (savedCode === confirmationCode) {
        // If the codes match, mark the phone number as confirmed
        await markPhoneNumberAsConfirmed(phoneNumber);
        handleResponse(res, 200, "success", "Confirmation successful", null, 0);
      } else {
        // If the codes don't match, respond with an error
        handleResponse(res, 400, "error", "Invalid confirmation code", null, 0);
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
  async generateConfirmationCode() {
    const min = 100000; // Minimum 6-digit number (100000)
    const max = 999999; // Maximum 6-digit number (999999)

    // Generate a random number between min and max (inclusive)
    const code = Math.floor(Math.random() * (max - min + 1)) + min;

    // Convert the code to a string to ensure it has exactly 6 digits
    return code.toString();
  }
  async generateRandomCompanyName() {
    const companyNames = [
      "Acme Corporation",
      "Globex Corporation",
      "Wayne Enterprises",
      "Stark Industries",
      "Umbrella Corporation",
      "Initech",
      "Cyberdyne Systems",
      "Weyland-Yutani Corporation",
      "Oscorp Industries",
      "LexCorp",
    ];

    const randomIndex = Math.floor(Math.random() * companyNames.length);
    return companyNames[randomIndex];
  }
  async login(req, res) {
    try {
      const { phoneNumber, password, mobileToken } = req.body;
      // console.log(req.body);
      // Validate the login request body
      const { error } = validateLogin(req.body);
      if (error) {
        return handleResponse(
          res,
          400,
          "error",
          error.details[0].message, // Respond with the validation error message
          null,
          0
        );
      }
      // Find the user based on the provided phone number
      const user = await Users.findOne({ phoneNumber: `+998${phoneNumber}` });
      // If no user is found or the password is incorrect, respond with an error
      if (!user || !(await user.comparePassword(password))) {
        return handleResponse(
          res,
          400,
          "error",
          "Invalid phone number or password.",
          null,
          0
        );
      }
      // Generate token user and attach cookies to the response
      const tokenUser = createTokenUser(user);
      attachCookiesToResponse({ res, user: tokenUser });

      // If the mobileToken is not already included, push it to the user's mobileToken array and save
      if (!user.mobileToken.includes(mobileToken)) {
        user.mobileToken.push(mobileToken);
        await user.save();
      }

      // Respond with success
      return handleResponse(
        res,
        200,
        "success",
        "Login successful",
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
  async signOut(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized!", null, 0);
      }

      const { error } = logOutValidation(req.body);
      if (error) {
        return handleResponse(res, 400, "error", error.details[0].message);
      }
      const isSecure =
        res.req.secure || res.req.headers["x-forwarded-proto"] === "https";
      // Clear the authentication cookie
      res.cookie("token", "", {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? "None" : "Lax",
        expires: new Date(0),
      });

      // Optionally update user's mobile token if necessary
      let User = await Users.findById(req.user.id);
      if (User) {
        User.mobileToken = User.mobileToken.filter(
          (token) => token !== req.body.mobileToken
        );
        await User.save();
        return handleResponse(res, 200, "success", "User logged out!", null, 0);
      } else {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }
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
      if (user.resumeId) {
        const resume = await Resume.findById(user.resumeId);
        if (resume) {
          // Assuming avatarCTRL.deleteAvatar() and deleteCvFile() return Promises
          // Also assuming they need user or resume info to delete specific files
          await Promise.all([
            deleteUserAvatar(req.user.id),
            deleteUserCv(req.user.id),
          ]);
          await resume.deleteOne();
        }
      }

      await user.deleteOne();

      res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(Date.now()),
      });
      handleResponse(
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
        "Something went wrong: " + error.message,
        null,
        0
      );
    }
  }
}

module.exports = new AuthCTRL();
