// src/controllers/quickjobsCTRL.js
const Company = require("../models/company_model");
const QuickJobs = require("../models/quickjob_model");
// const TelegramChannel = require("../models/telegram_channel_modal");
const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");
// const { sendTelegramChannels } = require("../utils/sendingTelegram");

class QuickJobsCTRL {
  async createQuickJobs(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );
      const coins = req.user.coins;

      // delete after testing
      // if (user.role !== "Employer") {
      //   return handleResponse(res, 403, "error", "You are not allowed!", null, 0);
      // }
      //----------------------------------------------
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

      // console.log("companies: ", companies);
      const jobDetails = {
        ...req.body,
        createdBy: user._id,
        hr_avatar: user.avatar,
        hr_name: user.fullName,
      };

      const job = await QuickJobs.create(jobDetails);

      await Users.findByIdAndUpdate(req.user.id, { $inc: { coins: -5 } });

      // const telegramChannel = await TelegramChannel.find({ createdBy: user._id })
      // Send message to Telegram channels
      // await sendTelegramChannels(user.telegram, telegramChannel, jobDetails);

      return handleResponse(
        res,
        201,
        "success",
        "Quick Job created successfully",
        job,
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
  async deleteQuickJobs(req, res, next) {
    try {
      // Check if the user is authenticated
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { id: jobID } = req.params;
      // Perform the deletion operation
      const deleteJob = await QuickJobs.findOneAndDelete({
        _id: jobID,
        createdBy: req.user.id, // Ensure that the job can only be deleted by its creator
      });

      // If the job doesn't exist or wasn't deleted
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

      // If deletion was successful
      return handleResponse(
        res,
        200,
        "success",
        "Job deleted successfully",
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
  async getAllQuickJobs(req, res) {
    try {
      const {
        recommended,
        jobTitle,
        location,
        page = 1,
        limit = 10,
        sort,
        recentJob,
      } = req.query;

      let queryObject = {};

      if (recommended) {
        queryObject.recommended = recommended === "true";
      }

      if (jobTitle) {
        if (jobTitle.trim() === "") {
          return handleResponse(
            res,
            400,
            "error",
            "Title cannot be empty",
            [],
            0
          );
        } else {
          queryObject.title = { $regex: jobTitle, $options: "i" };
        }
      }

      // Improved location search
      if (location && location.trim() !== "") {
        const cleanLocation = location.trim().toLowerCase();

        // Create a more flexible location search pattern
        // This will match if any part of the location (separated by commas, spaces)
        // contains the search term
        const locationParts = cleanLocation.split(/[\s,]+/).filter(Boolean);

        if (locationParts.length > 0) {
          // Create a regex pattern that matches any of the location parts
          // with word boundaries to avoid partial word matches
          const locationRegexParts = locationParts.map(
            (part) => `(?:^|[\\s,])${part}(?:$|[\\s,])`
          );

          queryObject.location = {
            $regex: new RegExp(locationRegexParts.join("|"), "i"),
          };
        }
      }

      // Handle recentJob filter as a boolean
      if (recentJob === "true") {
        const daysAgo = new Date(new Date().setDate(new Date().getDate() - 7));
        queryObject.createdAt = { $gte: daysAgo };
      }

      // Add status filter (uncomment if needed)
      // queryObject.postingStatus = "Approved";

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit, 10);

      let query = QuickJobs.find(queryObject)
        .skip(skip)
        .limit(parseInt(limit, 10))
        .sort(sort ? sort.split(",").join(" ") : "-createdAt");

      const searchedJob = await query;

      if (searchedJob.length === 0) {
        return handleResponse(res, 200, "success", "No jobs found", [], 0);
      }

      const userIds = searchedJob.map((job) => job.createdBy);

      // Get all users in one query
      const users = await Users.find({ _id: { $in: userIds } }).select(
        "-password -refreshTokens"
      );

      // Create user lookup map
      const userMap = users.reduce((acc, user) => {
        acc[user._id.toString()] = user;
        return acc;
      }, {});

      // Get all companies in one query
      const companies = await Company.find({
        "workers.userId": { $in: userIds },
      });

      // Create company lookup map
      const companyMap = companies.reduce((acc, company) => {
        company.workers.forEach((worker) => {
          const workerId = worker.userId.toString();
          acc[workerId] = {
            name: company.name,
            logo: company.logo,
          };
        });
        return acc;
      }, {});

      // Process job results
      let NewSearchedJob = searchedJob.map((job) => {
        const jobCreatorId = job.createdBy.toString();
        const user = userMap[jobCreatorId];

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
            issuedBy: companyMap[jobCreatorId] || null,
          };
        }
      });

      // If location search was performed, prioritize exact matches
      if (location && location.trim() !== "") {
        NewSearchedJob.sort((a, b) => {
          const aLocation = (a.location || "").toLowerCase();
          const bLocation = (b.location || "").toLowerCase();
          const searchLoc = location.toLowerCase();

          // Exact matches first
          const aExact = aLocation === searchLoc;
          const bExact = bLocation === searchLoc;

          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;

          // Then starts with matches
          const aStartsWith = aLocation.startsWith(searchLoc);
          const bStartsWith = bLocation.startsWith(searchLoc);

          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;

          return 0;
        });
      }

      const totalJobs = await QuickJobs.countDocuments(queryObject);
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
        searchedJob.length,
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
  async getEmployerPosts(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const page = parseInt(req.query.page) || 1; // Default to first page if not specified
      const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items if not specified
      const skip = (page - 1) * limit;

      const allJobs = await QuickJobs.find({ createdBy: req.user.id })
        .sort("-createdAt")
        .skip(skip)
        .limit(limit);

      const totalJobs = await QuickJobs.countDocuments({
        createdBy: req.user.id,
      });

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
      // console.log("req.user.avatar", req.user)

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
  async getSingleQuickJob(req, res) {
    try {
      // if (!req.user) {
      //     return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
      // }
      const { id: jobID } = req.params; // Simplified destructuring for readability

      // Check if jobID is a valid ObjectId
      if (!jobID) {
        return handleResponse(
          res,
          400,
          "error",
          "Invalid job ID format",
          null,
          0
        );
      }

      const singleJob = await QuickJobs.findOne({ _id: jobID });

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
  async updateQuickJobs(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const {
        params: { id: jobID },
      } = req;
      const updatedJob = await QuickJobs.findOneAndUpdate(
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
      let NewSearchedJob = {
        ...updatedJob.toObject(), // Convert Mongoose document to plain object
        hr_name: req.user.employer ? req.user.fullName : "", // Use req.user data
        hr_avatar: req.user.avatar, // Assuming req.user.avatar exists
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
  async getAllQuickJobsForAdmin(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }

    const user = await Users.findById(req.user.id).select(
      "-password -refreshTokens"
    );

    if (user.role !== "Admin") {
      return handleResponse(res, 403, "error", "You are not allowed!", null, 0);
    }
    try {
      const {
        recommended,
        jobTitle,
        location,
        page = 1,
        limit = 10,
        sort,
        recentJob, // Added recentJob parameter as boolean
      } = req.query;

      let queryObject = {};

      if (recommended) {
        queryObject.recommended = recommended === "true";
      }

      if (jobTitle) {
        if (jobTitle.trim() === "") {
          return handleResponse(
            res,
            400,
            "error",
            "Title cannot be empty",
            [],
            0
          );
        } else {
          queryObject.title = { $regex: jobTitle, $options: "i" };
        }
      }

      if (location) {
        queryObject.location = { $regex: location, $options: "i" };
      }

      // Handle recentJob filter as a boolean
      if (recentJob === "true") {
        const daysAgo = new Date(new Date().setDate(new Date().getDate() - 7));
        queryObject.createdAt = { $gte: daysAgo };
      }

      // Pagination
      const skip = (page - 1) * parseInt(limit, 10);

      let query = QuickJobs.find(queryObject)
        .skip(skip)
        .limit(parseInt(limit, 10))
        .sort(sort ? sort.split(",").join(" ") : "-createdAt");

      const searchedJob = await query;

      if (searchedJob.length === 0) {
        return handleResponse(res, 200, "success", "No jobs found", [], 0);
      }

      const userIds = searchedJob.map((job) => job.createdBy);
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

      let NewSearchedJob = searchedJob.map((job) => {
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

      const totalJobs = await QuickJobs.countDocuments(queryObject);
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
        searchedJob.length,
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
  async approveOrRejectJob(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findById(req.user.id).select(
        "-password -refreshTokens"
      );

      if (user.role !== "Admin") {
        return handleResponse(
          res,
          403,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }

      const { id: jobID } = req.params;
      const { status } = req.body;

      if (!status) {
        return handleResponse(res, 400, "error", "Status is required", null, 0);
      }

      if (status !== "Approved" && status !== "Rejected") {
        return handleResponse(res, 400, "error", "Invalid status", null, 0);
      }

      const updatedJob = await QuickJobs.findOneAndUpdate(
        { _id: jobID },
        { postingStatus: status },
        { new: true }
      );

      const jobMaker = await Users.findById(updatedJob.createdBy);
      console.log("jobMaker", jobMaker);
      // const telegramChannel = await TelegramChannel.find({ createdBy: jobMaker._id })
      if (updatedJob.postingStatus === "Approved") {
        // await sendTelegramChannels(jobMaker.telegram, telegramChannel, updatedJob);
      }

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
  // make function to add Approved status to all jobs in the database
  async approveAllJobs(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      // const user = await Users.findById(req.user.id)

      // if (user.role !== "Admin") {
      //   return handleResponse(res, 403, "error", "You are not allowed!", null, 0);
      // }

      const updatedJob = await QuickJobs.updateMany(
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

      // const user = await Users.findById(req.user.id).select( "-password -refreshTokens");

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

      // Pagination
      const skip = (page - 1) * parseInt(limit, 10);

      queryObject.postingStatus = "Rejected";

      let query = QuickJobs.find(queryObject)
        .skip(skip)
        .limit(parseInt(limit, 10));

      const searchedJob = await query;

      if (searchedJob.length === 0) {
        return handleResponse(res, 200, "success", "No jobs found", [], 0);
      }

      const userIds = searchedJob.map((job) => job.createdBy);
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

      let NewSearchedJob = searchedJob.map((job) => {
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

      const totalJobs = await QuickJobs.countDocuments(queryObject);
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
        searchedJob.length,
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

  async getPendingJobs(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      // const user = await Users.findById(req.user.id).select(
      // "-password -refreshTokens"
      // );

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

      // Pagination
      const skip = (page - 1) * parseInt(limit, 10);

      queryObject.postingStatus = "Pending";

      let query = QuickJobs.find(queryObject)
        .skip(skip)
        .limit(parseInt(limit, 10));

      const searchedJob = await query;

      if (searchedJob.length === 0) {
        return handleResponse(res, 200, "success", "No jobs found", [], 0);
      }

      const userIds = searchedJob.map((job) => job.createdBy);
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

      let NewSearchedJob = searchedJob.map((job) => {
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

      const totalJobs = await QuickJobs.countDocuments(queryObject);
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
        searchedJob.length,
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
  async getApprovedJobs(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      // const user = await Users.findById(req.user.id).select(
      // "-password -refreshTokens"
      // );

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

      // Pagination
      const skip = (page - 1) * parseInt(limit, 10);

      queryObject.postingStatus = "Approved";

      let query = QuickJobs.find(queryObject)
        .skip(skip)
        .limit(parseInt(limit, 10));

      const searchedJob = await query;

      if (searchedJob.length === 0) {
        return handleResponse(res, 200, "success", "No jobs found", [], 0);
      }

      const userIds = searchedJob.map((job) => job.createdBy);
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

      let NewSearchedJob = searchedJob.map((job) => {
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

      const totalJobs = await QuickJobs.countDocuments(queryObject);
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
        searchedJob.length,
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
}

module.exports = new QuickJobsCTRL();
