const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");
const Jobs = require("../models/job_model");
const Quickjobs = require("../models/quickjob_model");
const Company = require("../models/company_model");

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

      const searchedUsers = await Users.find()
        .select("-password -refreshTokens")
        .skip(skip)
        .limit(limit);

      const totalUsers = await Users.countDocuments();

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
      const user = await Users.findById(userId).select(
        "-password -refreshTokens"
      );

      // Check if the user was found
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
                fullName: worker.employer?.fullName || worker.fullName, // Adjust based on your schema
                isAdmin: workerData.isAdmin,
                userId: worker.id,
              };
            }
            return null; // Return null if user is not found
          })
        );

        const filteredWorkers = newWorkers.filter((worker) => worker !== null); // Filter out any null values

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
      console.error("Error in getEmployer function:", error);
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

      const skip = (page - 1) * limit;
      let searchCriteria = {};

      if (fullName) {
        // Remove spaces from the search query and create a regex pattern
        const sanitizedQuery = fullName.replace(/\s+/g, "");
        const regexPattern = sanitizedQuery.split("").join(".*");
        const regex = new RegExp(regexPattern, "i");
        searchCriteria.fullName = { $regex: regex };
      }
      const searchedUsers = await Users.find(searchCriteria)
        .select("-password -refreshTokens")
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Users.countDocuments(searchCriteria);

      // Check if no employers found
      if (searchedUsers.length === 0) {
        return handleResponse(
          res,
          200,
          "success",
          "No employers found with the provided criteria",
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
