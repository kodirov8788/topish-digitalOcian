const Users = require("../models/user_model");
const Jobs = require("../models/job_model");
const QuickJobs = require("../models/quickjob_model");
const BusinessServices = require("../models/business_services_model");
const Discover = require("../models/discover_model");
const Articles = require("../models/Article_model");
const { handleResponse } = require("../utils/handleResponse");

/**
 * Search Result Manager for handling search results across multiple models
 */
class SearchResultManager {
  constructor() {
    this.results = {};
    this.counts = {};
  }

  /**
   * Add results for a specific category
   * @param {String} category - Category name
   * @param {Array} results - Search results
   * @param {Number} count - Total count of results
   */
  addResults(category, results, count) {
    this.results[category] = results;
    this.counts[category] = count;
  }

  /**
   * Get all results combined into a single array
   * @param {String} sortBy - Sort method (relevance or date)
   * @returns {Array} Combined sorted results
   */
  getCombinedResults(sortBy = "relevance") {
    let combined = [];

    for (const category in this.results) {
      combined = combined.concat(this.results[category]);
    }

    if (sortBy === "relevance") {
      combined.sort((a, b) => b._score - a._score);
    } else if (sortBy === "date") {
      combined.sort(
        (a, b) =>
          new Date(b.createdAt || b.updatedAt || 0) -
          new Date(a.createdAt || a.updatedAt || 0)
      );
    }

    return combined;
  }

  /**
   * Get paginated combined results
   * @param {String} sortBy - Sort method
   * @param {Number} skip - Number of items to skip
   * @param {Number} limit - Number of items to return
   * @returns {Array} Paginated combined results
   */
  getPaginatedCombinedResults(sortBy, skip, limit) {
    const combined = this.getCombinedResults(sortBy);
    return combined.slice(skip, skip + limit);
  }

  /**
   * Format the final response
   * @param {String} query - Search query term
   * @param {Boolean} combined - Whether to return combined results
   * @param {String} sortBy - Sort method
   * @param {Object} pagination - Pagination info
   * @param {Boolean} combinedPagination - Whether to paginate combined results
   * @returns {Object} Formatted response
   */
  formatResponse(query, combined, sortBy, pagination, combinedPagination) {
    const { page, limit, skip } = pagination;

    return {
      query,
      results: combined
        ? {
            combined: combinedPagination
              ? this.getPaginatedCombinedResults(sortBy, skip, limit)
              : this.getCombinedResults(sortBy),
          }
        : this.results,
      totalCounts: this.counts,
      pagination: {
        page,
        limit,
        total: Object.values(this.counts).reduce(
          (sum, count) => sum + count,
          0
        ),
      },
    };
  }
}

class SearchCTRL {
  constructor() {
    // Bind methods to ensure 'this' context is preserved
    this.globalSearch = this.globalSearch.bind(this);
    this._calculateScore = this._calculateScore.bind(this);
    this._getNestedProperty = this._getNestedProperty.bind(this);
    this._searchModel = this._searchModel.bind(this);
    this._processModelResults = this._processModelResults.bind(this);

    // Define model search configurations
    this.modelConfigs = {
      users: {
        model: Users,
        type: "user",
        searchFields: [
          "fullName",
          "username",
          "jobTitle",
          "location",
          "resume.skills",
          "resume.summary",
        ],
        excludeFields:
          "-password -refreshTokens -confirmationCode -confirmationCodeExpires -loginCodeAttempts",
        weightMap: [
          { field: "fullName", weight: 10 },
          { field: "username", weight: 8 },
          { field: "jobTitle", weight: 6 },
          { field: "location", weight: 4 },
        ],
      },
      jobs: {
        model: Jobs,
        type: "job",
        searchFields: [
          "jobTitle",
          "description",
          "location",
          "skills",
          "jobType",
          "company",
        ],
        excludeFields: "",
        weightMap: [
          { field: "jobTitle", weight: 10 },
          { field: "company", weight: 8 },
          { field: "skills", weight: 6 },
          { field: "description", weight: 4 },
        ],
      },
      quickJobs: {
        model: QuickJobs,
        type: "quickJob",
        searchFields: ["title", "description", "location", "category"],
        excludeFields: "",
        weightMap: [
          { field: "title", weight: 10 },
          { field: "category", weight: 8 },
          { field: "description", weight: 5 },
        ],
      },
      businessServices: {
        model: BusinessServices,
        type: "businessService",
        searchFields: ["title", "description", "category"],
        excludeFields: "",
        weightMap: [
          { field: "title", weight: 10 },
          { field: "category", weight: 7 },
          { field: "description", weight: 4 },
        ],
      },
      discover: {
        model: Discover,
        type: "discover",
        searchFields: ["title", "description", "location.country"],
        excludeFields: "",
        weightMap: [
          { field: "title", weight: 9 },
          { field: "description", weight: 5 },
          { field: "location.country", weight: 3 },
        ],
      },
      articles: {
        model: Articles,
        type: "article",
        searchFields: ["title", "content", "keywords"],
        excludeFields: "",
        weightMap: [
          { field: "title", weight: 10 },
          { field: "keywords", weight: 8 },
          { field: "content", weight: 3 },
        ],
      },
    };
  }

  /**
   * Process model search results
   * @param {Array} results - Raw search results
   * @param {String} modelType - Type of model
   * @param {String} query - Search query
   * @param {Array} weightMap - Field weight map for scoring
   * @returns {Array} Processed results with scores
   * @private
   */
  _processModelResults(results, modelType, query, weightMap) {
    return results.map((item) => ({
      ...item.toObject(),
      _type: modelType,
      _score: this._calculateScore(item, query, weightMap),
    }));
  }

  /**
   * Search a specific model
   * @param {Object} config - Model configuration
   * @param {String} query - Search query
   * @param {Object} regex - Search regex
   * @param {Object} pagination - Pagination settings
   * @param {SearchResultManager} resultManager - Result manager instance
   * @private
   */
  async _searchModel(config, query, regex, pagination, resultManager) {
    const { model, type, searchFields, excludeFields, weightMap } = config;
    const { skip, limit } = pagination;

    // Build search query conditions
    const searchConditions = searchFields.map((field) => ({
      [field]: { $regex: regex },
    }));

    try {
      // Get search results with pagination
      const results = await model
        .find({ $or: searchConditions })
        .select(excludeFields)
        .skip(skip)
        .limit(limit);

      // Process results with scoring
      const processedResults = this._processModelResults(
        results,
        type,
        query,
        weightMap
      );

      // Get total count
      const count = await model.countDocuments({ $or: searchConditions });

      // Add to result manager
      resultManager.addResults(type, processedResults, count);
    } catch (error) {
      console.error(`Error searching ${type}:`, error);
      // Add empty results for this category on error
      resultManager.addResults(type, [], 0);
    }
  }

  /**
   * Global search across multiple models
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Search results from multiple models
   */
  async globalSearch(req, res) {
    try {
      const {
        query, // Main search term
        categories, // Optional: Comma-separated list of model categories to search
        limit = 10, // Results per category
        page = 1, // Page number
        sort = "relevance", // Sort order (relevance, date, etc.)
        combined = "false", // Whether to combine results
        combinedPagination = "false", // Whether to paginate combined results
      } = req.query;

      if (!query || query.trim().length < 2) {
        return handleResponse(
          res,
          400,
          "error",
          "Search query must be at least 2 characters",
          null,
          0
        );
      }

      // Parse categories to search (or use all)
      const categoriesToSearch = categories
        ? categories.split(",")
        : Object.keys(this.modelConfigs);

      // Create regex for case-insensitive search
      const searchRegex = new RegExp(query, "i");

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const pagination = { page: parseInt(page), limit: parseInt(limit), skip };

      // Initialize the result manager
      const resultManager = new SearchResultManager();

      // Create array of search promises
      const searchPromises = categoriesToSearch
        .filter((category) => this.modelConfigs[category]) // Filter valid categories
        .map((category) =>
          this._searchModel(
            this.modelConfigs[category],
            query,
            searchRegex,
            pagination,
            resultManager
          )
        );

      // Execute all search queries in parallel
      await Promise.all(searchPromises);

      // Format the final response
      const formattedResults = resultManager.formatResponse(
        query,
        combined === "true",
        sort,
        pagination,
        combinedPagination === "true"
      );

      return handleResponse(
        res,
        200,
        "success",
        "Search completed successfully",
        formattedResults,
        formattedResults.pagination.total
      );
    } catch (error) {
      console.error("Error in global search:", error);
      return handleResponse(
        res,
        500,
        "error",
        "Search failed: " + error.message,
        null,
        0
      );
    }
  }

  /**
   * Calculate relevance score based on field weights
   * @param {Object} doc - Document to score
   * @param {String} query - Search query
   * @param {Array} fieldWeights - Array of {field, weight} objects
   * @returns {Number} Relevance score
   * @private
   */
  _calculateScore(doc, query, fieldWeights) {
    let score = 0;
    const lowerQuery = query.toLowerCase();

    fieldWeights.forEach(({ field, weight }) => {
      const value = this._getNestedProperty(doc, field);

      if (value) {
        const stringValue = Array.isArray(value)
          ? value.join(" ").toLowerCase()
          : String(value).toLowerCase();

        // Exact match gets full weight
        if (stringValue === lowerQuery) {
          score += weight * 2;
        }
        // Contains match gets partial weight
        else if (stringValue.includes(lowerQuery)) {
          score += weight;

          // Bonus for field starting with query
          if (stringValue.startsWith(lowerQuery)) {
            score += weight * 0.5;
          }
        }
        // Word boundary match
        else if (new RegExp(`\\b${lowerQuery}\\b`).test(stringValue)) {
          score += weight * 0.8;
        }
      }
    });

    return score;
  }

  /**
   * Get nested property value from an object
   * @param {Object} obj - Object to extract from
   * @param {String} path - Dot notation path
   * @returns {*} Property value
   * @private
   */
  _getNestedProperty(obj, path) {
    return path
      .split(".")
      .reduce((o, p) => (o && o[p] !== undefined ? o[p] : null), obj);
  }
}

module.exports = new SearchCTRL();
