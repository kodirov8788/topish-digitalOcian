// src/docs/searchDocs.js
const SearchEndpoints = {
  tags: [
    {
      name: "Search",
      description: "Global search across multiple data models",
    },
  ],
  "/search": {
    get: {
      summary: "Global search across multiple data models",
      tags: ["Search"],
      description:
        "Perform a unified search across multiple data models including users, jobs, quickJobs, businessServices, discover, articles, offices, and stories. Supports filtering by category, pagination, and various sorting options.",
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "query",
          in: "query",
          required: true,
          description: "Search term to look for across all specified models",
          schema: {
            type: "string",
            minLength: 2,
          },
          example: "developer",
        },
        {
          name: "categories",
          in: "query",
          required: false,
          description:
            "Comma-separated list of categories to search in. If not provided, searches in all available categories.",
          schema: {
            type: "string",
          },
          example: "users,jobs,quickJobs",
        },
        {
          name: "limit",
          in: "query",
          required: false,
          description: "Maximum number of results to return per category",
          schema: {
            type: "integer",
            default: 10,
          },
        },
        {
          name: "page",
          in: "query",
          required: false,
          description: "Page number for pagination",
          schema: {
            type: "integer",
            default: 1,
          },
        },
        {
          name: "sort",
          in: "query",
          required: false,
          description: "Sort order for results",
          schema: {
            type: "string",
            enum: ["relevance", "date"],
            default: "relevance",
          },
        },
        {
          name: "combined",
          in: "query",
          required: false,
          description:
            "When set to 'true', returns all results combined in a single array instead of separated by category",
          schema: {
            type: "string",
            enum: ["true", "false"],
            default: "false",
          },
        },
        {
          name: "combinedPagination",
          in: "query",
          required: false,
          description:
            "When set to 'true' with combined=true, applies pagination globally across all results instead of per category",
          schema: {
            type: "string",
            enum: ["true", "false"],
            default: "false",
          },
        },
      ],
      responses: {
        200: {
          description: "Search completed successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Search completed successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      query: { type: "string", example: "developer" },
                      results: {
                        type: "object",
                        properties: {
                          users: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                fullName: { type: "string" },
                                username: { type: "string" },
                                jobTitle: { type: "string" },
                                location: { type: "string" },
                                avatar: { type: "string" },
                                _type: { type: "string", example: "user" },
                                _score: { type: "number", example: 15.5 },
                              },
                            },
                          },
                          jobs: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                jobTitle: { type: "string" },
                                company: { type: "string" },
                                description: { type: "string" },
                                location: { type: "string" },
                                _type: { type: "string", example: "job" },
                                _score: { type: "number", example: 12.8 },
                              },
                            },
                          },
                          // Similar structure for other model types...
                          combined: {
                            type: "array",
                            description: "Present only when combined=true",
                            items: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                _type: {
                                  type: "string",
                                  description:
                                    "Indicates which model this result came from",
                                  example: "job",
                                },
                                _score: { type: "number", example: 15.5 },
                                // Various properties depending on the type
                              },
                            },
                          },
                        },
                      },
                      totalCounts: {
                        type: "object",
                        properties: {
                          users: { type: "integer", example: 5 },
                          jobs: { type: "integer", example: 12 },
                          quickJobs: { type: "integer", example: 8 },
                          businessServices: { type: "integer", example: 3 },
                          discover: { type: "integer", example: 4 },
                          articles: { type: "integer", example: 2 },
                          offices: { type: "integer", example: 1 },
                          stories: { type: "integer", example: 7 },
                        },
                      },
                      pagination: {
                        type: "object",
                        properties: {
                          page: { type: "integer", example: 1 },
                          limit: { type: "integer", example: 10 },
                          total: { type: "integer", example: 42 },
                        },
                      },
                    },
                  },
                  count: { type: "integer", example: 42 },
                },
              },
            },
          },
        },
        400: {
          description:
            "Bad request - usually invalid or missing search parameters",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Search query must be at least 2 characters",
                  },
                  data: { type: "null" },
                  count: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - user is not authenticated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Authentication required: No token provided",
                  },
                  data: { type: "null" },
                  count: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Search failed: Internal server error",
                  },
                  data: { type: "null" },
                  count: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = { SearchEndpoints };
