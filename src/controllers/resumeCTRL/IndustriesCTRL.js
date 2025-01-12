const Users = require("../../models/user_model"); // Update path if needed
const { v4: uuidv4 } = require("uuid");
const { handleResponse } = require("../../utils/handleResponse");

class Industries {
    // POST - Create/Add a new industry item
    async addIndustry(req, res) {
        if (!req.user) {
            return handleResponse(res, 401, "error", "Unauthorized");
        }

        try {
            // Find the user by ID
            const user = await Users.findById(req.user.id);
            if (!user) {
                return handleResponse(res, 404, "error", "User not found");
            }

            // Example body might be: { name: "Tech" }
            const newIndustry = {
                ...req.body,
                id: uuidv4(), // unique ID
            };

            // Make sure resume exists
            if (!user.resume) {
                user.resume = { industry: [newIndustry] };
            } else if (!Array.isArray(user.resume.industry)) {
                user.resume.industry = [newIndustry];
            } else {
                user.resume.industry.push(newIndustry);
            }

            await user.save();

            return handleResponse(res, 201, "success", "Industry added", newIndustry);
        } catch (error) {
            return handleResponse(res, 500, "error", error.message);
        }
    }

    // GET - Retrieve all industry items
    async getIndustries(req, res) {
        if (!req.user) {
            return handleResponse(res, 401, "error", "Unauthorized");
        }

        try {
            const user = await Users.findById(req.user.id);
            if (!user) {
                return handleResponse(res, 404, "error", "User not found");
            }

            // If resume or resume.industry is not present or empty
            if (!user.resume || !Array.isArray(user.resume.industry)) {
                return handleResponse(res, 404, "error", "No industries found");
            }

            return handleResponse(
                res,
                200,
                "success",
                "Industries retrieved",
                user.resume.industry,
                user.resume.industry.length
            );
        } catch (error) {
            return handleResponse(res, 500, "error", error.message);
        }
    }

    // PUT - Update a specific industry entry by UUID
    async updateIndustry(req, res) {
        if (!req.user) {
            return handleResponse(res, 401, "error", "Unauthorized");
        }

        const { id } = req.params; // industry ID from URL
        const updateData = req.body;

        try {
            const user = await Users.findById(req.user.id);
            if (!user) {
                return handleResponse(res, 404, "error", "User not found");
            }

            if (!user.resume || !Array.isArray(user.resume.industry)) {
                return handleResponse(res, 404, "error", "No industries found");
            }

            // Find the index of the industry object we want to update
            const index = user.resume.industry.findIndex(
                (item) => item.id === id
            );

            if (index === -1) {
                return handleResponse(res, 404, "error", "Industry not found");
            }

            // Merge existing item with new data
            user.resume.industry[index] = {
                ...user.resume.industry[index],
                ...updateData,
            };

            await user.save();

            return handleResponse(
                res,
                200,
                "success",
                "Industry updated",
                user.resume.industry[index]
            );
        } catch (error) {
            return handleResponse(res, 500, "error", error.message);
        }
    }

    // DELETE - Remove a specific industry entry by UUID
    async deleteIndustry(req, res) {
        if (!req.user) {
            return handleResponse(res, 401, "error", "Unauthorized");
        }

        const { id } = req.params; // industry ID from URL

        try {
            const user = await Users.findById(req.user.id);
            if (!user) {
                return handleResponse(res, 404, "error", "User not found");
            }

            if (!user.resume || !Array.isArray(user.resume.industry)) {
                return handleResponse(res, 404, "error", "No industries found");
            }

            // Find the index of the industry object to remove
            const index = user.resume.industry.findIndex((item) => item.id === id);

            if (index === -1) {
                return handleResponse(res, 404, "error", "Industry not found");
            }

            // Remove item from array
            user.resume.industry.splice(index, 1);
            await user.save();

            return handleResponse(
                res,
                200,
                "success",
                "Industry deleted successfully",
                { message: "Industry deleted" }
            );
        } catch (error) {
            return handleResponse(res, 500, "error", error.message);
        }
    }
}

// Export as singleton
module.exports = new Industries();
