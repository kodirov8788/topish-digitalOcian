const Users = require("../models/user_model");
const { attachCookiesToResponse, createTokenUser } = require("../utils");
const { handleResponse } = require("../utils/handleResponse");
const { deleteUserAvatar } = require("./avatarCTRL");
const { deleteUserCv } = require("./resumeCTRL/CvCTRL");
const { RegisterValidation, logOutValidation } = require("../helpers/AuthValidation");
const { getEskizAuthToken, sendCustomSms } = require("../utils/smsService");
const crypto = require('crypto');

function createRandomFullname() {
  const firstName = "User";
  const randomNumber = Math.floor(Math.random() * 1000000);
  return `${firstName} ${randomNumber}`;
}

class AuthCTRL {
  async register(req, res) {
    try {
      const { error } = RegisterValidation(req.body);
      if (error) {
        return handleResponse(res, 400, "error", error.details[0].message);
      }
      const { phoneNumber, role, mobileToken } = req.body;

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

      // Generate a confirmation code and set expiration time (5 minutes from now)
      const confirmationCode = Math.floor(100000 + Math.random() * 900000); // Generates a 6 digit random number
      const confirmationCodeExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

      // Create user
      const user = await new Users({
        phoneNumber: phoneNumberWithCountryCode,
        fullName: createRandomFullname(),
        role,
        mobileToken: [mobileToken], // Assuming `mobileToken` is an array in the schema
        confirmationCode, // Save the confirmation code
        confirmationCodeExpires, // Save the expiration time
        jobSeeker: {
          skills: [],
          professions: [],
          expectedSalary: "",
          jobTitle: "",
          nowSearchJob: true,
          workingExperience: "",
          employmentType: "full-time",
          educationalBackground: "",
        },
        employer: {
          aboutCompany: "",
          industry: "",
          contactNumber: "",
          contactEmail: "",
          jobs: [],
        },
        service: {
          savedOffices: [],
        },
      }).save();

      const tokenUser = createTokenUser(user);
      attachCookiesToResponse({ res, user: tokenUser });

      // Send confirmation code via SMS
      const token = await getEskizAuthToken();
      const message = `topish.org saytida ro‘yxatdan o‘tish uchun tasdiqlash codi: ${confirmationCode}`;
      await sendCustomSms(token, phoneNumberWithCountryCode, message);

      return handleResponse(
        res,
        201,
        "success",
        "User registered successfully. Please check your phone for the confirmation code.",
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
  async confirmPhoneNumberWithCode(req, res) {
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

      const phoneNumberWithCountryCode = `+998${phoneNumber}`;
      const user = await Users.findOne({
        phoneNumber: phoneNumberWithCountryCode,
        confirmationCode,
      });

      if (!user) {
        return handleResponse(
          res,
          400,
          "error",
          "Invalid confirmation code or phone number",
          null,
          0
        );
      }

      // Check if the confirmation code is expired
      if (user.confirmationCodeExpires < new Date()) {
        return handleResponse(
          res,
          400,
          "error",
          "Confirmation code has expired",
          null,
          0
        );
      }

      // If the codes match and not expired, mark the phone number as confirmed
      user.phoneConfirmed = true;
      user.confirmationCode = undefined; // Clear the confirmation code
      user.confirmationCodeExpires = undefined; // Clear the expiration time
      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Phone number confirmed successfully",
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

      const phoneNumberWithCountryCode = `+998${phoneNumber}`;
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

      // Generate a new confirmation code and set expiration time (5 minutes from now)
      const confirmationCode = Math.floor(100000 + Math.random() * 900000); // Generates a 6 digit random number
      const confirmationCodeExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

      // Update the user's confirmation code and expiration time
      user.confirmationCode = confirmationCode;
      user.confirmationCodeExpires = confirmationCodeExpires;
      await user.save();

      // Send new confirmation code via SMS
      const token = await getEskizAuthToken();
      const message = `topish.org saytida ro‘yxatdan o‘tish uchun tasdiqlash codi: ${confirmationCode}`;
      await sendCustomSms(token, phoneNumberWithCountryCode, message);

      return handleResponse(
        res,
        200,
        "success",
        "Confirmation code resent successfully. Please check your phone for the new confirmation code.",
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
  // Send login confirmation code
  async sendLoginCode(req, res) {
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        return handleResponse(res, 400, "error", "Phone number is required", null, 0);
      }

      const phoneNumberWithCountryCode = `+998${phoneNumber}`;
      let user = await Users.findOne({
        phoneNumber: phoneNumberWithCountryCode,
      });

      if (!user) {
        return handleResponse(res, 400, "error", "User not found", null, 0);
      }

      // Generate a confirmation code and set expiration time (5 minutes from now)
      const confirmationCode = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit random number
      const confirmationCodeExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

      user.confirmationCode = confirmationCode;
      user.confirmationCodeExpires = confirmationCodeExpires;
      await user.save();

      // Send confirmation code via SMS
      const token = await getEskizAuthToken();
      const message = `topish.org saytida ro‘yxatdan o‘tish uchun tasdiqlash codi: ${confirmationCode}`;
      await sendCustomSms(token, phoneNumberWithCountryCode, message);

      return handleResponse(res, 200, "success", "Confirmation code sent", null, 1);
    } catch (error) {
      return handleResponse(res, 500, "error", "Something went wrong: " + error.message, null, 0);
    }
  }
  // Confirm login with confirmation code
  async confirmLogin(req, res) {
    try {
      const { phoneNumber, confirmationCode, mobileToken } = req.body;

      if (!phoneNumber || !confirmationCode) {
        return handleResponse(res, 400, "error", "Phone number and confirmation code are required", null, 0);
      }

      const phoneNumberWithCountryCode = `+998${phoneNumber}`;
      const user = await Users.findOne({
        phoneNumber: phoneNumberWithCountryCode,
        confirmationCode,
      });

      if (!user || new Date() > user.confirmationCodeExpires) {
        return handleResponse(res, 400, "error", "Invalid or expired confirmation code", null, 0);
      }

      // Confirm the phone number
      user.phoneConfirmed = true;
      user.confirmationCode = null; // Clear the confirmation code
      user.confirmationCodeExpires = null; // Clear the expiration time

      // Generate a unique token for the session
      const sessionToken = crypto.randomBytes(64).toString('hex');
      const tokenExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Token valid for 7 days

      user.sessions.push({
        token: sessionToken,
        expires: tokenExpiration
      });

      // If the mobileToken is provided and not already included, push it to the user's mobileToken array
      if (mobileToken && !user.mobileToken.includes(mobileToken)) {
        user.mobileToken.push(mobileToken);
      }

      await user.save();

      // Attach the session token to the response
      res.cookie('sessionToken', sessionToken, { httpOnly: true, secure: true });

      // Respond with success
      return handleResponse(
        res,
        200,
        "success",
        "Login successful",
        { token: sessionToken, user: createTokenUser(user) },
        1
      );
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

      // Delete user avatar
      await deleteUserAvatar(user.avatar);

      // Delete user CV
      await deleteUserCv(user.cv);

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
        "Something went wrong: " + err.message,
        null,
        0
      );
    }
  }
}

module.exports = new AuthCTRL();










// const Users = require("../models/user_model");
// const { attachCookiesToResponse, createTokenUser } = require("../utils");
// const { handleResponse } = require("../utils/handleResponse");
// const { deleteUserAvatar } = require("./avatarCTRL");
// const { deleteUserCv } = require("./resumeCTRL/CvCTRL");
// const {
//   RegisterValidation,
//   validateLogin,
//   logOutValidation,
// } = require("../helpers/AuthValidation");
// const { getEskizAuthToken, sendCustomSms } = require("../utils/smsService");
// function createRandomFullname() {
//   const firstName = "User";
//   const randomNumber = Math.floor(Math.random() * 1000000);
//   return `${firstName} ${randomNumber}`;
// }
// class AuthCTRL {
//   async register(req, res) {
//     try {
//       const { error } = RegisterValidation(req.body);
//       if (error) {
//         return handleResponse(res, 400, "error", error.details[0].message);
//       }
//       const { phoneNumber, password, role, mobileToken } = req.body;

//       const phoneNumberWithCountryCode = `+998${phoneNumber}`;
//       const existingUser = await Users.findOne({
//         phoneNumber: phoneNumberWithCountryCode,
//       });

//       if (existingUser) {
//         return handleResponse(
//           res,
//           400,
//           "error",
//           "User already exists with this phone number"
//         );
//       }
//       // Generate a confirmation code and set expiration time (15 minutes from now)
//       const confirmationCode = Math.floor(100000 + Math.random() * 900000); // Generates a 6 digit random number
//       const confirmationCodeExpires = new Date(Date.now() + 1 * 60 * 1000); // 5 minutes from now
//       // Create user
//       const user = await new Users({
//         phoneNumber: phoneNumberWithCountryCode,
//         fullName: createRandomFullname(),
//         password,
//         role,
//         mobileToken: [mobileToken], // Assuming `mobileToken` is an array in the schema
//         confirmationCode, // Save the confirmation code
//         confirmationCodeExpires, // Save the expiration time
//         jobSeeker: {
//           skills: [],
//           professions: [],
//           expectedSalary: "",
//           jobTitle: "",
//           nowSearchJob: true,
//           workingExperience: "",
//           employmentType: "full-time",
//           educationalBackground: "",
//         },
//         employer: {
//           aboutCompany: "",
//           industry: "",
//           contactNumber: "",
//           contactEmail: "",
//           jobs: [],
//         },
//         service: {
//           savedOffices: [],
//         },
//       }).save();

//       const tokenUser = createTokenUser(user);
//       attachCookiesToResponse({ res, user: tokenUser });
//       // Send confirmation code via SMS
//       // const token = await getEskizAuthToken();
//       // const message = `topish.org saytida ro‘yxatdan o‘tish uchun tasdiqlash codi: ${confirmationCode}`;
//       // await sendCustomSms(token, phoneNumberWithCountryCode, message);

//       return handleResponse(
//         res,
//         201,
//         "success",
//         "User registered successfully. Please check your phone for the confirmation code.",
//         tokenUser
//       );
//     } catch (error) {
//       return handleResponse(
//         res,
//         500,
//         "error",
//         "Something went wrong: " + error.message,
//         null,
//         0
//       );
//     }
//   }
//   async confirmPhoneNumberWithCode(req, res) {
//     try {
//       const { phoneNumber, confirmationCode } = req.body;

//       if (!phoneNumber || !confirmationCode) {
//         return handleResponse(
//           res,
//           400,
//           "error",
//           "Phone number and confirmation code are required",
//           null,
//           0
//         );
//       }

//       const phoneNumberWithCountryCode = `+998${phoneNumber}`;
//       const user = await Users.findOne({
//         phoneNumber: phoneNumberWithCountryCode,
//         confirmationCode,
//       });

//       if (!user) {
//         return handleResponse(
//           res,
//           400,
//           "error",
//           "Invalid confirmation code or phone number",
//           null,
//           0
//         );
//       }

//       // Check if the confirmation code is expired
//       if (user.confirmationCodeExpires < new Date()) {
//         return handleResponse(
//           res,
//           400,
//           "error",
//           "Confirmation code has expired",
//           null,
//           0
//         );
//       }

//       // If the codes match and not expired, mark the phone number as confirmed
//       user.phoneConfirmed = true;
//       user.confirmationCode = undefined; // Clear the confirmation code
//       user.confirmationCodeExpires = undefined; // Clear the expiration time
//       await user.save();

//       return handleResponse(
//         res,
//         200,
//         "success",
//         "Phone number confirmed successfully",
//         null,
//         0
//       );
//     } catch (error) {
//       return handleResponse(
//         res,
//         500,
//         "error",
//         "Something went wrong: " + error.message,
//         null,
//         0
//       );
//     }
//   }
//   async resendConfirmationCode(req, res) {
//     try {
//       const { phoneNumber } = req.body;

//       if (!phoneNumber) {
//         return handleResponse(
//           res,
//           400,
//           "error",
//           "Phone number is required",
//           null,
//           0
//         );
//       }

//       const phoneNumberWithCountryCode = `+998${phoneNumber}`;
//       const user = await Users.findOne({
//         phoneNumber: phoneNumberWithCountryCode,
//       });

//       if (!user) {
//         return handleResponse(
//           res,
//           400,
//           "error",
//           "User not found with this phone number",
//           null,
//           0
//         );
//       }

//       // Generate a new confirmation code and set expiration time (15 minutes from now)
//       const confirmationCode = Math.floor(100000 + Math.random() * 900000); // Generates a 6 digit random number
//       const confirmationCodeExpires = new Date(Date.now() + 1 * 60 * 1000); // 5 minutes from now

//       // Update the user's confirmation code and expiration time
//       user.confirmationCode = confirmationCode;
//       user.confirmationCodeExpires = confirmationCodeExpires;
//       await user.save();

//       // Send new confirmation code via SMS
//       const token = await getEskizAuthToken();
//       const message = `topish.org saytida ro‘yxatdan o‘tish uchun tasdiqlash codi: ${confirmationCode}`;
//       await sendCustomSms(token, phoneNumberWithCountryCode, message);

//       return handleResponse(
//         res,
//         200,
//         "success",
//         "Confirmation code resent successfully. Please check your phone for the new confirmation code.",
//         null,
//         0
//       );
//     } catch (error) {
//       return handleResponse(
//         res,
//         500,
//         "error",
//         "Something went wrong: " + error.message,
//         null,
//         0
//       );
//     }
//   }
//   async resetPassword(req, res) {
//     try {
//       const { phoneNumber } = req.body;

//       if (!phoneNumber) {
//         return handleResponse(
//           res,
//           400,
//           "error",
//           "Phone number is required",
//           null,
//           0
//         );
//       }

//       const phoneNumberWithCountryCode = `+998${phoneNumber}`;
//       const user = await Users.findOne({
//         phoneNumber: phoneNumberWithCountryCode,
//       });

//       if (!user) {
//         return handleResponse(
//           res,
//           400,
//           "error",
//           "User not found with this phone number",
//           null,
//           0
//         );
//       }

//       // Generate a new confirmation code and set expiration time (15 minutes from now)
//       const confirmationCode = Math.floor(100000 + Math.random() * 900000); // Generates a 6 digit random number
//       const confirmationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

//       // Update the user's confirmation code and expiration time
//       user.confirmationCode = confirmationCode;
//       user.confirmationCodeExpires = confirmationCodeExpires;
//       await user.save();

//       // Send confirmation code via SMS
//       const token = await getEskizAuthToken();
//       const message = `topish.org saytidagi parolingizni tiklash uchun tasdiqlash kodi: ${confirmationCode}`;
//       await sendCustomSms(token, phoneNumberWithCountryCode, message);

//       return handleResponse(
//         res,
//         200,
//         "success",
//         "Confirmation code sent successfully. Please check your phone.",
//         null,
//         0
//       );
//     } catch (error) {
//       return handleResponse(
//         res,
//         500,
//         "error",
//         "Something went wrong: " + error.message,
//         null,
//         0
//       );
//     }
//   }
//   async confirmResetPassword(req, res) {
//     try {
//       const { phoneNumber, confirmationCode, newPassword } = req.body;

//       if (!phoneNumber || !confirmationCode || !newPassword) {
//         return handleResponse(
//           res,
//           400,
//           "error",
//           "Phone number, confirmation code, and new password are required",
//           null,
//           0
//         );
//       }

//       const phoneNumberWithCountryCode = `+998${phoneNumber}`;
//       const user = await Users.findOne({
//         phoneNumber: phoneNumberWithCountryCode,
//         confirmationCode,
//       });

//       if (!user) {
//         return handleResponse(
//           res,
//           400,
//           "error",
//           "Invalid confirmation code or phone number",
//           null,
//           0
//         );
//       }

//       // Check if the confirmation code is expired
//       if (user.confirmationCodeExpires < new Date()) {
//         return handleResponse(
//           res,
//           400,
//           "error",
//           "Confirmation code has expired",
//           null,
//           0
//         );
//       }

//       // If the code is valid and not expired, update the user's password
//       user.password = newPassword; // Ensure to hash the password before saving in a real application
//       user.confirmationCode = undefined; // Clear the confirmation code
//       user.confirmationCodeExpires = undefined; // Clear the expiration time
//       await user.save();

//       return handleResponse(
//         res,
//         200,
//         "success",
//         "Password reset successfully",
//         null,
//         0
//       );
//     } catch (error) {
//       return handleResponse(
//         res,
//         500,
//         "error",
//         "Something went wrong: " + error.message,
//         null,
//         0
//       );
//     }
//   }
//   async generateRandomCompanyName() {
//     const companyNames = [
//       "Acme Corporation",
//       "Globex Corporation",
//       "Wayne Enterprises",
//       "Stark Industries",
//       "Umbrella Corporation",
//       "Initech",
//       "Cyberdyne Systems",
//       "Weyland-Yutani Corporation",
//       "Oscorp Industries",
//       "LexCorp",
//     ];

//     const randomIndex = Math.floor(Math.random() * companyNames.length);
//     return companyNames[randomIndex];
//   }
//   async login(req, res) {
//     try {
//       const { phoneNumber, password, mobileToken } = req.body;

//       // Validate the login request body
//       const { error } = validateLogin(req.body);
//       if (error) {
//         return handleResponse(
//           res,
//           400,
//           "error",
//           error.details[0].message, // Respond with the validation error message
//           null,
//           0
//         );
//       }

//       // Find the user based on the provided phone number
//       const phoneNumberWithCountryCode = `+998${phoneNumber}`;
//       const user = await Users.findOne({
//         phoneNumber: phoneNumberWithCountryCode,
//       });

//       // If no user is found or the password is incorrect, respond with an error
//       if (!user || !(await user.comparePassword(password))) {
//         return handleResponse(
//           res,
//           400,
//           "error",
//           "Invalid phone number or password.",
//           null,
//           0
//         );
//       }

//       // Check if the phone number is confirmed
//       if (!user.phoneConfirmed) {
//         return handleResponse(
//           res,
//           400,
//           "error",
//           "Phone number is not confirmed. Please confirm your phone number first.",
//           null,
//           0
//         );
//       }

//       // Generate token user and attach cookies to the response
//       const tokenUser = createTokenUser(user);
//       attachCookiesToResponse({ res, user: tokenUser });

//       // If the mobileToken is provided and not already included, push it to the user's mobileToken array and save
//       if (mobileToken && !user.mobileToken.includes(mobileToken)) {
//         user.mobileToken.push(mobileToken);
//         await user.save();
//       }
//       // console.log(tokenUser);
//       // Respond with success
//       return handleResponse(
//         res,
//         200,
//         "success",
//         "Login successful",
//         tokenUser,
//         1
//       );
//     } catch (error) {
//       return handleResponse(
//         res,
//         500,
//         "error",
//         "Something went wrong: " + error.message,
//         null,
//         0
//       );
//     }
//   }
//   async signOut(req, res) {
//     try {
//       if (!req.user) {
//         return handleResponse(res, 401, "error", "Unauthorized!", null, 0);
//       }

//       const { error } = logOutValidation(req.body);
//       if (error) {
//         return handleResponse(res, 400, "error", error.details[0].message);
//       }
//       const isSecure =
//         res.req.secure || res.req.headers["x-forwarded-proto"] === "https";
//       // Clear the authentication cookie
//       res.cookie("token", "", {
//         httpOnly: true,
//         secure: isSecure,
//         sameSite: isSecure ? "None" : "Lax",
//         expires: new Date(0),
//       });

//       // Optionally update user's mobile token if necessary
//       let User = await Users.findById(req.user.id);
//       if (User) {
//         User.mobileToken = User.mobileToken.filter(
//           (token) => token !== req.body.mobileToken
//         );
//         await User.save();
//         return handleResponse(res, 200, "success", "User logged out!", null, 0);
//       } else {
//         return handleResponse(res, 404, "error", "User not found", null, 0);
//       }
//     } catch (error) {
//       console.error("Logout error:", error);
//       return handleResponse(
//         res,
//         500,
//         "error",
//         "Something went wrong: " + error.message,
//         null,
//         0
//       );
//     }
//   }
//   async deleteAccount(req, res) {
//     try {
//       if (!req.user) {
//         return handleResponse(res, 401, "error", "Unauthorized!", null, 0);
//       }

//       const userID = req.user.id;
//       const user = await Users.findById(userID);
//       if (!user) {
//         return handleResponse(res, 404, "error", "User not found", null, 0);
//       }

//       await user.deleteOne();

//       res.cookie("token", "", {
//         httpOnly: true,
//         expires: new Date(Date.now()),
//       });
//       handleResponse(
//         res,
//         200,
//         "success",
//         "Account and associated data deleted successfully",
//         null,
//         0
//       );
//     } catch (err) {
//       return handleResponse(
//         res,
//         500,
//         "error",
//         "Something went wrong: " + error.message,
//         null,
//         0
//       );
//     }
//   }
// }

// module.exports = new AuthCTRL();
