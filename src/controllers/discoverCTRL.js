// src/controllers/discoverCTRL.js
const Discover = require("../models/discover_model");
const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");
const { deleteFiles } = require("../utils/imageUploads/discoverImageUpload");
const DiscoverTag = require("../models/discoverTags_model");

class DiscoverCTRL {
  // Create a new discover item
  async createDiscover(req, res) {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return handleResponse(
          res,
          401,
          "error",
          "Unauthorized access. Please log in.",
          null,
          0
        );
      }
      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found.", null, 0);
      }
      const {
        tags,
        countryCode,
        language,
        title,
        description,
        location,
        industry,
      } = req.body;

      // Validate and parse `tagIds`
      let parsedTags = [];
      if (!tags || typeof tags !== "string") {
        return handleResponse(
          res,
          400,
          "error",
          "`tagIds` must be a comma-separated string.",
          null,
          0
        );
      }
      try {
        parsedTags = tags.split(",").map((tag) => tag.trim());
      } catch (err) {
        console.error("Error parsing tagIds:", err);
        return handleResponse(
          res,
          400,
          "error",
          "Invalid `tagIds` format.",
          null,
          0
        );
      }
      if (parsedTags.length === 0) {
        return handleResponse(
          res,
          400,
          "error",
          "At least one tag ID is required.",
          null,
          0
        );
      }
      const validTags = await DiscoverTag.find({ _id: { $in: parsedTags } });
      if (validTags.length !== parsedTags.length) {
        return handleResponse(
          res,
          400,
          "error",
          "Some tag IDs are invalid.",
          null,
          0
        );
      }
      // Validate `language`
      if (!language || typeof language !== "string") {
        return handleResponse(
          res,
          400,
          "error",
          "A valid language is required.",
          null,
          0
        );
      }
      // Validate `title` and `description`
      if (!title || !description) {
        return handleResponse(
          res,
          400,
          "error",
          "Both `title` and `description` are required.",
          null,
          0
        );
      }
      // Validate `location`
      let parsedLocation = null;
      if (location || typeof location !== "string") {
        try {
          parsedLocation = JSON.parse(location.replace(/[\r\n]/g, ""));
        } catch (err) {
          console.error("Error parsing location:", err);
          return handleResponse(
            res,
            400,
            "error",
            "`location` must be a valid JSON object.",
            null,
            0
          );
        }
        if (!parsedLocation?.country) {
          return handleResponse(
            res,
            400,
            "error",
            "Location must include a valid `country`.",
            null,
            0
          );
        }
      }

      // Validate uploaded images
      const { image, locationImage } = req.uploadResults || {};
      if (!image) {
        return handleResponse(
          res,
          400,
          "error",
          "Main image is required.",
          null,
          0
        );
      }
      // Construct `discover` data
      const discoverData = {
        description,
        title,
        tags: parsedTags,
        img: image,
        countryCode,
        language,
        location: {
          country: parsedLocation.country || "",
          img: locationImage || null, // `locationImage` is optional
        },
        industry,
        createdBy: user._id,
      };
      // Save the discover item
      const discover = await Discover.create(discoverData);

      return handleResponse(
        res,
        201,
        "success",
        "Discover item created successfully.",
        discover,
        1
      );
    } catch (error) {
      console.error("Error in createDiscover function:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while creating the discover item.",
        null,
        0
      );
    }
  }

  async getAllDiscovers(req, res) {
    try {
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
      const sort = req.query.sort || "-createdAt";
      const insdustry = req.query.industry; // Extract the industry parameter from the request
      const language = req.query.language; // Extract the language parameter from the request
      const tags = req.query.tags; // Extract the tags parameter from the request

      // Create a filter object to apply conditional filtering
      const filter = {};
      if (language) {
        filter.language = language; // Add language filter if provided
      }
      if (insdustry) {
        filter.industry = insdustry; // Add industry filter if provided
      }
      if (tags) {
        // Search for tag IDs matching the provided tag names or IDs
        const tagIds = await DiscoverTag.find({
          keyText: { $regex: new RegExp(tags, "i") },
        }).distinct("_id");
        if (tagIds.length > 0) {
          filter.tags = { $in: tagIds }; // Add tags filter if matching tag IDs are found
        }
      }

      const discovers = await Discover.find(filter)
        .populate("tags", "keyText")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);

      const totalCount = await Discover.countDocuments(filter);
      return handleResponse(
        res,
        200,
        "success",
        "Discover items fetched successfully.",
        {
          discovers,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
        },
        discovers.length
      );
    } catch (error) {
      console.error("Error in getAllDiscovers function:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while fetching discover items.",
        null,
        0
      );
    }
  }

  // async getAllDiscovers(req, res) {
  //   try {
  //     const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  //     const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
  //     const language = req.query.language;
  //     const tags = req.query.tags;

  //     // Create a filter object for conditional filtering
  //     const filter = {};
  //     if (language) {
  //       filter.language = language;
  //     }
  //     if (tags) {
  //       const tagIds = await DiscoverTag.find({
  //         keyText: { $regex: new RegExp(tags, "i") },
  //       }).distinct("_id");
  //       if (tagIds.length > 0) {
  //         filter.tags = { $in: tagIds };
  //       }
  //     }

  //     // Count total documents to set up pagination
  //     const totalCount = await Discover.countDocuments(filter);
  //     const skip = (page - 1) * limit;

  //     // Shuffle the data using a random field and then paginate
  //     const discovers = await Discover.aggregate([
  //       { $match: filter },
  //       { $addFields: { random: { $rand: {} } } },
  //       { $sort: { random: 1 } },
  //       { $skip: skip },
  //       { $limit: limit },
  //       {
  //         $lookup: {
  //           from: "discoverTags",
  //           localField: "tags",
  //           foreignField: "_id",
  //           as: "tags",
  //         },
  //       },
  //     ]);

  //     return handleResponse(
  //       res,
  //       200,
  //       "success",
  //       "Discover items fetched randomly.",
  //       {
  //         discovers,
  //         totalCount,
  //         totalPages: Math.ceil(totalCount / limit),
  //         currentPage: page,
  //       },
  //       discovers.length
  //     );
  //   } catch (error) {
  //     console.error("Error in getAllDiscovers function:", error);
  //     return handleResponse(
  //       res,
  //       500,
  //       "error",
  //       "An error occurred while fetching discover items randomly.",
  //       null,
  //       0
  //     );
  //   }
  // }

  // Get a single discover item by ID
  async getDiscoverById(req, res) {
    try {
      const { id } = req.params;

      const discover = await Discover.findById(id).populate("tags", "keyText");
      if (!discover) {
        return handleResponse(
          res,
          404,
          "error",
          "Discover item not found.",
          null,
          0
        );
      }

      return handleResponse(
        res,
        200,
        "success",
        "Discover item retrieved successfully.",
        discover,
        1
      );
    } catch (error) {
      console.error("Error in getDiscoverById function:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while retrieving the discover item.",
        null,
        0
      );
    }
  }

  // Update a discover item
  async updateDiscover(req, res) {
    try {
      const { id } = req.params;
      const discover = await Discover.findById(id);

      if (!discover) {
        return handleResponse(
          res,
          404,
          "error",
          "Discover item not found.",
          null,
          0
        );
      }

      // Ensure user is authenticated
      if (!req.user) {
        return handleResponse(
          res,
          401,
          "error",
          "Unauthorized access. Please log in.",
          null,
          0
        );
      }

      const { title, description, tags, countryCode, language, location } =
        req.body;

      // Validate tags
      let parsedTags = [];
      if (tags) {
        if (typeof tags !== "string") {
          return handleResponse(
            res,
            400,
            "error",
            "Tags must be a comma-separated string.",
            null,
            0
          );
        }
        try {
          parsedTags = tags.split(",").map((tag) => tag.trim());
        } catch (err) {
          console.error("Error parsing tags:", err);
          return handleResponse(
            res,
            400,
            "error",
            "Invalid tags format.",
            null,
            0
          );
        }
        if (parsedTags.length === 0) {
          return handleResponse(
            res,
            400,
            "error",
            "At least one tag ID is required.",
            null,
            0
          );
        }
        const validTags = await DiscoverTag.find({ _id: { $in: parsedTags } });
        if (validTags.length !== parsedTags.length) {
          return handleResponse(
            res,
            400,
            "error",
            "Some tag IDs are invalid.",
            null,
            0
          );
        }
        discover.tags = parsedTags;
      }

      // Validate language
      if (language && typeof language !== "string") {
        return handleResponse(
          res,
          400,
          "error",
          "A valid language is required.",
          null,
          0
        );
      }
      if (language) discover.language = language;

      // Update title and description
      if (title) discover.title = title;
      if (description) discover.description = description;

      // Validate location
      let parsedLocation = null;
      if (location) {
        if (typeof location !== "string") {
          return handleResponse(
            res,
            400,
            "error",
            "Location must be a JSON string.",
            null,
            0
          );
        }
        try {
          parsedLocation = JSON.parse(location.replace(/[\r\n]/g, ""));
        } catch (err) {
          console.error("Error parsing location:", err);
          return handleResponse(
            res,
            400,
            "error",
            "Location must be a valid JSON object.",
            null,
            0
          );
        }
        if (!parsedLocation?.country) {
          return handleResponse(
            res,
            400,
            "error",
            "Location must include a valid country.",
            null,
            0
          );
        }
        parsedLocation.img =
          req.uploadResults?.locationImage || discover.location?.img;
        discover.location = parsedLocation;
      }

      // Update countryCode
      if (countryCode) {
        discover.countryCode = countryCode;
      }

      // Update main image
      if (req.uploadResults?.image) {
        await deleteFiles([discover.img]);
        discover.img = req.uploadResults.image;
      }

      await discover.save();
      return handleResponse(
        res,
        200,
        "success",
        "Discover item updated successfully.",
        discover,
        1
      );
    } catch (error) {
      console.error("Error in updateDiscover function:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while updating the discover item.",
        null,
        0
      );
    }
  }

  // Delete a discover item
  async deleteDiscover(req, res) {
    try {
      const { id } = req.params;

      const discover = await Discover.findById(id);
      if (!discover) {
        return handleResponse(
          res,
          404,
          "error",
          "Discover item not found.",
          null,
          0
        );
      }

      await deleteFiles([discover.img, discover.location?.img]);
      await Discover.findByIdAndDelete(id);

      return handleResponse(
        res,
        200,
        "success",
        "Discover item deleted successfully.",
        null,
        0
      );
    } catch (error) {
      console.error("Error in deleteDiscover function:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while deleting the discover item.",
        null,
        0
      );
    }
  }

  // Search discover items by title, tags, or location
  async searchDiscovers(req, res) {
    try {
      const {
        query,
        tags,
        language,
        location,
        page = 1,
        limit = 10,
      } = req.query;

      const searchQuery = {};

      if (query) {
        searchQuery["title"] = { $regex: new RegExp(query, "i") };
      }

      if (tags) {
        const tagIds = await DiscoverTag.find({
          keyText: { $regex: new RegExp(tags, "i") },
        }).distinct("_id");
        searchQuery.tags = { $in: tagIds };
      }

      if (location) {
        searchQuery["location.country"] = { $regex: new RegExp(location, "i") };
      }

      if (language) {
        searchQuery.language = { $regex: new RegExp(language, "i") }; // Add language filter
      }

      const discovers = await Discover.find(searchQuery)
        .populate("tags", "keyText")
        .skip((page - 1) * limit)
        .limit(parseInt(limit, 10));

      const totalCount = await Discover.countDocuments(searchQuery);

      return handleResponse(
        res,
        200,
        "success",
        "Search results fetched successfully.",
        {
          discovers,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
        },
        discovers.length
      );
    } catch (error) {
      console.error("Error in searchDiscovers function:", error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while searching discover items.",
        null,
        0
      );
    }
  }
}

module.exports = new DiscoverCTRL();
