// src/controllers/userCTRL.js
const Company = require("../models/company_model");
const Users = require("../models/user_model");
const { attachCookiesToResponse, createTokenUser } = require("../utils");
const { handleResponse } = require("../utils/handleResponse");

class UserCTRL {
  //   GET ALL USERS
  async getAllUsers(req, res) {
    try {
      // if (!req.user) {
      //   return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      // }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      // Get total count for pagination
      const total = await Users.countDocuments();

      // Calculate skip based on page and limit
      const skip = (page - 1) * limit;

      // Fetch users, applying skip, limit, and sort by _id
      let resultUsers = await Users.aggregate([
        { $sample: { size: total } }, // Shuffle all documents
        { $project: { refreshTokens: 0 } },
        { $skip: skip }, // Apply skip
        { $limit: limit }, // Apply limit
      ]);

      if (resultUsers.length === 0) {
        return handleResponse(res, 404, "info", "No users found", [], 0);
      }

      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit: limit,
        totalDocuments: total,
      };

      return handleResponse(
        res,
        200,
        "success",
        "Users retrieved successfully",
        resultUsers,
        total,
        pagination
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
  async searchUsers(req, res) {
    try {
      const { searchTerm } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      if (!searchTerm) {
        return handleResponse(
          res,
          400,
          "error",
          "Please provide a search term",
          null,
          0
        );
      }

      // Create a case-insensitive regex for the search term
      const regex = new RegExp(searchTerm, "i");

      // Search across multiple fields: fullName, phoneNumber, and jobTitle
      const query = {
        $or: [
          { fullName: { $regex: regex } },
          { phoneNumber: { $regex: regex } },
          { jobTitle: { $regex: regex } },
        ],
      };

      const users = await Users.find(query)
        .select("-password -refreshTokens")
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await Users.countDocuments(query);

      if (users.length === 0) {
        return handleResponse(res, 404, "info", "No users found", [], 0);
      }

      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit: limit,
        totalDocuments: total,
      };

      return handleResponse(
        res,
        200,
        "success",
        "Users retrieved successfully",
        users,
        users.length,
        pagination
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
  //  GET CURRENT USER
  async showCurrentUser(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const userId = req.user.id;
      const user = await Users.findById(userId).select(
        "-password -refreshTokens"
      );
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const company = await Company.findOne({ "workers.userId": userId });
      if (company) {
        const newWorkers = await Promise.all(
          company.workers.map(async (workerData) => {
            const worker = await Users.findById(workerData.userId).select(
              "-password -refreshTokens"
            );
            if (worker) {
              return {
                avatar: worker.avatar,
                phoneNumber: worker.phoneNumber,
                fullName: worker.employer?.fullName || worker.fullName,
                isAdmin: workerData.isAdmin,
                userId: worker.id,
              };
            }
            return null;
          })
        );

        const filteredWorkers = newWorkers.filter((worker) => worker !== null);

        const newUser = {
          ...user.toObject(),
          company: {
            ...company.toObject(),
            workers: filteredWorkers,
          },
        };

        return handleResponse(
          res,
          200,
          "success",
          "User retrieved successfully",
          newUser,
          1
        );
      }

      const newUser = {
        ...user.toObject(),
        company: null,
      };

      return handleResponse(
        res,
        200,
        "success",
        "User retrieved successfully",
        newUser,
        1
      );
    } catch (error) {
      console.error("Error in showCurrentUser function:", error);
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
  async getUser(req, res) {
    const userId = req.params.id;

    try {
      // if (!req.user) {
      //   return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      // }

      // Query for a user with the target role and the specified ID
      const user = await Users.findOne({
        _id: userId,
      }).select("-password -refreshTokens");

      if (!user) {
        return handleResponse(
          res,
          400,
          "error",
          "User not found or access denied",
          null,
          0
        );
      }

      // Spread operator (...) is not directly usable here, use user.toObject() if necessary
      return handleResponse(
        res,
        200,
        "success",
        "User retrieved successfully",
        { user: user.toObject() },
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
  async getRecommendedUsers(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const user = await Users.findById(req.user.id).select(
        "-password -refreshTokens"
      );

      // if (user.role !== "Employer") {
      //   // Fixed the role check logic
      //   return handleResponse(
      //     res,
      //     401,
      //     "error",
      //     "Role must be Employer",
      //     null,
      //     0
      //   );
      // }

      // Set query to find job seekers who are open to being recommended
      let query = { role: "JobSeeker", recommending: true };

      // Pagination parameters
      const page = parseInt(req.query.page) || 1; // Default to first page
      const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items
      const skip = (page - 1) * limit; // Calculate the number of documents to skip

      let resultUsers = await Users.find(query)
        .select("phoneNumber role email jobSeeker employer")
        .skip(skip) // Skip documents for pagination
        .limit(limit) // Limit the number of documents
        .exec(); // Execute the query

      if (resultUsers.length === 0) {
        return handleResponse(res, 200, "success", "No users found", [], 0);
      }

      // Count the total documents matching the query (without limit and skip) for pagination metadata
      const total = await Users.countDocuments(query);

      // Prepare users data for the response
      const usersData = resultUsers.map((user) => {
        return {
          id: user._id,
          phoneNumber: user.phoneNumber,
          email: user.email,
          role: user.role,
          jobSeeker: user.jobSeeker, // Assuming this indicates if the user is a job seeker
          employer: user.employer, // Assuming this indicates if the user is an employer
        };
      });

      // Pagination metadata
      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit: limit,
        totalDocuments: total,
      };

      return handleResponse(
        res,
        200,
        "success",
        "Users retrieved successfully",
        usersData,
        usersData.length,
        pagination
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
  //  UPDATE USER
  async updateUserNumber(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return handleResponse(
          res,
          400,
          "error",
          "Please provide all values",
          null,
          0
        );
      }

      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );

      user.phoneNumber = phoneNumber;

      await user.save();

      const tokenUser = createTokenUser(user);
      attachCookiesToResponse({ res, user: tokenUser });

      return handleResponse(
        res,
        200,
        "success",
        "Information updated successfully",
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
  async updateUserEmail(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const { email } = req.body;
      if (!email) {
        return handleResponse(
          res,
          400,
          "error",
          "Please provide all values",
          null,
          0
        );
      }

      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );

      user.email = email;

      await user.save();

      const tokenUser = createTokenUser(user);
      attachCookiesToResponse({ res, user: tokenUser });

      return handleResponse(
        res,
        200,
        "success",
        "Information updated successfully",
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
  async updateUserPurpose(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const { purpose } = req.body;
      let user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );

      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      if (purpose.length < 1) {
        user.purpose = "";
      } else {
        user.purpose = purpose;
      }

      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Information updated successfully",
        user,
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
  // UPDATE USER PASSWORD
  async updateUserPassword(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return handleResponse(
          res,
          400,
          "error",
          "Please provide all values",
          null,
          0
        );
      }

      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );

      const isPasswordCorrect = await user.comparePassword(oldPassword);

      if (!isPasswordCorrect) {
        return handleResponse(
          res,
          401,
          "error",
          "Invalid Credentials",
          null,
          0
        );
      } else {
        user.password = newPassword;
        await user.save();
        return handleResponse(
          res,
          200,
          "success",
          "Success! Password Updated.",
          null,
          0
        );
      }
    } catch (error) {
      return handleResponse(res, 403, "error", error.message, null, 0);
    }
  }
  // Unified update profile route without role distinction
  async updateUserProfile(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );

      // Extract the fields from the request body
      const {
        fullName,
        location,
        email,
        purpose,
        jobTitle,
        gender,
        birthday,
        expectedSalary,
        skills,
        professions,
        educationalBackground,
        workingExperience,
        employmentType,
        companyName,
        industry,
        aboutCompany,
        number,
      } = req.body;

      // Build an object with all the fields that can be updated
      const updatedFields = {
        fullName,
        location,
        contactEmail: email,
        purpose: purpose,
        jobTitle,
        gender,
        birthday,
        "resume.expectedSalary": expectedSalary,
        "resume.skills": skills,
        "resume.workingExperience": workingExperience,
        "resume.employmentType": employmentType,
        "employer.companyName": companyName,
        "employer.industry": industry,
        "employer.aboutCompany": aboutCompany,
        "employer.contactNumber": number,
      };

      // Remove any undefined fields (i.e., fields not included in the request)
      Object.keys(updatedFields).forEach((key) => {
        if (updatedFields[key] === undefined) {
          delete updatedFields[key];
        }
      });

      // Update the user's profile with the new fields
      const updatedUser = await Users.findByIdAndUpdate(
        user._id,
        { $set: updatedFields },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      return handleResponse(
        res,
        200,
        "success",
        "Profile updated successfully",
        updatedUser,
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
  async updateRole(req, res) {
    try {
      // Check if the user is authorized
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const userId = req.params.id; // Extract user ID from the request
      const { role } = req.body; // Extract the role from the request body
      console.log("role:", role);
      // Validate that the role is provided
      if (!role) {
        return handleResponse(
          res,
          400,
          "error",
          "Please provide a valid role",
          null,
          0
        );
      }

      // Validate that the role is one of the allowed values
      const validRoles = [
        "JobSeeker",
        "Employer",
        "Service",
        "Admin",
        "SubAdmin",
        "Manager",
      ];

      if (!validRoles.includes(role)) {
        return handleResponse(
          res,
          400,
          "error",
          "Invalid role. Allowed roles are: " + validRoles.join(", "),
          null,
          0
        );
      }

      // Find the user by ID
      const user = await Users.findOne({ _id: userId }).select(
        "-password -refreshTokens"
      );
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Update the user's role
      user.role = role;

      // Save the updated user
      const savedUser = await user.save();
      console.log("savedUser:", savedUser);
      // Respond with success
      return handleResponse(
        res,
        200,
        "success",
        "Role updated successfully",
        savedUser,
        1
      );
    } catch (error) {
      // Handle errors
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
  async updateUsername(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const userId = req.user.id;
      let { username } = req.body;

      if (!username) {
        return handleResponse(
          res,
          400,
          "error",
          "Please provide a username",
          null,
          0
        );
      }

      username = username.toLowerCase();
      username = username.trim();
      username = username.replace(/\s+/g, "");
      username = username.replace(/[^a-zA-Z0-9]/g, "");

      // Check if the username already exists
      const existingUser = await Users.findOne({ username }).select(
        "-password -refreshTokens"
      );
      if (existingUser) {
        return handleResponse(
          res,
          400,
          "error",
          "Username already in use",
          null,
          0
        );
      }

      const user = await Users.findOne({ _id: userId }).select(
        "-password -refreshTokens"
      );
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      user.username = username;

      const updatedUser = await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Username updated successfully",
        updatedUser,
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
  async updateCoinsForAllUsers(req, res) {
    try {
      // Check if the user is authenticated
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );
      // console.log(role);
      if (user.role !== "Admin") {
        return handleResponse(
          res,
          403,
          "error",
          "You are not authorized to perform this action",
          null,
          0
        );
      }

      const { coins } = req.body;
      // console.log(coins)
      if (typeof coins !== "number") {
        return handleResponse(res, 400, "error", "Invalid coin value", null, 0);
      }

      const result = await Users.updateMany({}, { coins: coins });
      // console.log(`Successfully updated coins for ${result.nModified} users.`);

      return handleResponse(
        res,
        200,
        "success",
        `Coins updated for ${result.nModified} users.`,
        null,
        1
      );
    } catch (error) {
      console.error("Error updating coins for users:", error);
      return handleResponse(
        res,
        500,
        "error",
        "Failed to update coins for all users.",
        null,
        0
      );
    }
  }
  async updateCoinsForUser(req, res) {
    try {
      // Check if the user is authenticated
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { userId, coins } = req.body;

      if (typeof coins !== "number") {
        return handleResponse(res, 400, "error", "Invalid coin value", null, 0);
      }

      const user = await Users.findById(userId).select(
        "-password -refreshTokens"
      );

      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      user.coins = coins;
      await user.save();

      // console.log(`Successfully updated coins for user with ID: ${userId}.`);

      return handleResponse(
        res,
        200,
        "success",
        "Coins updated successfully.",
        null,
        1
      );
    } catch (error) {
      console.error("Error updating coins for user:", error);
      return handleResponse(
        res,
        500,
        "error",
        "Failed to update coins for user.",
        null,
        0
      );
    }
  }
  async updateUserVisibility(req, res) {
    try {
      // Check if the user is authenticated
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );

      const { visible } = req.body;
      // Validate the 'visible' field
      if (typeof visible !== "boolean") {
        return handleResponse(
          res,
          400,
          "error",
          "Invalid value for visible",
          null,
          0
        );
      }

      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      if (user.role === "Employer") {
        user.employer.profileVisibility = visible;
      } else if (user.role === "JobSeeker") {
        user.jobSeeker.profileVisibility = visible;
      } else if (user.role === "Service") {
        user.service.profileVisibility = visible;
      } else {
        return handleResponse(
          res,
          400,
          "error",
          "Role not recognized",
          null,
          0
        );
      }

      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Visibility updated successfully.",
        user,
        1
      );
    } catch (error) {
      console.error("Error updating visibility for user:", error);
      return handleResponse(
        res,
        500,
        "error",
        "Failed to update visibility for user.",
        null,
        0
      );
    }
  }
  async addToAllUsersVisibility(req, res) {
    try {
      // Check if the user is authenticated
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );

      const { visible } = req.body;
      // Validate the 'visible' field
      if (typeof visible !== "boolean") {
        return handleResponse(
          res,
          400,
          "error",
          "Invalid value for visible",
          null,
          0
        );
      }

      // if (user.role !== "Admin") {
      //   return handleResponse(res, 403, "error", "You are not authorized to perform this action", null, 0);
      // }

      const result = await Users.updateMany(
        {},
        {
          "jobSeeker.profileVisibility": visible,
          "employer.profileVisibility": visible,
          "service.profileVisibility": visible,
        }
      );

      return handleResponse(
        res,
        200,
        "success",
        `Visibility updated for users.`,
        result,
        null,
        1
      );
    } catch (error) {
      console.error("Error updating visibility for users:", error);
      return handleResponse(
        res,
        500,
        "error",
        "Failed to update visibility for all users.",
        null,
        0
      );
    }
  }
  async migrateJobSeekerDataToResume(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      // Must be Admin
      const adminUser = await Users.findById(req.user.id).select(
        "-password -refreshTokens"
      );
      if (!adminUser || adminUser.role !== "Admin") {
        return handleResponse(
          res,
          403,
          "error",
          "Forbidden: Only admins can perform this action",
          null,
          0
        );
      }

      // Retrieve the target user
      const { targetUserId } = req.params;
      const user = await Users.findById(targetUserId).select(
        "-password -refreshTokens"
      );
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // If user has no jobSeeker field at all, we can't migrate
      if (!user.jobSeeker) {
        return handleResponse(
          res,
          200,
          "info",
          "No jobSeeker field found. Nothing to migrate.",
          user,
          1
        );
      }

      // Ensure user.resume exists
      if (!user.resume) {
        user.resume = {};
      }

      // The subfields you want to fill or ensure exist in resume
      // according to your schema
      if (user.resume.summary === undefined) user.resume.summary = null;
      if (!Array.isArray(user.resume.industry)) user.resume.industry = [];
      if (!user.resume.contact) {
        user.resume.contact = { email: null, phone: null, location: null };
      }
      if (!Array.isArray(user.resume.workExperience)) {
        user.resume.workExperience = [];
      }
      if (!Array.isArray(user.resume.education)) {
        user.resume.education = [];
      }
      if (!Array.isArray(user.resume.projects)) {
        user.resume.projects = [];
      }
      if (!Array.isArray(user.resume.certificates)) {
        user.resume.certificates = [];
      }
      if (!Array.isArray(user.resume.awards)) {
        user.resume.awards = [];
      }
      if (!Array.isArray(user.resume.languages)) {
        user.resume.languages = [];
      }
      if (!user.resume.cv) {
        user.resume.cv = {
          path: null,
          filename: null,
          size: null,
          key: null,
        };
      }
      if (!Array.isArray(user.resume.skills)) {
        user.resume.skills = [];
      }
      if (!Array.isArray(user.resume.professions)) {
        user.resume.professions = [];
      }
      if (!Array.isArray(user.resume.savedJobs)) {
        user.resume.savedJobs = [];
      }
      if (user.resume.expectedSalary === undefined) {
        user.resume.expectedSalary = "";
      }
      if (user.resume.searchJob === undefined) {
        user.resume.searchJob = true;
      }
      if (user.resume.profileVisibility === undefined) {
        user.resume.profileVisibility = false;
      }

      // Now move data from user.jobSeeker => user.resume
      // Only move if jobSeeker fields are present
      // e.g. user.jobSeeker.skills => user.resume.skills
      // If the user already has data in resume, you may want to merge or override.

      if (Array.isArray(user.jobSeeker.skills)) {
        user.resume.skills = [...user.jobSeeker.skills];
      }
      if (Array.isArray(user.jobSeeker.professions)) {
        user.resume.professions = [...user.jobSeeker.professions];
      }
      if (Array.isArray(user.jobSeeker.savedJobs)) {
        user.resume.savedJobs = [...user.jobSeeker.savedJobs];
      }
      if (typeof user.jobSeeker.expectedSalary === "string") {
        user.resume.expectedSalary = user.jobSeeker.expectedSalary;
      }
      if (typeof user.jobSeeker.nowSearchJob === "boolean") {
        // If your schema uses `searchJob` instead of `nowSearchJob`, assign it
        user.resume.searchJob = user.jobSeeker.nowSearchJob;
      }
      if (typeof user.jobSeeker.profileVisibility === "boolean") {
        user.resume.profileVisibility = user.jobSeeker.profileVisibility;
      }

      // Done: remove the jobSeeker field
      user.jobSeeker = undefined;

      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "JobSeeker data successfully migrated to resume. jobSeeker field removed.",
        user,
        1
      );
    } catch (error) {
      console.error("Error migrating job seeker data to resume:", error);
      return handleResponse(
        res,
        500,
        "error",
        `Something went wrong: ${error.message}`,
        null,
        0
      );
    }
  }
  // NEW FUNCTION: MIGRATE ALL USERS ----------------------------------------
  async migrateJobSeekerDataToResumeForAllUsers(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      // Must be Admin
      const adminUser = await Users.findById(req.user.id).select(
        "-password -refreshTokens"
      );
      if (!adminUser || adminUser.role !== "Admin") {
        return handleResponse(
          res,
          403,
          "error",
          "Forbidden: Only admins can perform this action",
          null,
          0
        );
      }

      // Find all users who have a jobSeeker field
      const usersWithJobSeeker = await Users.find({
        jobSeeker: { $exists: true },
      }).select("-password -refreshTokens");

      if (!usersWithJobSeeker.length) {
        return handleResponse(
          res,
          200,
          "info",
          "No users found with a jobSeeker field. Nothing to migrate.",
          [],
          0
        );
      }

      let migratedCount = 0;

      // For each user, replicate the same logic from your single-user migration
      for (const user of usersWithJobSeeker) {
        // Ensure user.resume exists
        if (!user.resume) {
          user.resume = {};
        }

        // Ensure subfields exist in resume
        if (user.resume.summary === undefined) user.resume.summary = null;
        if (!Array.isArray(user.resume.industry)) user.resume.industry = [];
        if (!user.resume.contact) {
          user.resume.contact = { email: null, phone: null, location: null };
        }
        if (!Array.isArray(user.resume.workExperience)) {
          user.resume.workExperience = [];
        }
        if (!Array.isArray(user.resume.education)) {
          user.resume.education = [];
        }
        if (!Array.isArray(user.resume.projects)) {
          user.resume.projects = [];
        }
        if (!Array.isArray(user.resume.certificates)) {
          user.resume.certificates = [];
        }
        if (!Array.isArray(user.resume.awards)) {
          user.resume.awards = [];
        }
        if (!Array.isArray(user.resume.languages)) {
          user.resume.languages = [];
        }
        if (!user.resume.cv) {
          user.resume.cv = {
            path: null,
            filename: null,
            size: null,
            key: null,
          };
        }
        if (!Array.isArray(user.resume?.skills)) {
          user.resume.skills = [];
        }
        if (!Array.isArray(user.resume.professions)) {
          user.resume.professions = [];
        }
        if (!Array.isArray(user.resume.savedJobs)) {
          user.resume.savedJobs = [];
        }
        if (user.resume.expectedSalary === undefined) {
          user.resume.expectedSalary = "";
        }
        if (user.resume.searchJob === undefined) {
          user.resume.searchJob = true;
        }
        if (user.resume.profileVisibility === undefined) {
          user.resume.profileVisibility = false;
        }
        if (user.jobSeeker) {
          // Now move data from user.jobSeeker => user.resume
          // Overwrite or merge as needed
          if (Array.isArray(user?.jobSeeker?.skills)) {
            user.resume.skills = [...user.jobSeeker.skills];
          }
          if (Array.isArray(user.jobSeeker.professions)) {
            user.resume.professions = [...user.jobSeeker.professions];
          }
          if (Array.isArray(user.jobSeeker.savedJobs)) {
            user.resume.savedJobs = [...user.jobSeeker.savedJobs];
          }
          if (typeof user.jobSeeker.expectedSalary === "string") {
            user.resume.expectedSalary = user.jobSeeker.expectedSalary;
          }
          if (typeof user.jobSeeker.nowSearchJob === "boolean") {
            user.resume.searchJob = user.jobSeeker.nowSearchJob;
          }
          if (typeof user.jobSeeker.profileVisibility === "boolean") {
            user.resume.profileVisibility = user.jobSeeker.profileVisibility;
          }

          // Remove the jobSeeker field entirely
          user.jobSeeker = undefined;
        }

        // console.log("user.jobSeeker:", user.jobSeeker)
        // Save changes
        await user.save();
        migratedCount += 1;
      }

      return handleResponse(
        res,
        200,
        "success",
        `JobSeeker data migrated for ${migratedCount} users. jobSeeker field removed.`,
        null,
        migratedCount
      );
    } catch (error) {
      console.error("Error migrating job seeker data for all users:", error);
      return handleResponse(
        res,
        500,
        "error",
        `Something went wrong: ${error.message}`,
        null,
        0
      );
    }
  }
  async updateJobTitle(req, res) {
    try {
      // 1) Verify user is authenticated
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      // 2) Extract the jobTitle from the request body
      const { jobTitle } = req.body;
      if (!jobTitle) {
        return handleResponse(
          res,
          400,
          "error",
          "Please provide a jobTitle",
          null,
          0
        );
      }

      // 3) Find the user in the database
      const user = await Users.findById(req.user.id).select(
        "-password -refreshTokens"
      );
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }
      console.log("jobTitle:", jobTitle);
      // 4) Update the jobTitle on the user document
      user.jobTitle = jobTitle;

      // 5) Save the changes
      await user.save();

      // 6) Respond with success
      return handleResponse(
        res,
        200,
        "success",
        "Job title updated successfully",
        user,
        1
      );
    } catch (error) {
      // 7) Handle errors
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
  async addRolesToUser(req, res) {
    console.log("addRolesToUser");
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      // console.log("req.user:", req.user)

      // if (!req.user.admin) {
      //   return handleResponse(
      //     res,
      //     401,
      //     "error",
      //     "user does not have admin role",
      //     null,
      //     0
      //   );
      // }
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const { userId, roles } = req.body;
      console.log("roles:", roles);
      if (!userId) {
        return handleResponse(
          res,
          400,
          "error",
          "Please provide valid userId and roles",
          null,
          0
        );
      }
      const user = await Users.findById(userId).select(
        "-password -refreshTokens"
      );
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Ensure roles are valid
      // "Admin", "Supervisor", "Consultant", "Copywriter"

      const validRoles = ["Admin", "Supervisor", "Consultant", "Copywriter"];
      const newRoles = roles.filter((role) => validRoles.includes(role));

      // if (newRoles.length === 0) {
      //   return handleResponse(res, 400, "error", "No valid roles provided", null, 0);
      // }
      console.log("newRoles:", newRoles);
      // Add new roles to the user's existing roles
      user.roles = newRoles;

      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Roles updated successfully",
        user,
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
}

module.exports = new UserCTRL();
