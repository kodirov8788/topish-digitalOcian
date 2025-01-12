// src/controllers/businessServicesCTRL.js
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

            const { company_id, tagIds, title, subTitle, description, price, duration, status } = req.body;

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

            // Verify if the user is authorized to add business services for the company
            if (company.createdBy.toString() !== req.user.id) {
                return handleResponse(
                    res,
                    403,
                    "error",
                    "You are not authorized to add services for this company.",
                    null,
                    0
                );
            }

            // Parse and validate `tagIds`
            let parsedTagIds = [];
            if (tagIds) {
                try {
                    parsedTagIds = JSON.parse(tagIds); // Assuming `tagIds` is sent as a JSON array
                    if (!Array.isArray(parsedTagIds) || parsedTagIds.length === 0) {
                        return handleResponse(res, 400, "error", "At least one tag ID is required.", null, 0);
                    }
                } catch (err) {
                    return handleResponse(res, 400, "error", "`tagIds` must be a valid JSON array.", null, 0);
                }
            }

            // Convert title and subTitle to JSON strings for storage
            const serializedTitle = JSON.stringify(title);
            const serializedSubTitle = JSON.stringify(subTitle);

            // Create the new business service
            const newService = new BusinessService({
                company_id,
                tags: parsedTagIds,
                title: serializedTitle,
                sub_title: serializedSubTitle || "",
                description: description.trim(),
                price: price || 0,
                duration: duration || "",
                status: status || "active",
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
                .populate("company_id", "name")
                .populate("tags", "name");

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
                .populate("company_id", "name")
                .populate("tags", "name");

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


    // Get all business services for a company
    async getBusinessServices(req, res) {
        try {
            const { company_id } = req.params;

            const services = await BusinessService.find({ company_id });

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

    // Get a single business service
    async getBusinessServiceById(req, res) {
        try {
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

    // Update a business service
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
            Object.keys(updates).forEach((key) => {
                service[key] = updates[key];
            });

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

    // Delete a business service
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
            const company = await Company.findById(service.company_id);
            const isAuthorized = company.createdBy.toString() === req.user.id;
            if (!isAuthorized) {
                return handleResponse(
                    res,
                    403,
                    "error",
                    "You are not authorized to delete this service.",
                    null,
                    0
                );
            }

            await service.remove();

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
}

module.exports = new BusinessServicesCTRL();
