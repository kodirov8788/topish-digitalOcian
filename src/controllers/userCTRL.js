const Users = require("../models/user_model");
const { attachCookiesToResponse, createTokenUser } = require("../utils");
const { handleResponse } = require("../utils/handleResponse");

class UserCTRL {
  //   GET ALL USERS
  async getAllUsers(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      // Determine the target role for searching based on the requester's role
      let targetRole = req.user.role === "Employer" ? "JobSeeker" : "Employer";

      let query = { role: targetRole }; // Filter users based on the target role

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
        return handleResponse(res, 404, "info", "No users found", [], 0);
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
          jobSeeker: user.jobSeeker, // Include or exclude based on privacy/security considerations
          employer: user.employer, // Include or exclude based on privacy/security considerations
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

  //  GET CURRENT USER
  async showCurrentUser(req, res) {
    const userId = req.user.id;
    try {
      if (
        !req.user ||
        !userId ||
        userId === "" ||
        userId === null ||
        userId === undefined ||
        userId === "undefined" ||
        userId === "null"
      ) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const user = await Users.findById({ _id: userId })
        .populate({ path: "resumeId" })
        .select("-password");
      if (user) {
        return handleResponse(
          res,
          200,
          "success",
          "User retrieved successfully",
          user,
          1
        );
      } else {
        return handleResponse(res, 401, "error", "User not found", null, 0);
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
  async getUser(req, res) {
    const userId = req.params.id;

    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      // Define the target role based on the requester's role
      let targetRole;
      if (req.user.role === "Employer") {
        targetRole = "JobSeeker";
      } else if (req.user.role === "JobSeeker") {
        targetRole = "Employer";
      } else {
        // Handle unexpected roles
        return handleResponse(res, 400, "error", "Invalid user role", null, 0);
      }

      // Query for a user with the target role and the specified ID
      const user = await Users.findOne({ _id: userId, role: targetRole })
        .populate({ path: "resumeId" })
        .select("-password");

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

      if (req.user.role !== "Employer") {
        // Fixed the role check logic
        return handleResponse(
          res,
          401,
          "error",
          "Role must be Employer",
          null,
          0
        );
      }

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

      const user = await Users.findOne({ _id: req.user.id });

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

      const user = await Users.findOne({ _id: req.user.id });

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

      const user = await Users.findOne({ _id: req.user.id });

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
  async updateJobSeekerProfile(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const userId = req.user.id;
      const {
        jobtitle,
        fullName,
        gender,
        birthday,
        location,
        expectedSalary,
        skills,
        professions,
        educationalBackground,
        workingExperience,
        employmentType,
      } = req.body;

      if (req.user.role === "JobSeeker") {
        // Update the job seeker's profile
        const updatedUser = await Users.findByIdAndUpdate(
          userId,
          {
            $set: {
              "jobSeeker.jobtitle": jobtitle,
              "jobSeeker.fullName": fullName,
              "jobSeeker.gender": gender,
              "jobSeeker.birthday": birthday,
              "jobSeeker.location": location,
              "jobSeeker.expectedSalary": expectedSalary,
              "jobSeeker.skills": skills,
              "jobSeeker.professions": professions,
              "jobSeeker.educationalBackground": educationalBackground,
              "jobSeeker.workingExperience": workingExperience,
              "jobSeeker.employmentType": employmentType,
            },
          },
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
      } else {
        // Logic for updating the employer's profile can be added here
        return handleResponse(
          res,
          400,
          "error",
          "Update operation is not supported for this user role.",
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
  async updateEmployerProfile(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const userId = req.user.id;
      const {
        fullName,
        companyName,
        industry,
        location,
        aboutcompany,
        number,
        email,
      } = req.body;

      if (req.user.role === "Employer") {
        // Update the job seeker's profile
        const updatedUser = await Users.findByIdAndUpdate(
          userId,
          {
            $set: {
              "employer.companyName": companyName,
              "employer.fullName": fullName,
              "employer.industry": industry,
              "employer.aboutcompany": aboutcompany,
              "employer.location": location,
              "employer.contactNumber": number,
              "employer.contactEmail": email,
            },
          },
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
      } else {
        // Logic for updating the employer's profile can be added here
        return handleResponse(
          res,
          400,
          "error",
          "Update operation is not supported for this user role.",
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
  async updateServiceProfile(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const userId = req.user.id;
      const { fullName, gender, location, email } = req.body;

      if (req.user.role === "Service") {
        // Update the job seeker's profile
        const updatedUser = await Users.findByIdAndUpdate(
          userId,
          {
            $set: {
              "service.fullName": fullName,
              "service.gender": gender,
              "service.location": location,
              "service.contactEmail": email,
            },
          },
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
      } else {
        // Logic for updating the employer's profile can be added here
        return handleResponse(
          res,
          400,
          "error",
          "Update operation is not supported for this user role.",
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
}

module.exports = new UserCTRL();
