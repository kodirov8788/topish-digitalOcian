const Users = require("../../models/user_model"); // Adjust as needed
const { handleResponse } = require("../../utils/handleResponse");

class SearchJobCTRL {
    // POST - Set searchJob to true
    async setSearchJobTrue(req, res) {
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

            user.resume.searchJob = true;
            await user.save();

            return handleResponse(res, 200, "success", "searchJob set to true", {
                searchJob: user.resume.searchJob,
            });
        } catch (error) {
            return handleResponse(res, 500, "error", error.message);
        }
    }

    // POST - Set searchJob to false
    async setSearchJobFalse(req, res) {
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

            user.resume.searchJob = false;
            await user.save();

            return handleResponse(res, 200, "success", "searchJob set to false", {
                searchJob: user.resume.searchJob,
            });
        } catch (error) {
            return handleResponse(res, 500, "error", error.message);
        }
    }
}

module.exports = new SearchJobCTRL();
