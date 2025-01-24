// src/controllers/resumeCTRL/ExpectedSalaryCTRL.js
const Users = require("../../models/user_model"); // adjust path if needed
const { handleResponse } = require("../../utils/handleResponse");

class ExpectedSalaryController {
    // POST - Create (or set) the expected salary
    async addExpectedSalary(req, res) {
        if (!req.user) {
            return handleResponse(res, 401, "error", "Unauthorized");
        }

        try {
            // e.g., req.body = { expectedSalary: "1000 USD" }
            const { expectedSalary } = req.body;
            if (!expectedSalary) {
                return handleResponse(res, 400, "error", "expectedSalary is required");
            }

            const user = await Users.findById(req.user.id);
            if (!user) {
                return handleResponse(res, 404, "error", "User not found");
            }

            // Initialize resume if it doesn't exist
            if (!user.resume) {
                user.resume = {};
            }

            user.resume.expectedSalary = expectedSalary;
            await user.save();

            return handleResponse(
                res,
                201,
                "success",
                "Expected salary set",
                { expectedSalary: user.resume.expectedSalary }
            );
        } catch (error) {
            return handleResponse(res, 500, "error", error.message);
        }
    }

    // GET - Retrieve the current expected salary
    async getExpectedSalary(req, res) {
        if (!req.user) {
            return handleResponse(res, 401, "error", "Unauthorized");
        }

        try {
            const user = await Users.findById(req.user.id);
            if (!user) {
                return handleResponse(res, 404, "error", "User not found");
            }

            const salary = user.resume?.expectedSalary || "";
            return handleResponse(
                res,
                200,
                "success",
                "Expected salary retrieved",
                { expectedSalary: salary }
            );
        } catch (error) {
            return handleResponse(res, 500, "error", error.message);
        }
    }

    // PUT - Update the expected salary
    async updateExpectedSalary(req, res) {
        if (!req.user) {
            return handleResponse(res, 401, "error", "Unauthorized");
        }

        try {
            // e.g., req.body = { expectedSalary: "1200 USD" }
            const { expectedSalary } = req.body;
            if (!expectedSalary) {
                return handleResponse(res, 400, "error", "expectedSalary is required");
            }

            const user = await Users.findById(req.user.id);
            if (!user) {
                return handleResponse(res, 404, "error", "User not found");
            }

            if (!user.resume) {
                user.resume = {};
            }

            user.resume.expectedSalary = expectedSalary;
            await user.save();

            return handleResponse(
                res,
                200,
                "success",
                "Expected salary updated",
                { expectedSalary: user.resume.expectedSalary }
            );
        } catch (error) {
            return handleResponse(res, 500, "error", error.message);
        }
    }

    // DELETE - Remove or reset the expected salary field
    async deleteExpectedSalary(req, res) {
        if (!req.user) {
            return handleResponse(res, 401, "error", "Unauthorized");
        }

        try {
            const user = await Users.findById(req.user.id);
            if (!user) {
                return handleResponse(res, 404, "error", "User not found");
            }

            if (!user.resume) {
                user.resume = {};
            }

            // Reset to an empty string (or null if you prefer)
            user.resume.expectedSalary = "";
            await user.save();

            return handleResponse(
                res,
                200,
                "success",
                "Expected salary removed",
                { expectedSalary: user.resume.expectedSalary }
            );
        } catch (error) {
            return handleResponse(res, 500, "error", error.message);
        }
    }
}

module.exports = new ExpectedSalaryController();
