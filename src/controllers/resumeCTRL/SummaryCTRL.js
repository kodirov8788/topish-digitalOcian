const Resume = require("../../models/resume_model"); // Update with the correct path to your model file
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
      const user = await Users.findById(req.user.id);

      if (!user) {
        return handleResponse(res, 404, "error", "User not found");
      }

      // Find the resume by resumeId
      const resume = await Resume.findById(user.resumeId);

      if (!resume) {
        // If the resume doesn't exist, create a new one and link it to the user
        const newResume = new Resume({
          summary,
        });
        await newResume.save();
        user.resumeId = newResume._id;
        await user.save();
        handleResponse(res, 201, "success", "Summary added", newResume.summary);
      } else {
        // Update the summary in the user's resume
        resume.summary = summary;

        // Save the resume with the updated summary
        await resume.save();

        handleResponse(res, 200, "success", "Summary updated", resume.summary);
      }
    } catch (error) {
      handleResponse(res, 500, "error", error.message);
    }
  }
}

module.exports = new Summary();
