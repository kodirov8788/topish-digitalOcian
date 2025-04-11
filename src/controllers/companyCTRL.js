// src/controllers/companyCTRL.js
const Company = require("../models/company_model");
const Jobs = require("../models/job_model");
const QuickJobs = require("../models/quickjob_model");
const CompanyEmploymentReq = require("../models/companyEmploymentReq_model");
const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");
const { deleteFiles } = require("../utils/imageUploads/companyImageUpload");
const sendNotification = require("../utils/Notification");
const getCompaniesByStatus = async (status, page, limit) => {
  const skip = (page - 1) * limit; // Calculate the number of documents to skip
  const companies = await Company.find({ status })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 }); // Sort by creation date (latest first)

  const totalCompanies = await Company.countDocuments({ status });
  return { companies, totalCompanies };
};

class CompanyCTRL {
  async createCompany(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );
      if (!user) {
        return handleResponse(res, 400, "error", "User not found.", null, 0);
      }

      // Check if the user has already created a company
      const existingCompany = await Company.findOne({ createdBy: user._id });
      if (existingCompany) {
        return handleResponse(
          res,
          400,
          "error",
          "You have already created a company. Only one company is allowed per user.",
          null,
          0
        );
      }

      const companyDetails = {
        ...req.body,
        createdBy: user._id,
        status: "pending", // Set the initial status to "pending"
        workers: [
          {
            userId: user._id,
            isAdmin: true,
            role: "Admin",
          },
        ],
      };

      // Check if there are any uploaded files and assign them accordingly
      if (req.uploadResults) {
        if (req.uploadResults.logo) {
          companyDetails.logo = req.uploadResults.logo; // Store logo URLs
        }
        if (req.uploadResults.licenseFile) {
          companyDetails.licenseFiles = req.uploadResults.licenseFile; // Store license file URLs separately
        }
      }

      const company = await Company.create(companyDetails);
      await Users.findByIdAndUpdate(user._id, { $inc: { coins: -1 } });

      return handleResponse(
        res,
        201,
        "success",
        "Company created successfully. Awaiting admin approval.",
        company,
        1
      );
    } catch (error) {
      console.error("Error in createCompany function:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while creating the company.",
        null,
        0
      );
    }
  }
  async getMyCompanyRequest(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );
      if (!user) {
        return handleResponse(res, 404, "error", "User not found.", null, 0);
      }

      // Find the company created by the logged-in user
      const company = await Company.findOne({ createdBy: user._id });

      if (!company) {
        return handleResponse(
          res,
          200,
          "success",
          "No company request found",
          [],
          0
        );
      }

      return handleResponse(
        res,
        200,
        "success",
        "Company request fetched successfully",
        company,
        1
      );
    } catch (error) {
      console.error("Error in getMyCompanyRequest function:", error);
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

  async getCompanyByUserId(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      // Get userId from params if provided, otherwise use logged-in user's id
      const userId = req.params.userId || req.user.id;

      // Find companies where the user is either the creator or a worker
      const companies = await Company.find({
        $or: [{ createdBy: userId }, { "workers.userId": userId }],
      });

      if (!companies || companies.length === 0) {
        return handleResponse(res, 200, "success", "No companies found", [], 0);
      }

      return handleResponse(
        res,
        200,
        "success",
        "Companies retrieved successfully",
        companies,
        companies.length
      );
    } catch (error) {
      console.error("Error in getCompanyByUserId function:", error);
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

  async approveCompany(req, res) {
    try {
      const companyId = req.params.companyId;
      const { status } = req.body; // either "approved" or "rejected"
      console.log("companyId:", companyId);
      // if (!req.user || req.user.role !== "Admin") {
      //   return handleResponse(res, 403, "error", "Access denied.", null, 0);
      // }
      if (!["approved", "rejected", "pending"].includes(status)) {
        return handleResponse(res, 400, "error", "Invalid status.", null, 0);
      }

      const company = await Company.findByIdAndUpdate(
        companyId,
        { status },
        { new: true }
      );

      if (!company) {
        return handleResponse(res, 404, "error", "Company not found.", null, 0);
      }

      // If the company is approved, make the createdBy user an admin
      if (status === "approved") {
        const userId = company.createdBy;
        const isAlreadyAdmin = company.workers.some(
          (worker) =>
            worker.userId.toString() === userId.toString() && worker.isAdmin
        );

        if (!isAlreadyAdmin) {
          company.workers.push({ userId, isAdmin: true, role: "Admin" });
          await company.save();
        }
      }

      return handleResponse(
        res,
        200,
        "success",
        `Company status updated to ${status}.`,
        company,
        1
      );
    } catch (error) {
      console.error("Error in approveCompany function:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while updating the company status.",
        null,
        0
      );
    }
  }
  async getApprovedCompanies(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query; // Default page is 1, limit is 10
      const { companies, totalCompanies } = await getCompaniesByStatus(
        "approved",
        parseInt(page),
        parseInt(limit)
      );

      // Pagination object
      const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCompanies / parseInt(limit)),
        limit: parseInt(limit),
        totalDocuments: totalCompanies,
      };

      return handleResponse(
        res,
        200,
        "success",
        "Approved companies fetched successfully",
        { companies, pagination },
        companies.length
      );
    } catch (error) {
      console.error("Error in fetching approved companies:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while fetching approved companies.",
        null,
        0
      );
    }
  }
  async getPendingCompanies(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query; // Default page is 1, limit is 10
      const { companies, totalCompanies } = await getCompaniesByStatus(
        "pending",
        parseInt(page),
        parseInt(limit)
      );

      // Pagination object
      const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCompanies / parseInt(limit)),
        limit: parseInt(limit),
        totalDocuments: totalCompanies,
      };

      return handleResponse(
        res,
        200,
        "success",
        "Pending companies fetched successfully",
        { companies, pagination },
        companies.length
      );
    } catch (error) {
      console.error("Error in fetching pending companies:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while fetching pending companies.",
        null,
        0
      );
    }
  }
  async getRejectedCompanies(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query; // Default page is 1, limit is 10
      const { companies, totalCompanies } = await getCompaniesByStatus(
        "rejected",
        parseInt(page),
        parseInt(limit)
      );

      // Pagination object
      const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCompanies / parseInt(limit)),
        limit: parseInt(limit),
        totalDocuments: totalCompanies,
      };

      return handleResponse(
        res,
        200,
        "success",
        "Rejected companies fetched successfully",
        { companies, pagination },
        companies.length
      );
    } catch (error) {
      console.error("Error in fetching rejected companies:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while fetching rejected companies.",
        null,
        0
      );
    }
  }
  async getCompaniesStatus(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );
      const { page = 1, limit = 10 } = req.query; // Default pagination values
      const skip = (page - 1) * limit;

      // Validate if user exists
      if (!user) {
        return handleResponse(res, 404, "error", "User not found.", null, 0);
      }

      // Fetch companies created by the user
      const company = await Company.findOne({ createdBy: user._id })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }); // Sort by creation date (latest first)

      // const totalCompanies = await Company.countDocuments({
      //   createdBy: user._id,
      // });

      // // Pagination object
      // const pagination = {
      //   currentPage: parseInt(page),
      //   totalPages: Math.ceil(totalCompanies / parseInt(limit)),
      //   limit: parseInt(limit),
      //   totalDocuments: totalCompanies,
      // };

      return handleResponse(
        res,
        200,
        "success",
        "Companies fetched successfully",
        company,
        1
      );
    } catch (error) {
      console.error("Error in fetching companies by user ID:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while fetching companies.",
        null,
        0
      );
    }
  }
  async deleteCompany(req, res, next) {
    try {
      // Check if the user is authenticated
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );
      // Check if the user role is Employer
      const allowedRoles = ["Admin", "Employer"];
      if (!allowedRoles.includes(user.role)) {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }
      const { id: companyId } = req.params;

      let company = await Company.findById(companyId);
      await deleteFiles(company.logo);
      // Perform the deletion operation
      const deleteCompany = await Company.findOneAndDelete({
        _id: companyId,
        createdBy: req.user.id, // Ensure that the job can only be deleted by its creator
      });

      // If the job doesn't exist or wasn't deleted
      if (!deleteCompany) {
        return handleResponse(
          res,
          404,
          "error",
          `company with id: ${companyId} not found`,
          null,
          0
        );
      }

      // If deletion was successful
      return handleResponse(
        res,
        200,
        "success",
        "company deleted successfully",
        null,
        1
      );
    } catch (error) {
      console.error("Error in deleteCompany function:", error);
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
  async getAllCompany(req, res) {
    try {
      // if (!req.user) {
      //   return handleResponse(res, 401, "error", "Unauthorized");
      // }

      const { companyName, location, page = 1, limit = 10, sort } = req.query;
      let queryObject = {};

      if (companyName) {
        if (companyName.trim() === "") {
          return handleResponse(
            res,
            400,
            "error",
            "Company name cannot be empty",
            [],
            0
          );
        } else {
          queryObject.name = { $regex: companyName, $options: "i" };
        }
      }

      if (location) {
        queryObject.location = { $regex: location, $options: "i" };
      }

      let query = Company.find(queryObject);

      // Pagination
      const skip = (page - 1) * parseInt(limit); // Ensure limit is an integer
      query = query.skip(skip).limit(parseInt(limit));

      // Sort
      if (sort) {
        const sortList = sort.split(",").join(" ");
        query = query.sort(sortList);
      }

      let searchedCompanies = await query;

      if (searchedCompanies.length === 0) {
        return handleResponse(res, 200, "success", "No companies found", [], 0);
      }

      // Fetch workers for each company
      const updatedCompanies = await Promise.all(
        searchedCompanies.map(async (company) => {
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
                  role: workerData.role,
                };
              }
              return workerData; // Return original workerData if user is not found
            })
          );
          return {
            ...company.toObject(),
            workers: newWorkers,
          };
        })
      );

      // Prepare pagination data
      const totalCompanies = await Company.countDocuments(queryObject); // Efficiently fetch total count
      const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCompanies / parseInt(limit)),
        limit: parseInt(limit),
        totalDocuments: totalCompanies,
      };

      return handleResponse(
        res,
        200,
        "success",
        "Companies retrieved successfully",
        updatedCompanies,
        updatedCompanies.length,
        pagination
      );
    } catch (error) {
      console.error("Error in getAllCompany function:", error);
      return handleResponse(res, 500, "error", "Internal Server Error");
    }
  }
  async getSingleCompany(req, res) {
    // console.log("req.id: ", req.params.id);
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const {
        params: { id: companyId },
      } = req; // request gives the ID of the item

      const singleCompany = await Company.findById(companyId);
      if (!singleCompany) {
        return handleResponse(
          res,
          404,
          "error",
          `Company not found with ID: ${companyId}`,
          null,
          0
        );
      }
      const updatedCompany = await (async (company) => {
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
                role: workerData.role,
              };
            }
            return workerData; // Return original workerData if user is not found
          })
        );
        return {
          ...company.toObject(),
          workers: newWorkers,
        };
      })(singleCompany);

      return handleResponse(
        res,
        200,
        "success",
        "Company retrieved successfully",
        updatedCompany,
        1
      );
    } catch (error) {
      console.error("Error in getSingleCompany function:", error);
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
  async updateCompany(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );
      const {
        params: { id: companyId },
        body,
      } = req;
      // console.log("req body: ", req.body);
      let company = await Company.findById(companyId);
      if (!company) {
        return handleResponse(
          res,
          404,
          "error",
          `Company not found with ID: ${companyId}`,
          null,
          0
        );
      }

      let hrAdmin = company.workers.find(
        (worker) => worker.userId.toString() === req.user.id && worker.isAdmin
      );
      if (!hrAdmin && user.role !== "Admin") {
        return handleResponse(
          res,
          401,
          "error",
          "You are not authorized",
          null,
          0
        );
      }

      // Process new images if provided
      // console.log("req.uploadResults 1: ", req.uploadResults);
      if (req.uploadResults) {
        if (req.uploadResults.logo && req.uploadResults.logo.length > 0) {
          company.logo = req.uploadResults.logo;
        }
        if (
          req.uploadResults.company_logo &&
          req.uploadResults.company_logo.length > 0
        ) {
          company.company_logo = req.uploadResults.company_logo;
        }
        if (req.uploadResults.images && req.uploadResults.images.length > 0) {
          company.images = req.uploadResults.images;
        }
        if (
          req.uploadResults.licenseFile &&
          req.uploadResults.licenseFile.length > 0
        ) {
          company.licenseFiles = req.uploadResults.licenseFile;
        }
      }

      // Update company details
      // console.log("body: ", body);
      company.name = body.name || company.name;
      company.description = body.description || company.description;
      company.size = body.size || company.size;
      company.location = body.location || company.location;
      company.type = body.type || company.type;
      company.working_time = body.working_time || company.working_time;
      company.working_days = body.working_days || company.working_days;
      company.overtime = body.overtime || company.overtime;
      company.phoneNumber = body.phoneNumber || company.phoneNumber;

      company.info.legal_representative =
        body.legal_representative || company.info.legal_representative;
      company.info.registration_capital =
        body.registration_capital || company.info.registration_capital;
      company.info.date_of_establishment =
        body.date_of_establishment || company.info.date_of_establishment;

      // Special handling for benefits as an array of strings
      if (body.benefits === "" || body.benefits === undefined) {
        company.benefits = [];
      } else {
        company.benefits = body.benefits
          .split(",")
          .map((benefit) => String(benefit));
      }

      await company.save();

      return handleResponse(
        res,
        200,
        "success",
        "Company updated successfully",
        company,
        1
      );
    } catch (error) {
      console.error("Error in updateCompany function:", error);
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
  async updateCompanyMinorChange(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );
      const allowedRoles = ["Admin", "Employer"];
      // console.log("user: ", user);
      if (!allowedRoles.includes(user.role)) {
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
        params: { id: companyId },
        body,
      } = req;

      let company = await Company.findById(companyId);
      if (!company) {
        return handleResponse(
          res,
          404,
          "error",
          `Company not found with ID: ${companyId}`,
          null,
          0
        );
      }
      let hrAdmin = company.workers.find(
        (worker) => worker.userId.toString() === req.user.id && worker.isAdmin
      );
      // if (!hrAdmin && user.role !== "Admin") {
      //   return handleResponse(
      //     res,
      //     401,
      //     "error",
      //     "You are not authorized",
      //     null,
      //     0
      //   );
      // }

      // Update only the provided fields
      const updatableFields = [
        "name",
        "description",
        "size",
        "location",
        "type",
        "working_time",
        "working_days",
        "overtime",
        "info.legal_representative",
        "info.registration_capital",
        "info.date_of_establishment",
      ];

      updatableFields.forEach((field) => {
        const fieldPath = field.split(".");
        if (fieldPath.length > 1) {
          const [mainField, subField] = fieldPath;
          if (body[mainField] && body[mainField][subField] !== undefined) {
            company[mainField][subField] = body[mainField][subField];
          }
        } else if (body[field] !== undefined) {
          company[field] = body[field];
        }
      });

      // Special handling for benefits as an array of strings
      if (body.benefits === "" || body.benefits === undefined) {
        company.benefits = [];
      } else {
        company.benefits = body.benefits
          .split(",")
          .map((benefit) => String(benefit));
      }
      await company.save();

      return handleResponse(
        res,
        200,
        "success",
        "Company minor updates applied successfully",
        company,
        1
      );
    } catch (error) {
      console.error("Error in updateCompanyMinorChange function:", error);
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
  async addAdminCompany(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const { id: companyId } = req.params;
      const { userId } = req.body;
      const allowedRoles = ["Admin", "Employer"];
      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );
      if (!allowedRoles.includes(user.role)) {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }

      const company = await Company.findById(companyId);
      if (!company) {
        return handleResponse(res, 404, "error", "Company not found", null, 0);
      }
      // console.log("userId: ", userId);
      const newUser = await Users.findById(userId).select(
        "-password -refreshTokens"
      );
      if (!newUser) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const isAlreadyAdmin = company.workers.some(
        (worker) => worker.userId.toString() === userId.toString()
      );
      if (isAlreadyAdmin) {
        return handleResponse(
          res,
          400,
          "error",
          "This Employer is already the Admin of this company",
          null,
          0
        );
      }

      company.workers.push({ userId, isAdmin: true });
      await company.save();

      // Fetch device tokens for the user
      const userDeviceTokens = newUser.mobileToken || []; // Assuming user object has a mobileToken array

      if (userDeviceTokens.length > 0) {
        const notification = {
          title: "Admin Added",
          body: "You have been added as an admin to the company.",
        };
        const info = {
          companyId: companyId,
          userId: userId,
        };

        sendNotification(userDeviceTokens, notification, info);
      }

      return handleResponse(
        res,
        200,
        "success",
        "Admin added to the company successfully",
        company,
        1
      );
    } catch (error) {
      console.error("Error in addAdminCompany function:", error);
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
  async deleteAdminCompany(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { id: companyId } = req.params;
      const { userId } = req.body;
      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );
      const allowedRoles = ["Admin", "Employer"];
      if (!allowedRoles.includes(user.role)) {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }

      const company = await Company.findById(companyId);
      if (!company) {
        return handleResponse(res, 404, "error", "Company not found", null, 0);
      }

      const newUser = await Users.findById(userId).select(
        "-password -refreshTokens"
      );
      if (!newUser) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const isAdmin = company.workers.find(
        (worker) =>
          worker.userId.toString() === userId.toString() &&
          worker.isAdmin === true
      );
      if (!isAdmin) {
        return handleResponse(
          res,
          400,
          "error",
          "This Employer is not an Admin of this company",
          null,
          0
        );
      }

      company.workers = company.workers.filter(
        (worker) => worker.userId.toString() !== userId.toString()
      );

      await company.save();

      // Fetch device tokens for the user
      const userDeviceTokens = newUser.mobileToken || []; // Assuming user object has a mobileToken array

      if (userDeviceTokens.length > 0) {
        const notification = {
          title: "Admin Removed",
          body: "You have been removed as an admin from the company.",
        };
        const info = {
          companyId: companyId,
          userId: userId,
        };

        sendNotification(userDeviceTokens, notification, info);
      }

      return handleResponse(
        res,
        200,
        "success",
        "Admin deleted from the company successfully",
        company,
        1
      );
    } catch (error) {
      console.error("Error in deleteAdminCompany function:", error);
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
  async sendingReqToCompEmployer(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { id: companyId } = req.params;

      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );

      // Check if the user is already employed in any company
      const isEmployed = await Company.findOne({ "workers.userId": user._id });
      if (isEmployed) {
        return handleResponse(
          res,
          400,
          "error",
          "You are already employed in a company, you should give up your job first.",
          null,
          0
        );
      }

      // Check if the user has recently been rejected from this company
      const recentRejection = await CompanyEmploymentReq.findOne({
        requesterId: user._id,
        companyId: companyId,
        status: "rejected",
        rejectionDate: { $gt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }, // within the last 3 days
      });

      if (recentRejection) {
        return handleResponse(
          res,
          400,
          "error",
          "You have recently been rejected by this company. Please wait a few days before sending another request.",
          null,
          0
        );
      }

      const company = await Company.findById(companyId);
      if (!company) {
        return handleResponse(res, 404, "error", "Company not found", null, 0);
      }

      const existingRequest = await CompanyEmploymentReq.findOne({
        requesterId: user._id,
        companyId: companyId,
      });

      if (existingRequest) {
        return handleResponse(
          res,
          400,
          "error",
          "You have already sent a request to this company",
          null,
          0
        );
      }

      const newReq = await CompanyEmploymentReq.create({
        requesterId: user._id,
        companyId: companyId,
      });

      // Fetch all admins of the company
      const adminWorkers = company.workers.filter((worker) => worker.isAdmin);
      const adminUserIds = adminWorkers.map((worker) => worker.userId);

      // Fetch all admin users and their device tokens
      const adminUsers = await Users.find({
        _id: { $in: adminUserIds },
      }).select("-password -refreshTokens");
      const adminDeviceTokens = adminUsers.flatMap(
        (user) => user.mobileToken || []
      );

      if (adminDeviceTokens.length > 0) {
        const notification = {
          title: "New Employment Request",
          body: `Employer ${user.fullName} has sent an employment request to your company.`,
        };
        const info = {
          companyId: companyId,
          requesterId: user._id,
        };

        // Debug: Log notification and device tokens
        // console.log("Sending notification to:", adminDeviceTokens);
        // console.log("Notification payload:", notification, info);

        const notificationResult = await sendNotification(
          adminDeviceTokens,
          notification,
          info
        );

        // Debug: Log result of sendNotification
        // console.log("Notification result:", notificationResult);
      }

      return handleResponse(
        res,
        200,
        "success",
        "Employment request sent to the company successfully",
        newReq,
        1
      );
    } catch (error) {
      console.error("Error in sendingReqToCompEmployer function:", error);
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
  async rejectEmployerToComp(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const { id: companyId } = req.params;
      const { userId } = req.body;
      const allowedRoles = ["Employer", "Admin"];
      // const user = await Users.findById(req.user.id).select("-password -refreshTokens");
      // if (!allowedRoles.includes(user.role)) {
      //   return handleResponse(
      //     res,
      //     401,
      //     "error",
      //     "You are not allowed!",
      //     null,
      //     0
      //   );
      // }

      const company = await Company.findById(companyId);
      if (!company) {
        return handleResponse(res, 404, "error", "Company not found", null, 0);
      }
      let hrAdmin = company.workers.find(
        (worker) => worker.userId.toString() === req.user.id && worker.isAdmin
      );
      if (!hrAdmin && user.role !== "Admin") {
        return handleResponse(
          res,
          401,
          "error",
          "You are not authorized",
          null,
          0
        );
      }

      const newUser = await Users.findById(userId).select(
        "-password -refreshTokens"
      );
      if (!newUser) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const newReq = await CompanyEmploymentReq.findOne({
        requesterId: userId,
        companyId: companyId,
      });
      if (!newReq) {
        return handleResponse(
          res,
          400,
          "error",
          "No request found from this employer",
          null,
          0
        );
      }

      await CompanyEmploymentReq.findByIdAndUpdate(newReq.id, {
        status: "rejected",
        rejectionDate: new Date(), // Add a rejection date
      });

      // Fetch device tokens for the user
      const userDeviceTokens = newUser.mobileToken || []; // Assuming user object has a mobileToken array

      if (userDeviceTokens.length > 0) {
        const notification = {
          title: "Request Rejected",
          body: "Your request to join the company has been rejected.",
        };
        const info = {
          companyId: companyId,
          userId: userId,
        };

        sendNotification(userDeviceTokens, notification, info);
      }

      return handleResponse(
        res,
        200,
        "success",
        "Employer rejected from the company successfully",
        null,
        1
      );
    } catch (error) {
      console.error("Error in rejectEmployerToComp function:", error);
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
  async admitEmployerToComp(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { id: companyId } = req.params;
      const { userId, role } = req.body;
      // const allowedRoles = ["Employer", "Admin"];
      const assignableRoles = [
        "CompanyAdmin",
        "Manager",
        "TeamLead",
        "HRManager",
        "Recruiter",
        "Employee",
        "Intern",
      ];

      // Check if the provided role is within the assignable roles
      if (!assignableRoles.includes(role)) {
        return handleResponse(
          res,
          400,
          "error",
          "Invalid role specified",
          null,
          0
        );
      }

      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );
      // if (!allowedRoles.includes(user.role)) {
      //   return handleResponse(
      //     res,
      //     401,
      //     "error",
      //     "You are not allowed!",
      //     null,
      //     0
      //   );
      // }

      const company = await Company.findById(companyId);
      if (!company) {
        return handleResponse(res, 404, "error", "Company not found", null, 0);
      }

      let hrAdmin = company.workers.find(
        (worker) => worker.userId.toString() == user._id && worker.isAdmin
      );
      if (!hrAdmin && user.role !== "Admin") {
        return handleResponse(
          res,
          401,
          "error",
          "You are not authorized",
          null,
          0
        );
      }

      const newUser = await Users.findById(userId).select(
        "-password -refreshTokens"
      );
      if (!newUser) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const newReq = await CompanyEmploymentReq.findOne({
        requesterId: userId,
        companyId: companyId,
      });
      if (!newReq) {
        return handleResponse(
          res,
          400,
          "error",
          "No request found from this employer",
          null,
          0
        );
      }

      // Assign the specified role to the user
      company.workers.push({ userId, role, isAdmin: false });
      await company.save();
      await CompanyEmploymentReq.findByIdAndUpdate(newReq.id, {
        status: "accepted",
      });

      // Fetch device tokens for the user
      const userDeviceTokens = newUser.mobileToken || [];

      if (userDeviceTokens.length > 0) {
        const notification = {
          title: "Admitted to Company",
          body: `You have been admitted to the company as ${role}.`,
        };
        const info = { companyId: companyId, userId: userId };
        sendNotification(userDeviceTokens, notification, info);
      }

      return handleResponse(
        res,
        200,
        "success",
        "Employer added to the company successfully",
        company,
        1
      );
    } catch (error) {
      console.error("Error in admitEmployerToComp function:", error);
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
  async getStatusOfEmployerRequest(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { userId, id: companyId } = req.params;

      // Find the employment request
      const employmentRequest = await CompanyEmploymentReq.findOne({
        requesterId: userId,
        companyId: companyId,
      });

      if (!employmentRequest) {
        return handleResponse(
          res,
          200,
          "success",
          "No employment requests found for this user",
          [],
          0
        );
      }

      // Get the status of the employment request
      const requestStatus = employmentRequest.status;
      const rejectionDate = employmentRequest.rejectionDate;

      let additionalInfo = null;
      if (requestStatus === "rejected" && rejectionDate) {
        const canReapplyDate = new Date(
          rejectionDate.getTime() + 3 * 24 * 60 * 60 * 1000
        );
        const currentDate = new Date();
        const canReapply = currentDate >= canReapplyDate;

        additionalInfo = {
          canReapply,
          canReapplyDate,
        };
      }

      return handleResponse(
        res,
        200,
        "success",
        "Employment request status fetched successfully",
        { status: requestStatus, additionalInfo },
        1
      );
    } catch (error) {
      console.error("Error in getStatusOfEmployerRequest function:", error);
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
  async getCompanyEmploymentRequests(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const { id: companyId } = req.params;
      // const user = await Users.findOne({ _id: req.user.id }).select("-password -refreshTokens");
      // if ( user.role !== "Admin") {
      //   return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      // }

      const company = await Company.findById(companyId);
      if (!company) {
        return handleResponse(res, 404, "error", "Company not found", null, 0);
      }
      let hrAdmin = company.workers.find(
        (worker) => worker.userId.toString() === req.user.id && worker.isAdmin
      );
      if (!hrAdmin)
        // message will be you are not hr admin
        return handleResponse(
          res,
          401,
          "error",
          "You are not hr admin",
          null,
          0
        );

      const employmentRequests = await CompanyEmploymentReq.find({
        companyId: companyId,
      }).populate("requesterId", "fullName avatar");

      return handleResponse(
        res,
        200,
        "success",
        "Employment requests retrieved successfully",
        employmentRequests,
        employmentRequests.length
      );
    } catch (error) {
      console.error("Error in getCompanyEmploymentRequests function:", error);
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
  async getAllRequestsStatusForUser(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { userId } = req.params;

      // Find all employment requests made by the user
      const employmentRequests = await CompanyEmploymentReq.find({
        requesterId: userId,
      });

      if (!employmentRequests || employmentRequests.length === 0) {
        return handleResponse(
          res,
          200,
          "success",
          "No employment requests found for this user",
          [],
          0
        );
      }

      // Prepare the response data
      const requestsStatus = employmentRequests.map((request) => {
        const rejectionDate = request.rejectionDate;
        let additionalInfo = null;
        if (request.status === "rejected" && rejectionDate) {
          const canReapplyDate = new Date(
            rejectionDate.getTime() + 3 * 24 * 60 * 60 * 1000
          );
          const currentDate = new Date();
          const canReapply = currentDate >= canReapplyDate;

          additionalInfo = {
            canReapply,
            canReapplyDate,
          };
        }
        return {
          companyId: request.companyId,
          status: request.status,
          additionalInfo,
        };
      });

      return handleResponse(
        res,
        200,
        "success",
        "Employment requests status fetched successfully",
        requestsStatus,
        requestsStatus.length
      );
    } catch (error) {
      console.error("Error in getAllRequestsStatusForUser function:", error);
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
  async addingEmployerManually(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const { id: companyId } = req.params;
      const { userId } = req.body;
      const allowedRoles = ["Employer", "Admin"];
      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );
      if (!allowedRoles.includes(user.role)) {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }

      const company = await Company.findById(companyId);
      if (!company) {
        return handleResponse(res, 404, "error", "Company not found", null, 0);
      }

      let hrAdmin = company.workers.find(
        (worker) => worker.userId.toString() === req.user.id && worker.isAdmin
      );
      if (!hrAdmin) {
        return handleResponse(
          res,
          401,
          "error",
          "You are not authorized",
          null,
          0
        );
      }

      const newUser = await Users.findById(userId).select(
        "-password -refreshTokens"
      );
      if (!newUser) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const isAlreadyEmployed = company.workers.some(
        (worker) => worker.userId.toString() === userId.toString()
      );
      if (isAlreadyEmployed) {
        return handleResponse(
          res,
          400,
          "error",
          "This Employer is already employed in this company",
          null,
          0
        );
      }

      company.workers.push({ userId, isAdmin: false });
      await company.save();

      // Fetch device tokens for the user
      const userDeviceTokens = newUser.mobileToken || []; // Assuming user object has a mobileToken array

      if (userDeviceTokens.length > 0) {
        const notification = {
          title: "Added to Company",
          body: "You have been added to the company.",
        };
        const info = {
          companyId: companyId,
          userId: userId,
        };

        sendNotification(userDeviceTokens, notification, info);
      }

      return handleResponse(
        res,
        200,
        "success",
        "Employer added to the company successfully",
        company,
        1
      );
    } catch (error) {
      console.error("Error in addingEmployerManually function:", error);
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
  async removeEmployerFromCompany(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { id: companyId } = req.params;
      const { userId } = req.body;
      const allowedRoles = ["Employer", "Admin"];
      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );

      if (!allowedRoles.includes(user.role)) {
        return handleResponse(
          res,
          401,
          "error",
          "You are not allowed!",
          null,
          0
        );
      }

      const company = await Company.findById(companyId);
      if (!company) {
        return handleResponse(res, 404, "error", "Company not found", null, 0);
      }

      const hrAdmin = company.workers.find(
        (worker) => worker.userId.toString() === req.user.id && worker.isAdmin
      );
      if (!hrAdmin) {
        return handleResponse(
          res,
          401,
          "error",
          "You are not authorized",
          null,
          0
        );
      }

      const newUser = await Users.findById(userId).select(
        "-password -refreshTokens"
      );
      if (!newUser) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const isEmployed = company.workers.some(
        (worker) => worker.userId.toString() === userId.toString()
      );
      if (!isEmployed) {
        return handleResponse(
          res,
          400,
          "error",
          "This Employer is not employed in this company",
          null,
          0
        );
      }

      company.workers = company.workers.filter(
        (worker) => worker.userId.toString() !== userId.toString()
      );
      await company.save();

      // Remove employment requests associated with the user and company
      await CompanyEmploymentReq.deleteMany({
        requesterId: userId,
        companyId: companyId,
      });

      // Fetch device tokens for the user
      const userDeviceTokens = newUser.mobileToken || []; // Assuming user object has a mobileToken array

      if (userDeviceTokens.length > 0) {
        const notification = {
          title: "Removed from Company",
          body: "You have been removed from the company.",
        };
        const info = {
          companyId: companyId,
          userId: userId,
        };

        // Debug: Log notification and device tokens
        // console.log("Sending notification to:", userDeviceTokens);
        // console.log("Notification payload:", notification, info);

        const notificationResult = await sendNotification(
          userDeviceTokens,
          notification,
          info
        );

        // Debug: Log result of sendNotification
        // console.log("Notification result:", notificationResult);
      }

      return handleResponse(
        res,
        200,
        "success",
        "Employer removed from the company successfully",
        company,
        1
      );
    } catch (error) {
      console.error("Error in removeEmployerFromCompany function:", error);
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
  async getCompanyJobPosts(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { id: companyId } = req.params;
      const company = await Company.findById(companyId);
      if (!company) {
        return handleResponse(res, 404, "error", "Company not found", null, 0);
      }

      const CompanyWorkers = company.workers.map((worker) => worker.userId);

      const CompanyJobs = await Jobs.find({
        createdBy: { $in: CompanyWorkers },
      });
      const CompanyQuickJobs = await QuickJobs.find({
        createdBy: { $in: CompanyWorkers },
      });

      const allJobs = [...CompanyJobs, ...CompanyQuickJobs];

      const userIds = allJobs.map((job) => job.createdBy);
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

      const NewSearchedJob = {
        jobs: CompanyJobs.map((job) => {
          const user = userMap[job.createdBy.toString()];
          const issuedBy = companyMap[job.createdBy.toString()] || null;

          return {
            ...job._doc,
            hr_name: user
              ? user.employer
                ? user.fullName
                : "No employer name"
              : "deleted user",
            hr_avatar: user
              ? user.avatar || "default_avatar.png"
              : "default_avatar.png",
            issuedBy,
          };
        }),
        quickJobs: CompanyQuickJobs.map((job) => {
          const user = userMap[job.createdBy.toString()];
          const issuedBy = companyMap[job.createdBy.toString()] || null;

          return {
            ...job._doc,
            hr_name: user
              ? user.employer
                ? user.fullName
                : "No employer name"
              : "deleted user",
            hr_avatar: user
              ? user.avatar || "default_avatar.png"
              : "default_avatar.png",
            issuedBy,
          };
        }),
      };

      return handleResponse(
        res,
        200,
        "success",
        "Job posts retrieved successfully",
        NewSearchedJob,
        NewSearchedJob.jobs.length + NewSearchedJob.quickJobs.length
      );
    } catch (error) {
      console.error("Error in getCompanyJobPosts function:", error);
      return handleResponse(res, 500, "error", "Internal Server Error");
    }
  }
  async appliedCompanyCount(req, res) {
    try {
      // Ensure the user is authenticated
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      // Find all employment requests made by the user
      const employmentRequests = await CompanyEmploymentReq.find({
        requesterId: req.user.id,
      }).populate("companyId", "name");
      console.log("employmentRequests:", employmentRequests);
      // If no requests found, return a response
      if (!employmentRequests || employmentRequests.length === 0) {
        return handleResponse(
          res,
          200,
          "success",
          "No employment requests found",
          { appliedCompanies: [], totalApplied: 0 },
          0
        );
      }

      // Prepare the response data
      const appliedCompanies = employmentRequests.map((request) => {
        return {
          companyId: request.companyId._id,
          companyName: request.companyId.name,
          status: request.status,
        };
      });

      // Return the total count and the list of companies
      return handleResponse(
        res,
        200,
        "success",
        "Applied companies fetched successfully",
        { appliedCompanies, totalApplied: appliedCompanies.length },
        appliedCompanies.length
      );
    } catch (error) {
      console.error("Error in appliedCompanyCount function:", error);
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
  async changeEmployerRole(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const { companyId, userId } = req.params;
      const { newRole } = req.body;
      // const allowedRoles = ["Employer", "Admin"];
      const assignableRoles = [
        "CompanyAdmin",
        "Manager",
        "TeamLead",
        "HRManager",
        "Recruiter",
        "Employee",
        "Intern",
      ];

      // Check if the provided role is within the assignable roles
      if (!assignableRoles.includes(newRole)) {
        return handleResponse(
          res,
          400,
          "error",
          "Invalid role specified",
          null,
          0
        );
      }

      const user = await Users.findOne({ _id: req.user.id }).select(
        "-password -refreshTokens"
      );
      // if (!allowedRoles.includes(user.role)) {
      //   return handleResponse(
      //     res,
      //     401,
      //     "error",
      //     "You are not allowed!",
      //     null,
      //     0
      //   );
      // }

      const company = await Company.findById(companyId);
      if (!company) {
        return handleResponse(res, 404, "error", "Company not found", null, 0);
      }

      // Check if the user requesting the change is a CompanyAdmin or Admin within this company
      const isCompanyAdmin = company.workers.find(
        (worker) =>
          worker.userId.toString() === user._id &&
          worker.role === "CompanyAdmin"
      );
      if (!isCompanyAdmin && user.role !== "Admin") {
        return handleResponse(
          res,
          401,
          "error",
          "You are not authorized",
          null,
          0
        );
      }

      const targetUser = await Users.findById(userId).select(
        "-password -refreshTokens"
      );
      if (!targetUser) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Find the employer in the company's workers and update the role
      const worker = company.workers.find(
        (worker) => worker.userId.toString() === userId
      );
      if (!worker) {
        return handleResponse(
          res,
          404,
          "error",
          "Employer not found in this company",
          null,
          0
        );
      }

      worker.role = newRole;
      await company.save();

      // Notify the user about the role change
      const userDeviceTokens = targetUser.mobileToken || [];
      if (userDeviceTokens.length > 0) {
        const notification = {
          title: "Role Updated",
          body: `Your role has been updated to ${newRole}.`,
        };
        const info = { companyId, userId };
        sendNotification(userDeviceTokens, notification, info);
      }

      return handleResponse(
        res,
        200,
        "success",
        "Role updated successfully",
        company,
        1
      );
    } catch (error) {
      console.error("Error in changeEmployerRole function:", error);
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
  async addCompanyServices(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const {
        company_id,
        service_id,
        price,
        duration,
        status,
        image,
        description,
      } = req.body;

      // Validate required fields
      if (!company_id || !service_id || !description) {
        return handleResponse(
          res,
          400,
          "error",
          "company_id, service_id, and description are required fields",
          null,
          0
        );
      }

      // Check if the company exists
      const company = await Company.findById(company_id);
      if (!company) {
        return handleResponse(res, 404, "error", "Company not found", null, 0);
      }

      // Check if the user has the "Manager" role within the company
      const user = await Users.findById(req.user.id).select(
        "-password -refreshTokens"
      );
      const isManager = company.workers.some(
        (worker) =>
          worker.userId.toString() === user._id.toString() &&
          worker.role === "Manager"
      );

      if (!isManager) {
        return handleResponse(
          res,
          403,
          "error",
          "You are not authorized to add services",
          null,
          0
        );
      }

      // Create a new company service
      const newService = new CompanyServices({
        company_id,
        service_id,
        price,
        duration,
        status,
        image,
        description,
      });

      // Save the new service to the database
      await newService.save();

      return handleResponse(
        res,
        201,
        "success",
        "Company service added successfully",
        newService,
        1
      );
    } catch (error) {
      console.error("Error in addCompanyServices function:", error);
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

  async getUserCompanyStatus(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const userId = req.params.userId || req.user.id;

      // Find all companies where the user is a worker
      const companies = await Company.find({
        "workers.userId": userId,
      });

      if (!companies || companies.length === 0) {
        // Check if the user has any pending employment requests
        const pendingRequests = await CompanyEmploymentReq.find({
          requesterId: userId,
        }).populate("companyId", "name logo");

        // Return status information with pending requests
        return handleResponse(
          res,
          200,
          "success",
          "User is not employed in any company",
          {
            isEmployed: false,
            pendingRequests: pendingRequests.map((req) => ({
              companyId: req.companyId._id,
              companyName: req.companyId.name,
              companyLogo: req.companyId.logo,
              requestDate: req.createdAt,
              status: req.status, // Include the status with each request
            })),
            pendingRequestCount: pendingRequests.length,
          },
          1
        );
      }

      // Format company data with user's role in each company
      const employmentDetails = companies.map((company) => {
        const workerData = company.workers.find(
          (worker) => worker.userId.toString() === userId.toString()
        );

        return {
          companyId: company._id,
          companyName: company.name,
          companyLogo: company.logo,
          role: workerData.role || "Employee",
          isAdmin: workerData.isAdmin || false,
          joinedAt: workerData.joinedAt || company.createdAt,
        };
      });

      return handleResponse(
        res,
        200,
        "success",
        "User employment status retrieved successfully",
        {
          isEmployed: true,
          companies: employmentDetails,
          companyCount: employmentDetails.length,
        },
        1
      );
    } catch (error) {
      console.error("Error in getUserCompanyStatus function:", error);
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
  async cancelCompanyJoinRequest(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { companyId } = req.params;

      // Find company to ensure it exists
      const company = await Company.findById(companyId);
      if (!company) {
        return handleResponse(res, 404, "error", "Company not found", null, 0);
      }

      // Find the pending request by the current user for this company
      const existingRequest = await CompanyEmploymentReq.findOne({
        requesterId: req.user.id,
        companyId: companyId,
        status: "pending", // Only pending requests can be canceled
      });

      if (!existingRequest) {
        return handleResponse(
          res,
          404,
          "error",
          "No pending request found for this company",
          null,
          0
        );
      }

      // Delete the request
      await CompanyEmploymentReq.findByIdAndDelete(existingRequest._id);

      // Fetch all admins of the company for notifications
      const adminWorkers = company.workers.filter((worker) => worker.isAdmin);
      const adminUserIds = adminWorkers.map((worker) => worker.userId);

      // Fetch all admin users and their device tokens
      const adminUsers = await Users.find({
        _id: { $in: adminUserIds },
      }).select("-password -refreshTokens");
      const adminDeviceTokens = adminUsers.flatMap(
        (user) => user.mobileToken || []
      );

      // Send notifications to company admins
      if (adminDeviceTokens.length > 0) {
        const user = await Users.findById(req.user.id).select(
          "-password -refreshTokens"
        );
        const notification = {
          title: "Join Request Canceled",
          body: `${user.fullName} has canceled their employment request.`,
        };
        const info = {
          companyId: companyId,
          requesterId: req.user.id,
        };

        await sendNotification(adminDeviceTokens, notification, info);
      }

      return handleResponse(
        res,
        200,
        "success",
        "Employment request canceled successfully",
        null,
        1
      );
    } catch (error) {
      console.error("Error in cancelCompanyJoinRequest function:", error);
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
  // Add this method to your CompanyCTRL class
  async leaveCompany(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { companyId } = req.params;

      // Find company to ensure it exists
      const company = await Company.findById(companyId);
      if (!company) {
        return handleResponse(res, 404, "error", "Company not found", null, 0);
      }

      // Check if user is part of the company
      const isEmployed = company.workers.some(
        (worker) => worker.userId.toString() === req.user.id
      );

      if (!isEmployed) {
        return handleResponse(
          res,
          404,
          "error",
          "You are not employed in this company",
          null,
          0
        );
      }

      // Check if user is the only admin
      const isAdmin = company.workers.some(
        (worker) => worker.userId.toString() === req.user.id && worker.isAdmin
      );

      if (isAdmin) {
        const adminCount = company.workers.filter(
          (worker) => worker.isAdmin
        ).length;
        if (adminCount === 1) {
          return handleResponse(
            res,
            400,
            "error",
            "You are the only admin of this company. Please appoint another admin before leaving.",
            null,
            0
          );
        }
      }

      // Remove user from company workers
      company.workers = company.workers.filter(
        (worker) => worker.userId.toString() !== req.user.id
      );
      await company.save();

      // Notify company admins
      const adminWorkers = company.workers.filter((worker) => worker.isAdmin);
      const adminUserIds = adminWorkers.map((worker) => worker.userId);

      // Fetch all admin users and their device tokens
      const adminUsers = await Users.find({
        _id: { $in: adminUserIds },
      }).select("-password -refreshTokens");
      const adminDeviceTokens = adminUsers.flatMap(
        (user) => user.mobileToken || []
      );

      if (adminDeviceTokens.length > 0) {
        const user = await Users.findById(req.user.id).select(
          "-password -refreshTokens"
        );
        const notification = {
          title: "Employee Left Company",
          body: `${user.fullName} has left the company.`,
        };
        const info = {
          companyId: companyId,
          userId: req.user.id,
        };

        await sendNotification(adminDeviceTokens, notification, info);
      }

      return handleResponse(
        res,
        200,
        "success",
        "Successfully left the company",
        null,
        1
      );
    } catch (error) {
      console.error("Error in leaveCompany function:", error);
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
module.exports = new CompanyCTRL();
