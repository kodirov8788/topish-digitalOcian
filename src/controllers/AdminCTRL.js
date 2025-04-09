// src/controllers/AdminCTRL.js
const public_notification_model = require("../models/notifications/public_notification_model");
const save_notźfication = require("../models/notifications/save_notification");
const Users = require("../models/user_model");
const sendNotification = require("../utils/Notification");
const { handleResponse } = require("../utils/handleResponse");
const Jobs = require("../models/job_model");
const QuickJobs = require("../models/quickjob_model");
const Offices = require("../models/office_model");

class AdminCTRL {
  async getUsersForAdmin(req, res) {
    // Ensure the request is from a logged-in user
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }

    // Check if the user has the 'admin' role
    if (req.user.role !== "Admin") {
      return handleResponse(
        res,
        403,
        "error",
        "You are not authorized to perform this action.",
        null,
        0
      );
    }

    try {
      // Pagination parameters
      // console.log("req.query:", req.query)
      const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
      const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items if not specified
      const skip = (page - 1) * limit; // Calculate the number of documents to skip

      // Fetch users with pagination
      const users = await Users.find()
        .select("-password -refreshTokens")
        .skip(skip) // Skip the documents for the current page
        .limit(limit) // Limit the number of documents returned
        .exec(); // Execute the query

      // Count the total documents for pagination metadata
      const total = await Users.countDocuments();

      // Handle case where no users are found
      if (users.length === 0) {
        return handleResponse(res, 404, "error", "No users found", [], 0);
      }

      // Prepare pagination metadata
      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit: limit,
        totalDocuments: total,
      };

      // Return successful response with user data and pagination details
      return handleResponse(
        res,
        200,
        "success",
        "Users retrieved successfully",
        users,
        total,
        pagination
      );
    } catch (error) {
      // Log and return the error
      console.error("Error fetching users:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while fetching the users.",
        null,
        0
      );
    }
  }
  async getAdmins(req, res) {
    // Ensure the request is from a logged-in user
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }

    // Check if the user has the 'admin' role
    if (req.user.role !== "Admin") {
      return handleResponse(
        res,
        403,
        "error",
        "You are not authorized to perform this action.",
        null,
        0
      );
    }

    try {
      // Pagination parameters
      const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
      const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items if not specified
      const skip = (page - 1) * limit; // Calculate the number of documents to skip

      // Fetch only users with the "Admin" role
      const admins = await Users.find({ role: "Admin" })
        .select("-password -refreshTokens")
        .skip(skip) // Skip the documents for the current page
        .limit(limit) // Limit the number of documents returned
        .exec(); // Execute the query

      // Count the total admin documents for pagination metadata
      const total = await Users.countDocuments({ role: "Admin" });

      // Handle case where no admins are found
      if (admins.length === 0) {
        return handleResponse(res, 404, "error", "No admins found", [], 0);
      }

      // Prepare pagination metadata
      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit: limit,
        totalDocuments: total,
      };

      // Return successful response with admin data and pagination details
      return handleResponse(
        res,
        200,
        "success",
        "Admins retrieved successfully",
        admins,
        total,
        pagination
      );
    } catch (error) {
      // Log and return the error
      console.error("Error fetching admins:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while fetching the admins.",
        null,
        0
      );
    }
  }

  async getJobSeekersForAdmin(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      if (req.user.role !== "Admin") {
        return handleResponse(
          res,
          403,
          "error",
          "You are not authorized to perform this action.",
          null,
          0
        );
      }
      // Pagination parameters
      const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
      const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items if not specified
      const skip = (page - 1) * limit; // Calculate the number of documents to skip

      // Modify the query to include pagination
      const resultUsers = await Users.find({ jobSeeker: { $exists: true } })
        .select("-password -refreshTokens")
        .skip(skip) // Skip the documents for the current page
        .limit(limit) // Limit the number of documents returned
        .exec(); // Execute the query

      // Count the total documents that match the query (without limit and skip) for pagination metadata
      const total = await Users.countDocuments({
        jobSeeker: { $exists: true },
      });

      if (resultUsers.length === 0) {
        return handleResponse(res, 200, "error", "No job seekers found", [], 0);
      }

      // Prepare pagination metadata
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
        "Job seekers retrieved successfully",
        resultUsers,
        total,
        pagination
      );
    } catch (error) {
      console.error("Error in getAllJobSeekers function:", error);
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
  async getEmployersForAdmin(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      if (req.user.role !== "Admin") {
        return handleResponse(
          res,
          403,
          "error",
          "You are not authorized to perform this action.",
          null,
          0
        );
      }

      const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
      const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items if not specified
      const skip = (page - 1) * limit;

      // Adjusted to use $in operator for role matching
      const query = {
        role: { $in: ["Employer"] },
      };

      const searchedUsers = await Users.find(query)
        .skip(skip)
        .limit(limit)
        .select("-password -refreshTokens");

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
        totalUsers,
        pagination
      );
    } catch (error) {
      console.error("Error in getAllEmployers function:", error);
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
  async getJobsForAdmin(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      if (req.user.role !== "Admin") {
        return handleResponse(
          res,
          403,
          "error",
          "You are not authorized to perform this action.",
          null,
          0
        );
      }

      const {
        education,
        experience,
        workingtype,
        recommended,
        salary,
        jobTitle,
        sort,
        recentjob,
        page = 1,
        limit = 10,
        numericFilters,
        jobType,
      } = req.query;

      let queryObject = {};

      if (recommended === "true") {
        queryObject.recommended = true;
      }

      if (experience) {
        queryObject.experienceRequired = experience;
      }

      if (salary) {
        queryObject.salary = salary;
      }

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

      let NewSearchedJob = resultJobs.map((job) => {
        const user = userMap[job.createdBy.toString()];
        return {
          ...job._doc, // Assuming you're using Mongoose and want to spread the job document
          hr_name: user ? user.fullName : null,
          hr_avatar: user ? user.avatar : null,
        };
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
        totalJobs,
        pagination
      );
    } catch (error) {
      console.error("Error in getJobsForAdmin function:", error);
      return handleResponse(
        res,
        500,
        "error",
        "Internal Server Error",
        null,
        0
      );
    }
  }
  async getOfficesForAdmin(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized");
      }

      if (req.user.role !== "Admin") {
        return handleResponse(
          res,
          403,
          "error",
          "You are not authorized to perform this action."
        );
      }

      const {
        recommended,
        title,
        location,
        page = 1,
        limit = 10,
        sort,
      } = req.query;

      let queryObject = {};

      if (recommended) {
        queryObject.recommended = recommended === "true";
      }

      if (title) {
        if (title.trim() === "") {
          return handleResponse(
            res,
            400,
            "error",
            "Title cannot be empty",
            [],
            0
          );
        } else {
          queryObject.title = { $regex: title, $options: "i" };
        }
      }

      if (location) {
        queryObject.location = { $regex: location, $options: "i" };
      }

      let query = Offices.find(queryObject);

      // Pagination
      const skip = (page - 1) * parseInt(limit); // Ensure limit is an integer
      query = query.skip(skip).limit(parseInt(limit));

      // Sort
      if (sort) {
        const sortList = sort.split(",").join(" ");
        query = query.sort(sortList);
      } else {
        query = query.sort("-createdAt"); // Default sort by creation date
      }

      const searchedOffice = await query;
      if (searchedOffice.length === 0) {
        return handleResponse(res, 200, "success", "No offices found", [], 0);
      }

      // Prepare pagination data
      const totalOffices = await Offices.countDocuments(queryObject); // Efficiently fetch total count
      const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOffices / parseInt(limit)),
        limit: parseInt(limit),
        totalDocuments: totalOffices,
      };

      return handleResponse(
        res,
        200,
        "success",
        "Offices retrieved successfully",
        searchedOffice,
        totalOffices,
        pagination
      );
    } catch (error) {
      console.error("Error in getOfficesForAdmin function:", error);
      return handleResponse(res, 500, "error", "Internal Server Error");
    }
  }

  async getQuickjobsForAdmin(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized");
      }

      if (req.user.role !== "Admin") {
        return handleResponse(
          res,
          403,
          "error",
          "You are not authorized to perform this action."
        );
      }
      const {
        recommended,
        title,
        location,
        page = 1,
        limit = 10,
        sort,
      } = req.query;
      let queryObject = {};

      if (recommended) {
        queryObject.recommended = recommended === "true";
      }

      if (title) {
        if (title.trim() === "") {
          return handleResponse(
            res,
            400,
            "error",
            "Title cannot be empty",
            [],
            0
          );
        } else {
          queryObject.title = { $regex: title, $options: "i" };
        }
      }

      if (location) {
        queryObject.location = { $regex: location, $options: "i" };
      }

      let query = QuickJobs.find(queryObject);

      // Pagination
      const skip = (page - 1) * parseInt(limit); // Ensure limit is an integer
      query = query.skip(skip).limit(parseInt(limit));

      // Sort
      if (sort) {
        const sortList = sort.split(",").join(" ");
        query = query.sort(sortList);
      } else {
        query = query.sort("-createdAt"); // Default sort by createdAt in descending order
      }

      // Fields selection
      // Ensure 'description' is always included along with other fields
      // let fieldsToSelect = "title location createdBy description phoneNumber"; // Default fields now include 'description'
      // query = query.select(fieldsToSelect);

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

      let NewSearchedJob = searchedJob.map((job) => {
        const user = userMap[job.createdBy.toString()];
        return {
          ...job._doc, // Assuming you're using Mongoose and want to spread the job document
          hr_name: user?.fullName,
          hr_avatar: user?.avatar,
        };
      });

      // Prepare pagination data
      const totalJobs = await QuickJobs.countDocuments(queryObject); // Efficiently fetch total count
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
        totalJobs,
        pagination
      );
    } catch (error) {
      console.error("Error in getAllQuickjobs function:", error);
      return handleResponse(res, 500, "error", "Internal Server Error");
    }
  }
  // block user by admin
  async blockUserByAdmin(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized");
      }

      // Check if the user is an admin
      // if (req.user.role !== 'Admin') {
      //     return handleResponse(res, 403, 'error', 'You are not authorized to perform this action.');
      // }

      const { id: userId } = req.params;
      const user = await Users.findById(userId).select(
        "-password -refreshTokens"
      );

      if (!user) {
        return handleResponse(res, 404, "error", "User not found");
      }

      // Check if 'blocked' field is undefined and set it to true if so
      if (user.blocked === undefined) {
        // console.log("User does not have a 'blocked' field");
        user.blocked = true;
        // console.log("User blocked:", user);
        await user.save();
        return handleResponse(
          res,
          200,
          "success",
          "User blocked successfully",
          user
        );
      }

      // Optionally, ensure the user is blocked if 'blocked' field exists
      if (!user.blocked) {
        user.blocked = true;
        await user.save();
        return handleResponse(
          res,
          200,
          "success",
          "User already had blocked field. Now set to blocked.",
          user
        );
      }

      return handleResponse(
        res,
        200,
        "success",
        "User was already blocked",
        user
      );
    } catch (error) {
      console.error("Error in blockUser function:", error);
      return handleResponse(res, 500, "error", "Internal Server Error");
    }
  }
  // unblock user by admin
  async unblockUserByAdmin(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized");
      }

      // Check if the user is an admin
      // if (req.user.role !== 'Admin') {
      //     return handleResponse(res, 403, 'error', 'You are not authorized to perform this action.');
      // }

      const { id: userId } = req.params;
      const user = await Users.findById(userId).select(
        "-password -refreshTokens"
      );

      if (!user) {
        return handleResponse(res, 404, "error", "User not found");
      }

      // Check if 'blocked' field is undefined and set it to false if so
      if (user.blocked === undefined) {
        // console.log("User does not have a 'blocked' field");
        user.blocked = false;
        // console.log("User unblocked:", user);
        await user.save();
        return handleResponse(
          res,
          200,
          "success",
          "User unblocked successfully",
          user
        );
      }

      // Optionally, ensure the user is unblocked if 'blocked' field exists
      if (user.blocked) {
        user.blocked = false;
        await user.save();
        return handleResponse(
          res,
          200,
          "success",
          "User already had blocked field. Now set to unblocked.",
          user
        );
      }

      return handleResponse(
        res,
        200,
        "success",
        "User was already unblocked",
        user
      );
    } catch (error) {
      console.error("Error in unblockUser function:", error);
      return handleResponse(res, 500, "error", "Internal Server Error");
    }
  }
  // send news to all users as notifications
  async sendNewsToAllUsers(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized");
      }

      // if (req.user.role !== 'Admin') {
      //     return handleResponse(res, 403, 'error', 'You are not authorized to perform this action.');
      // }

      const { title, message } = req.body;

      if (!title || !message) {
        return handleResponse(
          res,
          400,
          "error",
          "Title and message are required"
        );
      }

      const users = await Users.find().select("-password -refreshTokens");

      if (users.length === 0) {
        return handleResponse(res, 200, "success", "No users found", [], 0);
      }

      const notifications = users.map((user) => {
        return {
          user: user._id,
          title,
          message,
          read: false,
        };
      });

      await public_notification_model.insertMany(notifications);
      await save_notification.create({
        user: req.user.id,
        title,
        message,
        sendUsersCount: users.length,
      });
      const tokens = users.map((user) => user.mobileToken);
      const notification = {
        title,
        body: message,
      };
      const info = {
        type: "news",
      };
      sendNotification(tokens, notification, info);
      return handleResponse(
        res,
        200,
        "success",
        "News sent successfully",
        notifications
      );
    } catch (error) {
      console.error("Error in sendNewsToAllUsers function:", error);
      return handleResponse(res, 500, "error", "Internal Server Error");
    }
  }
}
module.exports = new AdminCTRL();
