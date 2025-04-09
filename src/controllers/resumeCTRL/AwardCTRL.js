// src/controllers/resumeCTRL/AwardCTRL.js
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

const validateAddAward = (data) => {
  return awardSchema.validate(data);
};

const validateUpdateAward = (data) => {
  return awardSchema.validate(data);
};

class Award {
  // POST - Create a new award entry
  async addAward(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }
    try {
      const user = await Users.findById(req.user.id).select(
        "-password -refreshTokens"
      );
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
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

      const newAward = { ...req.body, id: uuidv4() };

      if (!user.resume) {
        user.resume = { awards: [newAward] };
      } else {
        user.resume.awards.push(newAward);
      }

      await user.save();
      return handleResponse(
        res,
        201,
        "success",
        "Award added successfully",
        newAward,
        1
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
      const user = await Users.findById(req.user.id).select(
        "-password -refreshTokens"
      );
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      if (!user.resume || !user.resume.awards) {
        return handleResponse(res, 404, "error", "Awards not found", null, 0);
      }

      return handleResponse(
        res,
        200,
        "success",
        "Awards retrieved successfully",
        user.resume.awards,
        user.resume.awards.length
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
      const user = await Users.findById(req.user.id).select(
        "-password -refreshTokens"
      );
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      if (!user.resume || !user.resume.awards) {
        return handleResponse(res, 404, "error", "Awards not found", null, 0);
      }

      const awardIndex = user.resume.awards.findIndex(
        (award) => award.id === id
      );
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

      user.resume.awards[awardIndex] = {
        ...user.resume.awards[awardIndex],
        ...updateData,
      };
      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Award updated successfully",
        user.resume.awards[awardIndex],
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
      const user = await Users.findById(req.user.id).select(
        "-password -refreshTokens"
      );
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      if (!user.resume || !user.resume.awards) {
        return handleResponse(res, 404, "error", "Awards not found", null, 0);
      }

      const awardIndex = user.resume.awards.findIndex(
        (award) => award.id === id
      );
      if (awardIndex === -1) {
        return handleResponse(res, 404, "error", "Award not found", null, 0);
      }

      user.resume.awards.splice(awardIndex, 1);
      await user.save();

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
