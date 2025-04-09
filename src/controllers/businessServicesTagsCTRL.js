// src/controllers/businessServicesTagsCTRL.js
const Business_servicesTags = require("../models/business_servicesTags_model");
const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");

class BusinessServicesTagsCTRL {
  // Create a new tag
  async createTag(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findById(req.user.id).select(
        "-password -refreshTokens"
      );

      if (!user) {
        return handleResponse(res, 404, "error", "User not found.", null, 0);
      }

      const { keyText, countryCode, languages } = req.body;

      if (!languages || !Array.isArray(languages) || languages.length === 0) {
        return handleResponse(
          res,
          400,
          "error",
          "Languages are required.",
          null,
          0
        );
      }

      // Validate `keyText` for all specified languages
      for (const lang of languages) {
        if (!keyText?.[lang]) {
          return handleResponse(
            res,
            400,
            "error",
            `KeyText must include all specified languages: ${languages.join(
              ", "
            )}.`,
            null,
            0
          );
        }
      }

      // Construct tag data
      const tagData = {
        keyText: [{ translations: new Map(Object.entries(keyText)) }],
        countryCode,
        languages,
        createdBy: user._id,
      };

      const tag = await Business_servicesTags.create(tagData);

      return handleResponse(
        res,
        201,
        "success",
        "Tag created successfully.",
        tag,
        1
      );
    } catch (error) {
      console.error("Error in createTag function:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while creating the tag.",
        null,
        0
      );
    }
  }
  // Get all tags with pagination
  async getAllTags(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const tags = await Business_servicesTags.find()
        .skip((page - 1) * parseInt(limit))
        .limit(parseInt(limit));

      const totalCount = await Business_servicesTags.countDocuments();

      return handleResponse(
        res,
        200,
        "success",
        "Tags fetched successfully.",
        tags,
        totalCount
      );
    } catch (error) {
      console.error("Error in getAllTags function:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while fetching tags.",
        null,
        0
      );
    }
  }
  // Get a single tag by ID
  async getTagById(req, res) {
    try {
      const { id } = req.params;

      const tag = await Business_servicesTags.findById(id);
      if (!tag) {
        return handleResponse(res, 404, "error", "Tag not found.", null, 0);
      }

      return handleResponse(
        res,
        200,
        "success",
        "Tag retrieved successfully.",
        tag,
        1
      );
    } catch (error) {
      console.error("Error in getTagById function:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while retrieving the tag.",
        null,
        0
      );
    }
  }
  // Update a tag
  async updateTag(req, res) {
    try {
      const { id } = req.params;

      const tag = await Business_servicesTags.findById(id);
      if (!tag) {
        return handleResponse(res, 404, "error", "Tag not found.", null, 0);
      }

      if (req.user.id !== tag.createdBy.toString()) {
        return handleResponse(
          res,
          403,
          "error",
          "You are not allowed to update this tag.",
          null,
          0
        );
      }

      const { keyText, countryCode, languages } = req.body;

      if (keyText) {
        const updatedLanguages = languages || tag.languages;
        for (const lang of updatedLanguages) {
          if (!keyText?.[lang]) {
            return handleResponse(
              res,
              400,
              "error",
              `KeyText must include all specified languages: ${updatedLanguages.join(
                ", "
              )}.`,
              null,
              0
            );
          }
        }
        tag.keyText = [{ translations: new Map(Object.entries(keyText)) }];
      }

      if (countryCode) {
        tag.countryCode = countryCode;
      }

      if (languages) {
        tag.languages = languages;
      }

      await tag.save();

      return handleResponse(
        res,
        200,
        "success",
        "Tag updated successfully.",
        tag,
        1
      );
    } catch (error) {
      console.error("Error in updateTag function:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while updating the tag.",
        null,
        0
      );
    }
  }
  // Delete a tag
  async deleteTag(req, res) {
    try {
      const { id } = req.params;

      const tag = await Business_servicesTags.findById(id);
      if (!tag) {
        return handleResponse(res, 404, "error", "Tag not found.", null, 0);
      }

      // if (req.user.id !== tag.createdBy.toString()) {
      //   return handleResponse(
      //     res,
      //     403,
      //     "error",
      //     "You are not allowed to delete this tag.",
      //     null,
      //     0
      //   );
      // }

      await Business_servicesTags.findByIdAndDelete(id);

      return handleResponse(
        res,
        200,
        "success",
        "Tag deleted successfully.",
        null,
        0
      );
    } catch (error) {
      console.error("Error in deleteTag function:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while deleting the tag.",
        null,
        0
      );
    }
  }
  // Search tags by keyText
  async searchTags(req, res) {
    try {
      const { query, page = 1, limit = 10 } = req.query;

      if (!query) {
        return handleResponse(
          res,
          400,
          "error",
          "Search query is required.",
          null,
          0
        );
      }

      const searchQuery = {
        "keyText.translations": { $regex: query, $options: "i" }, // Search in any language
      };

      const tags = await Business_servicesTags.find(searchQuery)
        .skip((page - 1) * parseInt(limit))
        .limit(parseInt(limit));

      const totalCount = await Business_servicesTags.countDocuments(
        searchQuery
      );

      return handleResponse(
        res,
        200,
        "success",
        "Search results fetched successfully.",
        { tags, totalCount },
        tags.length
      );
    } catch (error) {
      console.error("Error in searchTags function:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while searching tags.",
        null,
        0
      );
    }
  }
}

module.exports = new BusinessServicesTagsCTRL();
