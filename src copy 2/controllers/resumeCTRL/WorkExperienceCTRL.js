const Users = require("../../models/user_model"); // Update with the correct path to your model file
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const { handleResponse } = require("../../utils/handleResponse");

// Define a Joi schema for work experience validation
const workExperienceSchema = Joi.object({
  jobTitle: Joi.string().required(),
  company: Joi.string().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.when("current", {
    is: false, // Only require endDate when current is false
    then: Joi.date().iso().required(),
    otherwise: Joi.optional(), // Make endDate optional when current is true
  }),
  current: Joi.boolean().allow(false),
  description: Joi.string().allow("", null),
  employmentType: Joi.string().required(),
  location: Joi.string().required(),
});

function validateWorkExperience(data) {
  return workExperienceSchema.validate(data);
}

class WorkExperience {
  async addWorkExperience(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized");
    }

    // Validate the incoming work experience data using Joi
    const { error } = validateWorkExperience(req.body);

    if (error) {
      return handleResponse(res, 400, "error", error.details[0].message);
    }

    try {
      // Find the user by ID
      const user = await Users.findById(req.user.id);

      if (!user) {
        return handleResponse(res, 404, "error", "User not found");
      }

      const newWorkExperience = { ...req.body, id: uuidv4() };

      // Add the new work experience with a UUID to the user's resume
      if (!user.resume) {
        user.resume = { workExperience: [newWorkExperience] };
      } else {
        user.resume.workExperience.push(newWorkExperience);
      }

      // Save the user with the updated work experience
      await user.save();

      handleResponse(
        res,
        201,
        "success",
        "Work experience added",
        newWorkExperience
      );
    } catch (error) {
      handleResponse(res, 500, "error", error.message);
    }
  }

  async getWorkExperience(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized");
    }

    try {
      // Find the user by ID
      const user = await Users.findById(req.user.id);

      if (!user) {
        return handleResponse(res, 404, "error", "User not found");
      }

      if (!user.resume || !user.resume.workExperience) {
        return handleResponse(res, 404, "error", "Work experience not found");
      }

      // Send the workExperience array as the response
      handleResponse(
        res,
        200,
        "success",
        "Work experience retrieved",
        user.resume.workExperience
      );
    } catch (error) {
      handleResponse(res, 500, "error", error.message);
    }
  }

  async updateWorkExperience(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized");
    }
    const { id } = req.params;
    const updateData = req.body; // The updated data for the work experience

    // Validate the updateData using the schema
    const { error } = workExperienceSchema.validate(updateData);
    if (error) {
      return handleResponse(res, 400, "error", error.details[0].message);
    }

    try {
      // Find the user by ID
      const user = await Users.findById(req.user.id);

      if (!user) {
        return handleResponse(res, 404, "error", "User not found");
      }

      if (!user.resume || !user.resume.workExperience) {
        return handleResponse(res, 404, "error", "Work experience not found");
      }

      // Find the specific work experience entry by UUID and update it
      const workExperienceEntryIndex = user.resume.workExperience.findIndex(
        (entry) => entry.id === id
      );
      if (workExperienceEntryIndex === -1) {
        return handleResponse(
          res,
          404,
          "error",
          "Work experience entry not found"
        );
      }

      // Update the fields of the work experience entry
      user.resume.workExperience[workExperienceEntryIndex] = {
        ...user.resume.workExperience[workExperienceEntryIndex],
        ...updateData,
      };

      // Save the updated user
      await user.save();

      // Send the updated workExperience entry as the response
      handleResponse(
        res,
        200,
        "success",
        "Work experience updated",
        user.resume.workExperience[workExperienceEntryIndex]
      );
    } catch (error) {
      handleResponse(res, 500, "error", error.message);
    }
  }

  async deleteWorkExperience(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized");
    }
    const { id } = req.params; // Assuming you pass the UUID of the work experience as a URL parameter
    try {
      // Find the user by ID
      const user = await Users.findById(req.user.id);

      if (!user) {
        return handleResponse(res, 404, "error", "User not found");
      }

      if (!user.resume || !user.resume.workExperience) {
        return handleResponse(res, 404, "error", "Work experience not found");
      }

      // Find the index of the specific work experience entry by UUID
      const workExperienceEntryIndex = user.resume.workExperience.findIndex(
        (entry) => entry.id === id
      );
      if (workExperienceEntryIndex === -1) {
        return handleResponse(
          res,
          404,
          "error",
          "Work experience entry not found"
        );
      }

      // Remove the work experience entry from the array
      user.resume.workExperience.splice(workExperienceEntryIndex, 1);

      // Save the updated user
      await user.save();

      // Send a success response
      handleResponse(
        res,
        200,
        "success",
        "Work experience entry successfully deleted",
        {
          message: "Work experience entry successfully deleted",
        }
      );
    } catch (error) {
      handleResponse(res, 500, "error", error.message);
    }
  }
}

module.exports = new WorkExperience();
