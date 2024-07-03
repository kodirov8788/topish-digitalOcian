const Company = require("../models/company_model");
const QuickJobs = require("../models/quickjob_model");
const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");

class QuickJobsCTRL {
  async createQuickjobs(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const user = await Users.findById(req.user.id).select("-password");
      const coins = req.user.coins;
      if (user.role !== "Employer") {
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
        createdBy: user._id,
        hr_avatar: user.avatar,
        hr_name: user.fullName,
      };
      // console.log("user", user)
      const job = await QuickJobs.create(jobDetails);

      await Users.findByIdAndUpdate(req.user.id, { $inc: { coins: -1 } });

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
  async deleteQuickjobs(req, res, next) {
    try {
      // Check if the user is authenticated
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      // Check if the user role is Employer
      const user = await Users.findById(req.user.id).select("-password");

      if (user.role !== "Employer") {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
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
  async getAllQuickjobs(req, res) {
    try {
      const {
        recommended,
        jobTitle,
        location,
        page = 1,
        limit = 10,
        sort,
        recentJob, // Added recentJob parameter
      } = req.query;

      let queryObject = {};
      let query = QuickJobs.find();

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

      // Handle recentJob filter
      if (recentJob) {
        const recentDate = new Date(recentJob); // Use recentJob as the starting date
        queryObject.createdAt = { $gte: recentDate };
      }

      if (Object.keys(queryObject).length > 0) {
        query = query.find(queryObject);

        // Pagination
        const skip = (page - 1) * parseInt(limit);
        query = query.skip(skip).limit(parseInt(limit));

        // Sort
        if (sort) {
          const sortList = sort.split(",").join(" ");
          query = query.sort(sortList);
        } else {
          query = query.sort("-createdAt");
        }
      } else {
        // Random job retrieval when no filters are applied
        const count = await QuickJobs.countDocuments();
        const random = Math.floor(Math.random() * count);
        query = QuickJobs.find().skip(random).limit(parseInt(limit));
      }

      const searchedJob = await query;

      if (searchedJob.length === 0) {
        return handleResponse(res, 200, "success", "No jobs found", [], 0);
      }

      const userIds = searchedJob.map((job) => job.createdBy);
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
      const user = await Users.findById(req.user.id).select("-password");

      if (user.role !== "Employer") {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
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
  async getSingleQuickjob(req, res) {
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
            ? NewUser.fullName
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
  async updateQuickjobs(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const user = await Users.findById(req.user.id).select("-password");

      if (user.role !== "Employer") {
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
}

module.exports = new QuickJobsCTRL();
