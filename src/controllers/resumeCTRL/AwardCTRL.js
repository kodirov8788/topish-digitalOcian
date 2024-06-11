const Resume = require("../../models/resume_model"); // Update with the correct path to your model file
const Users = require("../../models/user_model"); // Update with the correct path to your model file
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const { handleResponse } = require("../../utils/handleResponse");
const awardSchema = Joi.object({
  title: Joi.string().required(),
  issuer: Joi.string().required(),
  dateAwarded: Joi.date().iso().required(),
  description: Joi.string().allow("", null),
});
validateAddAward = (data) => {
  return awardSchema.validate(data);
};
validateUpdateAward = (data) => {
  return awardSchema.validate(data);
};
class Award {
  // POST - Create a new award entry
  async addAward(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }
    try {
      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const resume = await Resume.findById(user.resumeId);
      if (!resume) {
        const newResume = new Resume({
          awards: [{ ...req.body, id: uuidv4() }],
        });
        await newResume.save();
        user.resumeId = newResume._id;
        await user.save();
        return handleResponse(
          res,
          201,
          "success",
          "New resume created with awards",
          newResume.awards,
          newResume.awards.length
        );
      }

      const { error } = validateAddAward(req.body);
      if (error) {
        return handleResponse(
          res,
          400,
          "error",
          error.details[0].message,
          null,
          0
        );
      }

      resume.awards.push({ ...req.body, id: uuidv4() });
      await resume.save();
      return handleResponse(
        res,
        201,
        "success",
        "Award added successfully",
        resume.awards,
        resume.awards.length
      );
    } catch (error) {
      console.error(error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while adding the award",
        null,
        0
      );
    }
  }
  // GET - Retrieve award entries for a user
  async getAwards(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }

    try {
      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const resume = await Resume.findById(user.resumeId);
      if (!resume) {
        return handleResponse(res, 404, "error", "Resume not found", null, 0);
      }

      // Send the awards array as the response
      return handleResponse(
        res,
        200,
        "success",
        "Awards retrieved successfully",
        resume.awards,
        resume.awards.length
      );
    } catch (error) {
      console.error(error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while retrieving awards",
        null,
        0
      );
    }
  }
  // PUT - Update a specific award entry
  async updateAward(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }
    const { id } = req.params;
    const updateData = req.body; // The updated data for the award

    try {
      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const resume = await Resume.findById(user.resumeId);
      if (!resume) {
        return handleResponse(res, 404, "error", "Resume not found", null, 0);
      }

      const awardIndex = resume.awards.findIndex((award) => award.id === id);
      if (awardIndex === -1) {
        return handleResponse(res, 404, "error", "Award not found", null, 0);
      }

      // Validate the incoming data
      const { error } = validateUpdateAward(updateData);
      if (error) {
        return handleResponse(
          res,
          400,
          "error",
          error.details[0].message,
          null,
          0
        );
      }

      resume.awards[awardIndex] = {
        ...resume.awards[awardIndex],
        ...updateData,
      };
      await resume.save();

      return handleResponse(
        res,
        200,
        "success",
        "Award updated successfully",
        resume.awards[awardIndex],
        1
      );
    } catch (error) {
      console.error(error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while updating the award",
        null,
        0
      );
    }
  }
  // DELETE - Remove a specific award entry
  async deleteAward(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }
    const { id } = req.params;

    try {
      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const resume = await Resume.findById(user.resumeId);
      if (!resume) {
        return handleResponse(res, 404, "error", "Resume not found", null, 0);
      }

      const awardIndex = resume.awards.findIndex((award) => award.id === id);
      if (awardIndex === -1) {
        return handleResponse(res, 404, "error", "Award not found", null, 0);
      }

      resume.awards.splice(awardIndex, 1);
      await resume.save();

      return handleResponse(
        res,
        200,
        "success",
        "Award successfully deleted",
        null,
        0
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while deleting the award",
        null,
        0
      );
    }
  }
}

module.exports = new Award();
