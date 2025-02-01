// src/controllers/discoverTagsCTRL.js
const DiscoverTag = require("../models/discoverTags_model");
const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");

class DiscoverTagsCTRL {
  // Create a new tag
  async createTag(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found.", null, 0);
      }

      const { keyText } = req.body;
      if (!keyText) {
        return handleResponse(res, 400, "error", "Both keyText and language are required.", null, 0);
      }

      const tag = await DiscoverTag.create({
        keyText,
        createdBy: user._id,
      });

      return handleResponse(res, 201, "success", "Tag created successfully.", tag, 1);
    } catch (error) {
      console.error("Error in createTag function:", error);
      return handleResponse(res, 500, "error", "An error occurred while creating the tag.", null, 0);
    }
  }

  // Get all tags with pagination
  async getAllTags(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const tags = await DiscoverTag.find()
        .skip((page - 1) * parseInt(limit))
        .limit(parseInt(limit));
      const totalCount = await DiscoverTag.countDocuments();
      return handleResponse(res, 200, "success", "Tags fetched successfully.", { tags, totalCount }, tags.length);
    } catch (error) {
      console.error("Error in getAllTags function:", error);
      return handleResponse(res, 500, "error", "An error occurred while fetching tags.", null, 0);
    }
  }

  // Get a single tag by ID
  async getTagById(req, res) {
    try {
      const { id } = req.params;
      const tag = await DiscoverTag.findById(id);
      if (!tag) {
        return handleResponse(res, 404, "error", "Tag not found.", null, 0);
      }
      return handleResponse(res, 200, "success", "Tag retrieved successfully.", tag, 1);
    } catch (error) {
      console.error("Error in getTagById function:", error);
      return handleResponse(res, 500, "error", "An error occurred while retrieving the tag.", null, 0);
    }
  }

  // Update a tag
  async updateTag(req, res) {
    try {
      const { id } = req.params;
      const { keyText } = req.body;
      const tag = await DiscoverTag.findById(id);
      if (!tag) {
        return handleResponse(res, 404, "error", "Tag not found.", null, 0);
      }
      if (req.user.id !== tag.createdBy.toString()) {
        return handleResponse(res, 403, "error", "You are not allowed to update this tag.", null, 0);
      }
      if (keyText) tag.keyText = keyText;
      await tag.save();
      return handleResponse(res, 200, "success", "Tag updated successfully.", tag, 1);
    } catch (error) {
      console.error("Error in updateTag function:", error);
      return handleResponse(res, 500, "error", "An error occurred while updating the tag.", null, 0);
    }
  }

  // Delete a tag
  async deleteTag(req, res) {
    try {
      const { id } = req.params;
      const tag = await DiscoverTag.findById(id);
      if (!tag) {
        return handleResponse(res, 404, "error", "Tag not found.", null, 0);
      }
      await DiscoverTag.findByIdAndDelete(id);
      return handleResponse(res, 200, "success", "Tag deleted successfully.", null, 0);
    } catch (error) {
      console.error("Error in deleteTag function:", error);
      return handleResponse(res, 500, "error", "An error occurred while deleting the tag.", null, 0);
    }
  }

  // Search tags by keyText
  async searchTags(req, res) {
    try {
      const { query, page = 1, limit = 10 } = req.query;
      if (!query) {
        return handleResponse(res, 400, "error", "Search query is required.", null, 0);
      }
      const tags = await DiscoverTag.find({ keyText: { $regex: query, $options: "i" } })
        .skip((page - 1) * parseInt(limit))
        .limit(parseInt(limit));
      const totalCount = await DiscoverTag.countDocuments({ keyText: { $regex: query, $options: "i" } });
      return handleResponse(res, 200, "success", "Search results fetched successfully.", { tags, totalCount }, tags.length);
    } catch (error) {
      console.error("Error in searchTags function:", error);
      return handleResponse(res, 500, "error", "An error occurred while searching tags.", null, 0);
    }
  }
}

module.exports = new DiscoverTagsCTRL();
