const Jobs = require("../models/job_model");
const Users = require("../models/user_model");
const QuickJob = require("../models/quickjob_model");
const { handleResponse } = require("../utils/handleResponse");
const Company = require("../models/company_model");

class JobsCTRL {
  async createJobs(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const coins = req.user.coins;
      if (req.user.role !== "Employer") {
        return handleResponse(
          res,
          403,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }

      if (coins == null) {
        return handleResponse(
          res,
          400,
          "error",
          "There are some problems with your coins. Please contact support.",
          null,
          0
        );
      }

      if (coins < 5) {
        return handleResponse(res, 400, "error", "Not enough coins.", null, 0);
      }
      const userId = req.user.id;
      const user = await Users.findOne({ _id: userId });
      if (!user || !user.employer) {
        return handleResponse(
          res,
          400,
          "error",
          "Employer details not found.",
          null,
          0
        );
      }
      const jobDetails = {
        ...req.body,
        createdBy: user.id,
        hr_avatar: user.avatar,
        hr_name: user.fullName,
      };

      const job = await Jobs.create(jobDetails);

      await Users.findByIdAndUpdate(userId, { $inc: { coins: -1 } });

      return handleResponse(
        res,
        201,
        "success",
        "Job created successfully",
        job,
        1
      );
    } catch (error) {
      // console.error("Error in createJobs function:", error);
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }
  async deleteJobs(req, res, next) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      } else if (req.user.role !== "Employer") {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }

      const {
        params: { id: jobID },
      } = req;

      const deleteJob = await Jobs.findByIdAndDelete({
        _id: jobID,
        createdBy: req.user.id,
      });
      if (!deleteJob) {
        return handleResponse(
          res,
          404,
          "error",
          `Job with id: ${jobID} not found`,
          null,
          0
        );
      }

      return handleResponse(
        res,
        200,
        "success",
        "Job deleted successfully",
        null,
        1
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }
  async getSearchTitle(req, res) {
    try {
      // if (!req.user) {
      //   return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      // }

      const { jobTitle, page = 1, limit = 10 } = req.query;
      if (!jobTitle.trim()) {
        return handleResponse(
          res,
          200,
          "error",
          "Job title is required",
          [],
          0
        );
      }

      let queryObject = {
        jobTitle: { $regex: jobTitle.trim(), $options: "i" },
      };

      // Execute queries on both collections
      const jobsPromise = Jobs.find(queryObject)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      const quickJobsPromise = QuickJob.find(queryObject)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const [searchedJobs, searchedQuickJobs] = await Promise.all([
        jobsPromise,
        quickJobsPromise,
      ]);
      const combinedResults = [...searchedJobs, ...searchedQuickJobs];

      // Total count for pagination metadata
      const totalJobs = await Jobs.countDocuments(queryObject);
      const totalQuickJobs = await QuickJob.countDocuments(queryObject);
      const totalDocuments = totalJobs + totalQuickJobs;

      if (combinedResults.length === 0) {
        return handleResponse(res, 200, "error", "No jobs found", [], 0);
      }

      // Fetch user details for createdBy in bulk
      const userIds = combinedResults.map((job) => job.createdBy);
      const users = await Users.find({ _id: { $in: userIds } });
      const userMap = users.reduce((acc, user) => {
        acc[user._id.toString()] = user;
        return acc;
      }, {});

      // Fetch companies with workers matching the user IDs
      const companies = await Company.find({
        "workers.userId": { $in: userIds },
      });
      const companyMap = companies.reduce((acc, company) => {
        company.workers.forEach((worker) => {
          acc[worker.userId.toString()] = {
            name: company.name,
            logo: company.logo,
          };
        });
        return acc;
      }, {});

      let NewSearchedJob = resultJobs.map((job) => {
        const user = userMap[job.createdBy.toString()]; // Get the user based on job's createdBy field
        if (!user) {
          return {
            ...job._doc, // Assuming you're using Mongoose and want to spread the job document
            hr_name: "deleted user", // Fallback if user is not found
            hr_avatar: "default_avatar.png", // Fallback avatar image path
            issuedBy: null, // Fallback to null if company not found
          };
        } else {
          return {
            ...job._doc,
            hr_name: user.employer
              ? user.employer.fullName
              : "No employer name", // Check if employer exists
            hr_avatar: user.avatar || "default_avatar.png", // Use default avatar if none is provided
            issuedBy: companyMap[job.createdBy.toString()] || null, // Get company details if available
          };
        }
      });

      const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalDocuments / limit),
        limit: parseInt(limit),
        totalDocuments: totalDocuments,
      };

      return handleResponse(
        res,
        200,
        "success",
        "Jobs retrieved successfully",
        NewSearchedJob,
        NewSearchedJob.length,
        pagination
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }
  async getAllJobs(req, res) {
    try {
      const {
        education,
        experience,
        workingtype,
        recommended,
        salary,
        jobTitle,
        sort,
        location,
        recentjob,
        numericFilters,
        jobType,
        page = 1,
        limit = 10,
      } = req.query;

      let queryObject = {};

      if (recommended === "true") {
        queryObject.recommended = true;
      }

      if (experience) {
        queryObject.experienceRequired = experience;
      }

      if (salary) {
        queryObject.salaryRange = salary;
      }
      // console.log("salary: ", salary);

      if (workingtype) {
        queryObject.workingType = workingtype; // Fixed field to workingType
      }

      if (jobTitle) {
        queryObject.jobTitle =
          jobTitle.trim() === "" ? {} : { $regex: jobTitle, $options: "i" };
      }

      if (recentjob === "true") {
        const daysAgo = new Date(new Date().setDate(new Date().getDate() - 7));
        queryObject.createdAt = { $gte: daysAgo };
      }

      if (numericFilters) {
        const operatorMap = {
          ">": "$gt",
          ">=": "$gte",
          "=": "$eq",
          "<": "$lt",
          "<=": "$lte",
        };
        let filters = numericFilters.replace(
          /\b(<|>|>=|=|<|<=)\b/g,
          (match) => `-${operatorMap[match]}-`
        );
        filters.split(",").forEach((item) => {
          const [field, operator, value] = item.split("-");
          if (queryObject[field]) {
            queryObject[field] = {
              ...queryObject[field],
              [operator]: Number(value),
            };
          } else {
            queryObject[field] = { [operator]: Number(value) };
          }
        });
      }

      if (education) {
        queryObject.educationLevel = { $in: education.split(",") };
      }

      if (jobType) {
        queryObject.jobType = { $in: jobType.split(",") };
      }

      if (location) {
        queryObject.location = { $regex: location, $options: "i" };
      }
      let resultJobs = await Jobs.find(queryObject)
        .skip((parseInt(page, 10) - 1) * parseInt(limit, 10))
        .limit(parseInt(limit, 10))
        .sort(sort ? sort.split(",").join(" ") : "-createdAt");

      const totalJobs = await Jobs.countDocuments(queryObject);

      if (resultJobs.length === 0) {
        return handleResponse(res, 200, "success", "No jobs found", [], 0);
      }

      // Fetch user details for createdBy in bulk to minimize database queries
      const userIds = resultJobs.map((job) => job.createdBy);
      const users = await Users.find({ _id: { $in: userIds } });
      const userMap = users.reduce((acc, user) => {
        acc[user._id.toString()] = user;
        return acc;
      }, {});

      // Fetch companies with workers matching the user IDs
      const companies = await Company.find({
        "workers.userId": { $in: userIds },
      });
      const companyMap = companies.reduce((acc, company) => {
        company.workers.forEach((worker) => {
          acc[worker.userId.toString()] = {
            name: company.name,
            logo: company.logo,
          };
        });
        return acc;
      }, {});

      let NewSearchedJob = resultJobs.map((job) => {
        const user = userMap[job.createdBy.toString()]; // Get the user based on job's createdBy field
        if (!user) {
          return {
            ...job._doc, // Assuming you're using Mongoose and want to spread the job document
            hr_name: "deleted user", // Fallback if user is not found
            hr_avatar: "default_avatar.png", // Fallback avatar image path
            issuedBy: null, // Fallback to null if company not found
          };
        } else {
          return {
            ...job._doc,
            hr_name: user.employer
              ? user.employer.fullName
              : "No employer name", // Check if employer exists
            hr_avatar: user.avatar || "default_avatar.png", // Use default avatar if none is provided
            issuedBy: companyMap[job.createdBy.toString()] || null, // Get company details if available
          };
        }
      });

      const pagination = {
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalJobs / parseInt(limit, 10)),
        limit: parseInt(limit, 10),
        totalDocuments: totalJobs,
      };

      return handleResponse(
        res,
        200,
        "success",
        "Jobs retrieved successfully",
        NewSearchedJob,
        NewSearchedJob.length,
        pagination
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }
  async getEmployerPosts(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      } else if (req.user.role !== "Employer") {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }

      const page = parseInt(req.query.page) || 1; // Default to the first page if not specified
      const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items if not specified
      const skip = (page - 1) * limit;

      const allJobs = await Jobs.find({ createdBy: req.user.id })
        .sort("-createdAt")
        .skip(skip)
        .limit(limit);

      const totalJobs = await Jobs.countDocuments({ createdBy: req.user.id });

      // const users = await Jobs.find({ createdBy: req.user.id })
      // console.log("users: ", users)
      if (allJobs.length === 0) {
        return handleResponse(
          res,
          200,
          "success",
          "No employer posts found",
          [],
          0
        );
      }

      // Fetch companies with workers matching the user IDs
      const companies = await Company.find({
        "workers.userId": { $in: req.user.id },
      });
      const companyMap = companies.reduce((acc, company) => {
        company.workers.forEach((worker) => {
          acc[worker.userId.toString()] = {
            name: company.name,
            logo: company.logo,
          };
        });
        return acc;
      }, {});

      let NewSearchedJob = allJobs.map((job) => {
        return {
          ...job._doc, // Assuming you're using Mongoose and want to spread the job document
          hr_name: req.user.employer.fullName, // Directly use req.user information
          hr_avatar: req.user.avatar, // Directly use req.user information
          issuedBy: companyMap[job.createdBy.toString()] || null, // Get company details if available
        };
      });

      // Prepare pagination data
      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(totalJobs / limit),
        limit: limit,
        totalDocuments: totalJobs,
      };

      return handleResponse(
        res,
        200,
        "success",
        "Employer posts retrieved successfully",
        NewSearchedJob,
        allJobs.length,
        pagination
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }
  async getSingleJob(req, res) {
    try {
      // if (!req.user) {
      //   return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      // }

      const { id: jobID } = req.params; // Simplified destructuring
      if (!jobID) {
        return handleResponse(res, 400, "error", "Invalid job ID", null, 0);
      }

      const singleJob = await Jobs.findOne({ _id: jobID });

      if (!singleJob) {
        return handleResponse(
          res,
          404,
          "error",
          `Job not found with ID: ${jobID}`,
          null,
          0
        );
      }

      let NewUser = await Users.findOne({ _id: singleJob.createdBy });
      const companies = await Company.find({
        "workers.userId": { $in: singleJob.createdBy },
      });
      const companyMap = companies.reduce((acc, company) => {
        company.workers.forEach((worker) => {
          acc[worker.userId.toString()] = {
            name: company.name,
            logo: company.logo,
          };
        });
        return acc;
      }, {});

      let NewSearchedJob;

      if (!NewUser) {
        // Provide fallback values when the user (job creator) is not found
        NewSearchedJob = {
          ...singleJob.toObject(), // Convert Mongoose document to plain object
          hr_name: "deleted user", // Fallback if user is not found
          hr_avatar: "default_avatar.png", // Fallback avatar image path
          issuedBy: null, // Fallback to null if company not found
        };
      } else {
        NewSearchedJob = {
          ...singleJob.toObject(), // Convert Mongoose document to plain object
          hr_name: NewUser.employer
            ? NewUser.employer.fullName
            : "No employer name", // Check if employer exists
          hr_avatar: NewUser.avatar || "default_avatar.png", // Use default avatar if none is provided
          issuedBy: companyMap[singleJob.createdBy.toString()] || null, // Get company details if available
        };
      }

      return handleResponse(
        res,
        200,
        "success",
        "Job retrieved successfully",
        NewSearchedJob,
        1
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }
  async updateJobs(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      } else if (req.user.role !== "Employer") {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }

      const {
        params: { id: jobID },
      } = req;

      const updatedJob = await Jobs.findOneAndUpdate(
        { _id: jobID, createdBy: req.user.id },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedJob) {
        return handleResponse(
          res,
          404,
          "error",
          `Job not found with ID: ${jobID}`,
          null,
          0
        );
      }

      let NewUser = await Users.findOne({ _id: updatedJob.createdBy });

      if (!NewUser) {
        // Handle the case where the user (job creator) is not found
        return handleResponse(
          res,
          404,
          "error",
          `User not found for job with ID: ${jobID}`,
          null,
          0
        );
      }

      // Construct NewSearchedJob with user details included
      let NewSearchedJob = {
        ...updatedJob.toObject(), // Convert Mongoose document to plain object
        hr_name: NewUser.employer ? NewUser.employer.fullName : "", // Check for null and provide default value
        hr_avatar: NewUser.avatar,
      };

      return handleResponse(
        res,
        200,
        "success",
        "Job updated successfully",
        NewSearchedJob,
        1
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }
  async getRecentJobs(req, res) {
    try {
      // if (!req.user) {
      //   return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      // }

      const { sort, page = 1, limit = 10, numericFilters, field } = req.query;
      let queryObject = {};

      // Handling Numeric Filters
      if (numericFilters) {
        const operatorMap = {
          ">": "$gt",
          ">=": "$gte",
          "=": "$eq",
          "<": "$lt",
          "<=": "$lte",
        };
        const regEx = /\b(>|>=|=|<|<=)\b/g; // Fixed duplicate '<' in regex
        let filters = numericFilters.replace(
          regEx,
          (match) => `-${operatorMap[match]}-`
        );
        filters.split(",").forEach((item) => {
          const [field, operator, value] = item.split("-");
          queryObject[field] = { [operator]: Number(value) };
        });
      }

      let resultJobs = Jobs.find(queryObject);

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      resultJobs = resultJobs.skip(skip).limit(parseInt(limit));

      // Sort
      if (sort) {
        const sortList = sort.split(",").join(" ");
        resultJobs = resultJobs.sort(sortList);
      } else {
        resultJobs = resultJobs.sort("-createdAt");
      }

      // Fields selection
      if (field) {
        const fieldList = field.split(",").join(" ");
        resultJobs = resultJobs.select(fieldList);
      }

      const searchedJobs = await resultJobs;

      // Total count for pagination metadata
      const totalJobs = await Jobs.countDocuments(queryObject);

      if (searchedJobs.length === 0) {
        return handleResponse(res, 200, "success", "No jobs found", [], 0);
      }

      // Fetching user details for the 'createdBy' field
      const userIds = searchedJobs.map((job) => job.createdBy);
      const users = await Users.find({ _id: { $in: userIds } });
      const userMap = users.reduce((acc, user) => {
        acc[user._id.toString()] = user;
        return acc;
      }, {});

      const companies = await Company.find({
        "workers.userId": { $in: userIds },
      });
      const companyMap = companies.reduce((acc, company) => {
        company.workers.forEach((worker) => {
          acc[worker.userId.toString()] = {
            name: company.name,
            logo: company.logo,
          };
        });
        return acc;
      }, {});

      let NewSearchedJobs = resultJobs.map((job) => {
        const user = userMap[job.createdBy.toString()]; // Get the user based on job's createdBy field
        if (!user) {
          return {
            ...job._doc, // Assuming you're using Mongoose and want to spread the job document
            hr_name: "deleted user", // Fallback if user is not found
            hr_avatar: "default_avatar.png", // Fallback avatar image path
            issuedBy: null, // Fallback to null if company not found
          };
        } else {
          return {
            ...job._doc,
            hr_name: user.employer
              ? user.employer.fullName
              : "No employer name", // Check if employer exists
            hr_avatar: user.avatar || "default_avatar.png", // Use default avatar if none is provided
            issuedBy: companyMap[job.createdBy.toString()] || null, // Get company details if available
          };
        }
      });

      // Prepare pagination data
      const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalJobs / parseInt(limit)),
        limit: parseInt(limit),
        totalDocuments: totalJobs,
      };

      return handleResponse(
        res,
        200,
        "success",
        "Jobs retrieved successfully",
        NewSearchedJobs,
        NewSearchedJobs.length,
        pagination
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }
  async getRecommendedJobs(req, res) {
    try {
      // if (!req.user) {
      //   return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      // }

      const { recommended, page = 1, limit = 10 } = req.query;
      let queryObject = {};

      if (recommended) {
        queryObject.recommended = recommended === "true";
      }
      if (salary) {
        queryObject.salary = salary; // Assuming salary is a simple value for now
      }
      if (title) {
        queryObject.title = { $regex: title, $options: "i" };
      }

      // Numeric Filters
      if (numericFilters) {
        const operatorMap = {
          ">": "$gt",
          ">=": "$gte",
          "=": "$eq",
          "<": "$lt",
          "<=": "$lte",
        };
        const regEx = /\b(<|>|>=|=|<|<=)\b/g;
        let filters = numericFilters.replace(
          regEx,
          (match) => `-${operatorMap[match]}-`
        );
        const options = ["salary"];
        filters.split(",").forEach((item) => {
          const [field, operator, value] = item.split("-");
          if (options.includes(field)) {
            queryObject[field] = { [operator]: Number(value) };
          }
        });
      }

      let resultJobs = Jobs.find(queryObject);

      // Pagination
      const skip = (page - 1) * limit;

      resultJobs = resultJobs.skip(skip).limit(parseInt(limit));

      // Sort
      if (sort) {
        const sortList = sort.split(",").join(" ");
        resultJobs = resultJobs.sort(sortList);
      } else {
        resultJobs = resultJobs.sort("-createdAt");
      }

      // Fields selection
      if (field) {
        const fieldList = field.split(",").join(" ");
        resultJobs = resultJobs.select(fieldList);
      }

      const searchedJobs = await resultJobs;

      // Total count for pagination metadata
      const totalJobs = await Jobs.countDocuments(queryObject);

      if (searchedJob.length === 0) {
        return handleResponse(res, 200, "success", "No jobs found", [], 0);
      }
      // Fetching user details for the 'createdBy' field
      const userIds = searchedJobs.map((job) => job.createdBy);
      const users = await Users.find({ _id: { $in: userIds } });
      const userMap = users.reduce((acc, user) => {
        acc[user._id.toString()] = user;
        return acc;
      }, {});

      const companies = await Company.find({
        "workers.userId": { $in: userIds },
      });
      const companyMap = companies.reduce((acc, company) => {
        company.workers.forEach((worker) => {
          acc[worker.userId.toString()] = {
            name: company.name,
            logo: company.logo,
          };
        });
        return acc;
      }, {});

      let NewSearchedJobs = resultJobs.map((job) => {
        const user = userMap[job.createdBy.toString()]; // Get the user based on job's createdBy field
        if (!user) {
          return {
            ...job._doc, // Assuming you're using Mongoose and want to spread the job document
            hr_name: "deleted user", // Fallback if user is not found
            hr_avatar: "default_avatar.png", // Fallback avatar image path
            issuedBy: null, // Fallback to null if company not found
          };
        } else {
          return {
            ...job._doc,
            hr_name: user.employer
              ? user.employer.fullName
              : "No employer name", // Check if employer exists
            hr_avatar: user.avatar || "default_avatar.png", // Use default avatar if none is provided
            issuedBy: companyMap[job.createdBy.toString()] || null, // Get company details if available
          };
        }
      });

      // Prepare pagination data
      const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalJobs / limit),
        limit: parseInt(limit),
        totalDocuments: totalJobs,
      };

      return handleResponse(
        res,
        200,
        "success",
        "Jobs retrieved successfully",
        NewSearchedJobs,
        NewSearchedJobs.length,
        pagination
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }
}

module.exports = new JobsCTRL();
