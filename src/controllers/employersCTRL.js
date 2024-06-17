const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");
const Jobs = require("../models/job_model");
const Quickjobs = require("../models/quickjob_model");

class EmployersCTRL {
  // it shows all employers
  async getAllEmployers(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
      const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items if not specified
      const skip = (page - 1) * limit;
      // Adjusted to use $in operator for role matching
      const query = {
        role: { $in: ["Employer"] },
      };

      const searchedUsers = await Users.find(query).skip(skip).limit(limit);

      const totalUsers = await Users.countDocuments(query);

      if (searchedUsers.length === 0) {
        return handleResponse(res, 200, "success", "No employers found", [], 0);
      }

      // Prepare pagination data
      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        limit: limit,
        totalDocuments: totalUsers,
      };

      return handleResponse(
        res,
        200,
        "success",
        "Employers retrieved successfully",
        searchedUsers,
        searchedUsers.length,
        pagination
      );
    } catch (error) {
      return handleResponse(
        res,
        error.status || 500,
        "error",
        error.message || "Something went wrong",
        null,
        0
      );
    }
  }
  async getEmployer(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      // Extract the user ID from the request parameters
      const userId = req.params.id;
      // Find the user by ID
      const user = await Users.findById(userId); // Assuming you want to populate the 'resumeId' as in the previous function

      // Check if the user was found
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // User found, return the user data
      return handleResponse(
        res,
        200,
        "success",
        "User retrieved successfully",
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
  async getJobMaker(req, res) {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      // Extract the user ID from the request parameters
      const userId = req.params.id;

      // Fetch jobs and quickjobs created by the user in parallel
      const [Job, Quickjob] = await Promise.all([
        Jobs.find({ createdBy: userId }),
        Quickjobs.find({ createdBy: userId }),
      ]);

      // Check if no jobs were found
      if (Job.length === 0 && Quickjob.length === 0) {
        return handleResponse(res, 200, "success", "No jobs found", [], 0);
      }

      // Respond with the found jobs
      return handleResponse(
        res,
        200,
        "success",
        "Jobs retrieved successfully",
        { Job, Quickjob },
        1
      );
    } catch (error) {
      // Log the error and return an internal server error response
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
  // search by their company
  async searchEmployers(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { fullName, page = 1, limit = 10 } = req.query;

      // Ensure fullName is provided
      if (!fullName) {
        return handleResponse(
          res,
          400,
          "error",
          "Full name is required",
          null,
          0
        );
      }

      // Remove spaces from the search query and create a regex pattern
      const sanitizedQuery = fullName.replace(/\s+/g, "");
      const regexPattern = sanitizedQuery.split("").join(".*");
      const regex = new RegExp(regexPattern, "i");

      const skip = (page - 1) * limit;

      // Log the query parameters for debugging
      console.log(
        `Search Query: ${regexPattern}, Page: ${page}, Limit: ${limit}`
      );

      // Find employers with pagination
      const searchedUsers = await Users.find({
        fullName: { $regex: regex },
      })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Users.countDocuments({
        fullName: { $regex: regex },
      });

      // Check if no employers found
      if (searchedUsers.length === 0) {
        return handleResponse(
          res,
          200,
          "success",
          "No employers found with the provided full name",
          [],
          0
        );
      } else {
        // Prepare pagination data
        const pagination = {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          limit: parseInt(limit),
          totalDocuments: total,
        };

        return handleResponse(
          res,
          200,
          "success",
          "Employers retrieved successfully",
          searchedUsers,
          searchedUsers.length,
          pagination
        );
      }
    } catch (error) {
      console.error(`Error occurred: ${error.message}`);
      return handleResponse(
        res,
        error.status || 500,
        "error",
        error.message || "Something went wrong",
        null,
        0
      );
    }
  }
}

module.exports = new EmployersCTRL();
