// src/controllers/resumeCTRL/SummaryCTRL.js
const Users = require("../../models/user_model"); // Update with the correct path to your model file
const { handleResponse } = require("../../utils/handleResponse");

class Summary {
  async addOrUpdateSummary(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized");
    }
    const { summary } = req.body;

    // Basic validation for the summary
    if (typeof summary !== "string") {
      return handleResponse(res, 400, "error", "Invalid or missing summary.");
    }

    try {
      // Find the user by ID
      const user = await Users.findById(req.user.id).select(
        "-password -refreshTokens"
      );

      if (!user) {
        return handleResponse(res, 404, "error", "User not found");
      }

      // Add or update the summary in the user's resume
      if (!user.resume) {
        user.resume = { summary };
      } else {
        user.resume.summary = summary;
      }

      // Save the user with the updated summary
      await user.save();

      handleResponse(
        res,
        200,
        "success",
        "Summary added/updated",
        user.resume.summary
      );
    } catch (error) {
      handleResponse(res, 500, "error", error.message);
    }
  }
}

module.exports = new Summary();
