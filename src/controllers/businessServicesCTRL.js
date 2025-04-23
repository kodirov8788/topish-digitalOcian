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
        tagIds,
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

      // Parse and validate `tagIds`
      // console.log("tagIds: ", tagIds);
      if (tagIds) {
        try {
          if (!Array.isArray(tagIds) || tagIds.length === 0) {
            return handleResponse(
              res,
              400,
              "error",
              "At least one tag ID is required.",
              null,
              0
            );
          }
        } catch (err) {
          return handleResponse(
            res,
            400,
            "error",
            "`tagIds` must be a valid JSON array.",
            null,
            0
          );
        }
      }

      // Create the new business service
      const newService = new BusinessService({
        company_id,
        tags: tagIds,
        title: title,
        sub_title: subTitle || "",
        description: description.trim(),
        price: price || "",
        currency: currency || "",
        duration: duration || "",
        status: status || "active",
        location: location || "",
        createdBy: req.user.id,
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
  // async getAll(req, res) {
  //     try {
  //       const { page = 1, limit = 10 } = req.query;

  //       const totalCount = await BusinessService.countDocuments();
  //       const skip = (page - 1) * parseInt(limit);

  //       const services = await BusinessService.aggregate([
  //         { $sample: { size: totalCount } }, // Shuffle all documents
  //         { $skip: skip },
  //         { $limit: parseInt(limit) },
  //         {
  //           $lookup: {
  //             from: "companies",
  //             localField: "company_id",
  //             foreignField: "_id",
  //             as: "company_id",
  //           },
  //         },
  //         { $unwind: "$company_id" },
  //         {
  //           $project: {
  //             "company_id.name": 1,
  //             "company_id.logo": 1,
  //             _id: 1,
  //             tags: 1,
  //             title: 1,
  //             sub_title: 1,
  //             description: 1,
  //             price: 1,
  //             currency: 1,
  //             duration: 1,
  //             status: 1,
  //             createdBy: 1,
  //           },
  //         },
  //         {
  //           $lookup: {
  //             from: "tags",
  //             localField: "tags",
  //             foreignField: "_id",
  //             as: "tags",
  //           },
  //         },
  //         {
  //           $lookup: {
  //             from: "users",
  //             localField: "createdBy",
  //             foreignField: "_id",
  //             as: "createdBy",
  //           },
  //         },
  //         { $unwind: "$createdBy" },
  //         {
  //           $project: {
  //             "createdBy.avatar": 1,
  //             "createdBy.phoneNumber": 1,
  //             "createdBy.fullName": 1,
  //             _id: 1,
  //             company_id: 1,
  //             tags: 1,
  //             title: 1,
  //             sub_title: 1,
  //             description: 1,
  //             price: 1,
  //             currency: 1,
  //             duration: 1,
  //             status: 1,
  //           },
  //         },
  //       ]);

  //       return handleResponse(
  //         res,
  //         200,
  //         "success",
  //         "Business services retrieved successfully.",
  //         {
  //           services,
  //           totalCount,
  //           totalPages: Math.ceil(totalCount / limit),
  //           currentPage: parseInt(page),
  //         },
  //         services.length
  //       );
  //     } catch (error) {
  //       console.error("Error in getAll:", error);
  //       return handleResponse(
  //         res,
  //         500,
  //         "error",
  //         "An error occurred while retrieving all business services.",
  //         null,
  //         0
  //       );
  //     }
  //   }

  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

      const services = await BusinessService.find()
        .sort(sort)
        .skip((page - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .populate({ path: "company_id", select: "name logo" })
        .populate({ path: "tags", select: "keyText" })
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
  // above code is old code

  async searchTagByParam(req, res) {
    try {
      const { tag } = req.query;
      const { page = 1, limit = 10 } = req.query;

      if (!tag) {
        return handleResponse(
          res,
          400,
          "error",
          "Tag parameter is required for searching.",
          null,
          0
        );
      }

      const services = await BusinessService.find({
        tags: { $regex: new RegExp(tag, "i") },
      })
        .skip((page - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .populate({ path: "company_id", select: "name logo" })
        .populate({ path: "tags", select: "keyText" })
        .populate({ path: "createdBy", select: "name email" });

      const totalCount = await BusinessService.countDocuments({
        tags: { $regex: new RegExp(tag, "i") },
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
        .populate({ path: "tags", select: "keyText" })
        .populate({ path: "createdBy", select: "name email" });

      if (!services || services.length === 0) {
        return handleResponse(
          res,
          404,
          "error",
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
        .populate({ path: "tags", select: "keyText" })
        .populate({ path: "createdBy", select: "name email" });

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

      // Update the service with provided fields
      // Object.keys(updates).forEach((key) => {
      //     service[key] = updates[key];
      // });

      service.title = updates.title || service.title;
      service.sub_title = updates.subTitle || service.sub_title;
      service.description = updates.description || service.description;
      service.price = updates.price || service.price;
      service.currency = updates.currency || service.currency;
      service.duration = updates.duration || service.duration;
      service.status = updates.status || service.status;
      service.tags = updates.tagIds || service.tags;
      service.location = updates.location || service.location;

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

      // Check if the user is authorized to delete the service
      // const company = await Company.findById(service.company_id);
      // const isAuthorized = company.createdBy.toString() === req.user.id;
      // if (!isAuthorized) {
      //     return handleResponse(
      //         res,
      //         403,
      //         "error",
      //         "You are not authorized to delete this service.",
      //         null,
      //         0
      //     );
      // }

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
        .populate({ path: "tags", select: "keyText" })
        .populate({ path: "createdBy", select: "fullName phoneNumber avatar" });

      if (!services || services.length === 0) {
        return handleResponse(
          res,
          404,
          "error",
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
  // write functions to get services by user id
  async getServicesByUserId(req, res) {
    try {
      const { id } = req.params;
      const services = await BusinessService.find({ createdBy: id })
        .populate({ path: "company_id", select: "name logo" })
        .populate({ path: "tags", select: "keyText" })
        .populate({ path: "createdBy", select: "fullName phoneNumber avatar" });

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
