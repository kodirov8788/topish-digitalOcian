const BusinessService = require("../models/business_services_model");
const Company = require("../models/company_model");
const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");

class BusinessServicesCTRL {
  async createBusinessService(req, res) {
    try {
      // Ensure the user is authenticated
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const {
        company_id,
        category,
        title,
        subTitle,
        description,
        price,
        duration,
        status,
        currency,
        location,
      } = req.body;

      // Validate required fields
      if (!company_id || !title || !description) {
        return handleResponse(
          res,
          400,
          "error",
          "Company ID, service ID, title, and description are required.",
          null,
          0
        );
      }

      const company = await Company.findById(company_id);

      // Ensure the company exists
      if (!company) {
        return handleResponse(res, 404, "error", "Company not found.", null, 0);
      }

      // Parse and validate `category`
      if (!category || typeof category !== "string" || category.trim() === "") {
        return handleResponse(
          res,
          400,
          "error",
          "Category is required and must be a non-empty string.",
          null,
          0
        );
      }

      // Create the new business service
      const newService = new BusinessService({
        company_id,
        category: category.trim(),
        title: title,
        sub_title: subTitle || "",
        description: description.trim(),
        price: price || "",
        currency: currency || "",
        duration: duration || "",
        status: status || "active",
        location: location || "",
        createdBy: req.user.id,
        // service_id, image are optional and not required for creation
      });

      const savedService = await newService.save();

      return handleResponse(
        res,
        201,
        "success",
        "Business service created successfully.",
        savedService,
        1
      );
    } catch (error) {
      console.error("Error in createBusinessService:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while creating the business service.",
        null,
        0
      );
    }
  }

  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

      const services = await BusinessService.find()
        .sort(sort)
        .skip((page - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .populate({ path: "company_id", select: "name logo" })
        .populate({ path: "createdBy", select: "avatar phoneNumber fullName" });

      const totalCount = await BusinessService.countDocuments();

      return handleResponse(
        res,
        200,
        "success",
        "Business services retrieved successfully.",
        {
          services,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: parseInt(page),
        },
        services.length
      );
    } catch (error) {
      console.error("Error in getAll:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while retrieving all business services.",
        null,
        0
      );
    }
  }

  async searchTagByParam(req, res) {
    try {
      const { category } = req.query;
      const { page = 1, limit = 10 } = req.query;

      if (!category || typeof category !== "string" || !category.trim()) {
        return handleResponse(
          res,
          400,
          "error",
          "Category parameter is required for searching.",
          null,
          0
        );
      }

      const services = await BusinessService.find({
        category: { $regex: new RegExp(category, "i") },
      })
        .skip((page - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .populate({ path: "company_id", select: "name logo" })
        .populate({ path: "createdBy", select: "avatar phoneNumber fullName" });

      const totalCount = await BusinessService.countDocuments({
        category: { $regex: new RegExp(category, "i") },
      });

      return handleResponse(
        res,
        200,
        "success",
        "Search results retrieved successfully.",
        {
          services,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: parseInt(page),
        },
        services.length
      );
    } catch (error) {
      console.error("Error in searchTagByParam:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while searching business services.",
        null,
        0
      );
    }
  }

  async getBusinessServices(req, res) {
    try {
      const { company_id } = req.params;

      const services = await BusinessService.find({ company_id })
        .populate({ path: "company_id", select: "name logo" })
        .populate({ path: "createdBy", select: "avatar phoneNumber fullName" });

      if (services.length === 0) {
        return handleResponse(
          res,
          200,
          "success",
          "No business services found for this company.",
          [],
          0
        );
      }

      return handleResponse(
        res,
        200,
        "success",
        "Business services retrieved successfully.",
        services,
        services.length
      );
    } catch (error) {
      console.error("Error in getBusinessServices:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while retrieving business services.",
        null,
        0
      );
    }
  }

  async getBusinessServiceById(req, res) {
    try {
      const { id } = req.params;

      const service = await BusinessService.findById(id)
        .populate({ path: "company_id", select: "name logo" })
        .populate({ path: "createdBy", select: "avatar phoneNumber fullName" });

      if (!service) {
        return handleResponse(
          res,
          404,
          "error",
          "Business service not found.",
          null,
          0
        );
      }

      return handleResponse(
        res,
        200,
        "success",
        "Business service retrieved successfully.",
        service,
        1
      );
    } catch (error) {
      console.error("Error in getBusinessServiceById:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while retrieving the business service.",
        null,
        0
      );
    }
  }

  async updateBusinessService(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { id } = req.params;
      const updates = req.body;

      const service = await BusinessService.findById(id);

      if (!service) {
        return handleResponse(
          res,
          404,
          "error",
          "Business service not found.",
          null,
          0
        );
      }

      // Check if the user is authorized to update the service
      const company = await Company.findById(service.company_id);
      const isAuthorized = company.createdBy.toString() === req.user.id;
      if (!isAuthorized) {
        return handleResponse(
          res,
          403,
          "error",
          "You are not authorized to update this service.",
          null,
          0
        );
      }

      service.title = updates.title || service.title;
      service.sub_title = updates.subTitle || service.sub_title;
      service.description = updates.description || service.description;
      service.price = updates.price || service.price;
      service.currency = updates.currency || service.currency;
      service.duration = updates.duration || service.duration;
      service.status = updates.status || service.status;
      if (typeof updates.category === "string" && updates.category.trim()) {
        service.category = updates.category.trim();
      }
      service.location = updates.location || service.location;
      // service_id, image are not updated here

      const updatedService = await service.save();

      return handleResponse(
        res,
        200,
        "success",
        "Business service updated successfully.",
        updatedService,
        1
      );
    } catch (error) {
      console.error("Error in updateBusinessService:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while updating the business service.",
        null,
        0
      );
    }
  }

  async deleteBusinessService(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { id } = req.params;

      const service = await BusinessService.findById(id);

      if (!service) {
        return handleResponse(
          res,
          404,
          "error",
          "Business service not found.",
          null,
          0
        );
      }

      await service.deleteOne();

      return handleResponse(
        res,
        200,
        "success",
        "Business service deleted successfully.",
        null,
        1
      );
    } catch (error) {
      console.error("Error in deleteBusinessService:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while deleting the business service.",
        null,
        0
      );
    }
  }

  async getMyBusinessServices(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const services = await BusinessService.find({ createdBy: req.user.id })
        .populate({ path: "company_id", select: "name logo" })
        .populate({ path: "createdBy", select: "avatar phoneNumber fullName" });

      if (services.length === 0) {
        return handleResponse(
          res,
          200,
          "success",
          "No business services found for this company.",
          [],
          0
        );
      }
      return handleResponse(
        res,
        200,
        "success",
        "User services retrieved successfully",
        services,
        services.length
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Internal server error",
        null,
        0
      );
    }
  }

  async getServicesByUserId(req, res) {
    try {
      const { id } = req.params;
      const services = await BusinessService.find({ createdBy: id })
        .populate({ path: "company_id", select: "name logo" })
        .populate({ path: "createdBy", select: "avatar phoneNumber fullName" });

      if (!services || services.length === 0) {
        return handleResponse(
          res,
          200,
          "success",
          "No business services found for this user",
          [],
          0
        );
      }
      return handleResponse(
        res,
        200,
        "success",
        "User services retrieved successfully",
        services,
        services.length
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Internal server error",
        null,
        0
      );
    }
  }
}

module.exports = new BusinessServicesCTRL();
