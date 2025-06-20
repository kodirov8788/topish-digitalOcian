// src/controllers/jobsCTRL.js
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
      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );
      const coins = req.user.coins;

      if (coins < 5) {
        return handleResponse(res, 400, "error", "Not enough coins.", null, 0);
      }

      // Check if the user has a company
      const companies = await Company.find({
        "workers.userId": { $in: user._id },
      });

      if (companies.length === 0) {
        return handleResponse(
          res,
          400,
          "error",
          "You must have a company to post a job.",
          null,
          0
        );
      }

      const jobDetails = {
        ...req.body,
        createdBy: user._id,
        hr_avatar: user.avatar,
        hr_name: user.fullName,
      };

      const job = await Jobs.create(jobDetails);

      await Users.findByIdAndUpdate(user._id, { $inc: { coins: -1 } });

      return handleResponse(
        res,
        201,
        "success",
        "Job created successfully",
        job,
        1
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }
  async deleteJobs(req, res, next) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      // const user = await Users.findById(req.user.id).select("-password -refreshTokens");

      // if (user.role !== "Employer") {
      //   return handleResponse(
      //     res,
      //     401,
      //     "error",
      //     "You are not allowed!",
      //     null,
      //     0
      //   );
      // }

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
      const { jobTitle, page = 1, limit = 10 } = req.query;
      let queryObject;
      if (!jobTitle || !jobTitle.trim()) {
        queryObject = {};
      } else {
        queryObject = {
          jobTitle: { $regex: jobTitle, $options: "i" },
        };
      }
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
      // queryObject.postingStatus = "Approved";
      // Total count for pagination metadata
      const totalJobs = await Jobs.countDocuments(queryObject);
      const totalQuickJobs = await QuickJob.countDocuments(queryObject);
      const totalDocuments = totalJobs + totalQuickJobs;

      if (combinedResults.length === 0) {
        return handleResponse(res, 200, "error", "No jobs found", [], 0);
      }

      // Fetch user details for createdBy in bulk
      const userIds = combinedResults.map((job) => job.createdBy);
      const users = await Users.find({ _id: { $in: userIds } }).select(
        "-password -refreshTokens"
      );
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

      let NewSearchedJob = combinedResults.map((job) => {
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
            hr_name: user.employer ? user.fullName : "No employer name", // Check if employer exists
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
        // queryObject.jobType = { $in: jobType.split(",") };

        queryObject = { jobType: { $regex: jobType, $options: "i" } };
      }

      if (location) {
        queryObject.location = { $regex: location, $options: "i" };
      }

      // queryObject.postingStatus = "Approved";
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
      const users = await Users.find({ _id: { $in: userIds } }).select(
        "-password -refreshTokens"
      );
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
            hr_name: user.employer ? user.fullName : "No employer name", // Check if employer exists
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
      // const user = await Users.findOne({ _id: req.user.id }).select("-password -refreshTokens");
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
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
          hr_name: req.user.fullName, // Directly use req.user information
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

      let NewUser = await Users.findOne({ _id: singleJob.createdBy }).select(
        "-password -refreshTokens"
      );
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
          hr_name: NewUser.employer ? NewUser.fullName : "No employer name", // Check if employer exists
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
      // const user = await Users.findOne({ _id: req.user.id }).select("-password -refreshTokens");
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      //  if (user.role !== "Employer") {
      //   return handleResponse(
      //     res,
      //     401,
      //     "error",
      //     "You are not allowed!",
      //     null,
      //     0
      //   );
      // }

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

      let NewUser = await Users.findOne({ _id: updatedJob.createdBy }).select(
        "-password -refreshTokens"
      );

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
        hr_name: NewUser.employer ? NewUser.fullName : "", // Check for null and provide default value
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
      // queryObject.postingStatus = "Approved";
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
      const users = await Users.find({ _id: { $in: userIds } }).select(
        "-password -refreshTokens"
      );
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
            hr_name: user.employer ? user.fullName : "No employer name", // Check if employer exists
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
      const { recommended = "true", page = 1, limit = 10 } = req.query;
      let queryObject = {};
      if (recommended === "true") {
        queryObject.recommended = true;
      }

      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      // queryObject.postingStatus = "Approved";
      let resultJobs = await Jobs.find(queryObject)
        .skip(skip)
        .limit(parseInt(limit, 10))
        .sort("-createdAt");
      const totalJobs = await Jobs.countDocuments(queryObject);

      if (resultJobs.length === 0) {
        return handleResponse(res, 200, "success", "No jobs found", [], 0);
      }

      // Fetching user details for the 'createdBy' field
      const userIds = resultJobs.map((job) => job.createdBy);
      const users = await Users.find({ _id: { $in: userIds } }).select(
        "-password -refreshTokens"
      );
      const userMap = users.reduce((acc, user) => {
        acc[user._id.toString()] = user;
        return acc;
      }, {});

      // Fetching company details
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
        const user = userMap[job.createdBy.toString()];
        if (!user) {
          return {
            ...job._doc,
            hr_name: "deleted user",
            hr_avatar: "default_avatar.png",
            issuedBy: null,
          };
        } else {
          return {
            ...job._doc,
            hr_name: user.employer ? user.fullName : "No employer name",
            hr_avatar: user.avatar || "default_avatar.png",
            issuedBy: companyMap[job.createdBy.toString()] || null,
          };
        }
      });

      // Prepare pagination data
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
        NewSearchedJobs,
        NewSearchedJobs.length,
        pagination
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }
  async searchByJobType(req, res) {
    try {
      const { jobType, page = 1, limit = 10 } = req.query;
      let queryObject;
      if (!jobType || !jobType.trim()) {
        queryObject = {};
        // return handleResponse(res, 400, "error", "Job type is required", [], 0);
      } else {
        queryObject = { jobType: { $regex: jobType, $options: "i" } };
      }

      // queryObject.postingStatus = "Approved";

      const resultJobs = await Jobs.find(queryObject)
        .skip((parseInt(page, 10) - 1) * parseInt(limit, 10))
        .limit(parseInt(limit, 10))
        .sort("-createdAt");

      const totalJobs = await Jobs.countDocuments(queryObject);

      if (resultJobs.length === 0) {
        return handleResponse(res, 200, "success", "No jobs found", [], 0);
      }

      const userIds = resultJobs.map((job) => job.createdBy);
      const users = await Users.find({ _id: { $in: userIds } }).select(
        "-password -refreshTokens"
      );
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
        const user = userMap[job.createdBy.toString()];
        if (!user) {
          return {
            ...job._doc,
            hr_name: "deleted user",
            hr_avatar: "default_avatar.png",
            issuedBy: null,
          };
        } else {
          return {
            ...job._doc,
            hr_name: user.employer ? user.fullName : "No employer name",
            hr_avatar: user.avatar || "default_avatar.png",
            issuedBy: companyMap[job.createdBy.toString()] || null,
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
        NewSearchedJobs,
        NewSearchedJobs.length,
        pagination
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }
  async getAllJobsForAdmin(req, res) {
    try {
      // const user = await Users.findOne({ _id: req.user.id });
      // if (user.role !== "Employer" && user.role !== "Admin") {
      //   return handleResponse(
      //     res,
      //     403,
      //     "error",
      //     "You are not allowed!",
      //     null,
      //     0
      //   );
      // }

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
        // queryObject.jobType = { $in: jobType.split(",") };

        queryObject = { jobType: { $regex: jobType, $options: "i" } };
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
      const users = await Users.find({ _id: { $in: userIds } }).select(
        "-password -refreshTokens"
      );
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
            hr_name: user.employer ? user.fullName : "No employer name", // Check if employer exists
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
  async approveOrRejectJob(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      // const user = await Users.findOne({ _id: req.user.id });
      // if (user.role !== "Employer" && user.role !== "Admin") {
      //   return handleResponse(
      //     res,
      //     403,
      //     "error",
      //     "You are not allowed!",
      //     null,
      //     0
      //   );
      // }

      const {
        params: { id: jobID },
      } = req;

      const job = await Jobs.findOne({ _id: jobID });

      if (!job) {
        return handleResponse(
          res,
          404,
          "error",
          `Job not found with ID: ${jobID}`,
          null,
          0
        );
      }
      const status = req.body.postingStatus;

      if (status === "Approved" || status === "Rejected") {
        return handleResponse(res, 400, "error", "Invalid status", null, 0);
      }

      const updatedJob = await Jobs.findOneAndUpdate(
        { _id: jobID },
        { postingStatus: status },
        { new: true }
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
      return handleResponse(
        res,
        200,
        "success",
        `Job ${status} successfully`,
        updatedJob,
        1
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }
  async approveAllJobs(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      // const user = await Users.findById(req.user.id).select("-password -refreshTokens")

      // if (user.role !== "Admin") {
      //   return handleResponse(res, 403, "error", "You are not allowed!", null, 0);
      // }

      const updatedJob = await Jobs.updateMany(
        {},
        { postingStatus: "Approved" }
      );

      if (!updatedJob) {
        return handleResponse(res, 404, "error", "No jobs found", null, 0);
      }
      return handleResponse(
        res,
        200,
        "success",
        "All jobs Approved successfully",
        updatedJob,
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
  async getRejectedJobs(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      // const user = await Users.findOne({ _id: req.user.id });
      // if (user.role !== "Employer" && user.role !== "Admin") {
      //   return handleResponse(
      //     res,
      //     403,
      //     "error",
      //     "You are not allowed!",
      //     null,
      //     0
      //   );
      // }

      const { page = 1, limit = 10 } = req.query;

      let queryObject = {};

      queryObject.postingStatus = "Rejected";

      let resultJobs = await Jobs.find(queryObject)
        .skip((parseInt(page, 10) - 1) * parseInt(limit, 10))
        .limit(parseInt(limit, 10));

      const totalJobs = await Jobs.countDocuments(queryObject);

      if (resultJobs.length === 0) {
        return handleResponse(res, 200, "success", "No jobs found", [], 0);
      }

      // Fetch user details for createdBy in bulk to minimize database queries
      const userIds = resultJobs.map((job) => job.createdBy);
      const users = await Users.find({ _id: { $in: userIds } }).select(
        "-password -refreshTokens"
      );
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
            hr_name: user.employer ? user.fullName : "No employer name", // Check if employer exists
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
  async getPendingJobs(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      // const user = await Users.findOne({ _id: req.user.id });
      // if (user.role !== "Employer" && user.role !== "Admin") {
      //   return handleResponse(
      //     res,
      //     403,
      //     "error",
      //     "You are not allowed!",
      //     null,
      //     0
      //   );
      // }

      const { page = 1, limit = 10 } = req.query;

      let queryObject = {};

      queryObject.postingStatus = "Pending";

      let resultJobs = await Jobs.find(queryObject)
        .skip((parseInt(page, 10) - 1) * parseInt(limit, 10))
        .limit(parseInt(limit, 10));

      const totalJobs = await Jobs.countDocuments(queryObject);

      if (resultJobs.length === 0) {
        return handleResponse(res, 200, "success", "No jobs found", [], 0);
      }

      // Fetch user details for createdBy in bulk to minimize database queries
      const userIds = resultJobs.map((job) => job.createdBy);
      const users = await Users.find({ _id: { $in: userIds } }).select(
        "-password -refreshTokens"
      );
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
            hr_name: user.employer ? user.fullName : "No employer name", // Check if employer exists
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
  async getApprovedJobs(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      // const user = await Users.findOne({ _id: req.user.id });
      // if (user.role !== "Employer" && user.role !== "Admin") {
      //   return handleResponse(
      //     res,
      //     403,
      //     "error",
      //     "You are not allowed!",
      //     null,
      //     0
      //   );
      // }

      const { page = 1, limit = 10 } = req.query;

      let queryObject = {};

      queryObject.postingStatus = "Approved";

      let resultJobs = await Jobs.find(queryObject)
        .skip((parseInt(page, 10) - 1) * parseInt(limit, 10))
        .limit(parseInt(limit, 10));

      const totalJobs = await Jobs.countDocuments(queryObject);

      if (resultJobs.length === 0) {
        return handleResponse(res, 200, "success", "No jobs found", [], 0);
      }

      // Fetch user details for createdBy in bulk to minimize database queries
      const userIds = resultJobs.map((job) => job.createdBy);
      const users = await Users.find({ _id: { $in: userIds } }).select(
        "-password -refreshTokens"
      );
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
            hr_name: user.employer ? user.fullName : "No employer name", // Check if employer exists
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
  async getAppliedCompaniesCount(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      // Fetch all jobs where the current user has applied
      const appliedJobs = await Jobs.find({ appliedBy: req.user.id }).select(
        "companyId"
      );

      // Create a set to store unique company IDs
      const uniqueCompanyIds = new Set(appliedJobs.map((job) => job.companyId));

      // Get the count of unique companies
      const appliedCompaniesCount = uniqueCompanyIds.size;

      return handleResponse(
        res,
        200,
        "success",
        "Applied companies count fetched successfully",
        { appliedCompaniesCount },
        appliedCompaniesCount
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }
  async getAppliedJobs(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Find all jobs the user has applied to, with pagination
      const appliedJobs = await Jobs.find({ applicants: req.user.id })
        .skip(skip)
        .limit(parseInt(limit))
        .sort("-createdAt");
      console.log("appliedJobs: ", appliedJobs);
      // Get the total count of applied jobs for pagination purposes
      const totalAppliedJobs = await Jobs.countDocuments({
        appliedBy: req.user.id,
      });

      if (appliedJobs.length === 0) {
        return handleResponse(
          res,
          200,
          "success",
          "No applied jobs found",
          [],
          0
        );
      }

      // Fetch user and company details associated with each job
      const userIds = appliedJobs.map((job) => job.createdBy);
      const users = await Users.find({ _id: { $in: userIds } }).select(
        "-password -refreshTokens"
      );
      const userMap = users.reduce((acc, user) => {
        acc[user._id.toString()] = user;
        return acc;
      }, {});

      // Fetch companies where users have applied to jobs
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

      // Format the jobs with HR and company details
      const formattedAppliedJobs = appliedJobs.map((job) => {
        const user = userMap[job.createdBy.toString()];
        return {
          ...job._doc,
          hr_name: user ? user.fullName : "deleted user",
          hr_avatar: user ? user.avatar : "default_avatar.png",
          issuedBy: companyMap[job.createdBy.toString()] || null,
        };
      });

      // Pagination details
      const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalAppliedJobs / parseInt(limit)),
        limit: parseInt(limit),
        totalDocuments: totalAppliedJobs,
      };

      // Include total applied jobs count in response
      return handleResponse(
        res,
        200,
        "success",
        "Applied jobs retrieved successfully",
        {
          appliedJobs: formattedAppliedJobs,
          totalAppliedJobs,
          pagination,
        },
        formattedAppliedJobs.length
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }
}

module.exports = new JobsCTRL();
