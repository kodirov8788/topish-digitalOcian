const Users = require("../../models/user_model"); // Update with the correct path to your model file
const { handleResponse } = require("../../utils/handleResponse");

class Professions {
  async addOrUpdateProfessions(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized");
    }
    const { professions } = req.body;

    // Basic validation for skills
    if (!Array.isArray(professions)) {
      return handleResponse(
        res,
        400,
        "error",
        "Invalid or missing Professions."
      );
    }

    try {
      // Find the user by ID
      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found");
      }

      // Check if the user has the 'JobSeeker' role
      if (user.role !== "JobSeeker") {
        return handleResponse(
          res,
          403,
          "error",
          "This operation is only allowed for JobSeekers."
        );
      }

      // Ensure jobSeeker field is not null
      if (!user.jobSeeker) {
        return handleResponse(res, 404, "error", "JobSeeker profile not found");
      }

      // Update the skills in the user's jobSeeker profile
      user.jobSeeker.professions = professions;

      // Save the user with the updated jobSeeker skills
      await user.save();
      handleResponse(
        res,
        200,
        "success",
        "Professions updated",
        user.jobSeeker.professions,
        user.jobSeeker.professions.length
      );
    } catch (error) {
      handleResponse(res, 500, "error", error.message);
    }
  }
}

module.exports = new Professions();
