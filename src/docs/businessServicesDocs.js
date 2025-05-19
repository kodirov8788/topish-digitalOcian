// src/docs/businessServicesDocs.js
const BusinessServicesEndpoint = {
  tags: [
    {
      name: "BusinessServices",
      description: "The Business Services managing API",
    },
  ],
  "/business-services/": {
    post: {
      summary: "Create a new business service",
      tags: ["BusinessServices"],
      description:
        "Allows an authenticated user to create a new business service for a specific company with title, subtitle, category, and optional price and duration.",
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                company_id: {
                  type: "string",
                  description:
                    "The ID of the company for which the service is being created.",
                },
                category: {
                  type: "string",
                  description:
                    "Category of the business service (as a string, not an array or reference).",
                },
                location: {
                  type: "string",
                  description: "Location where the service is offered.",
                  default: "",
                },
                title: {
                  type: "string",
                  description: "Title of the business service.",
                },
                subTitle: {
                  type: "string",
                  description: "Subtitle of the business service.",
                },
                description: {
                  type: "string",
                  description: "Detailed description of the business service.",
                },
                price: {
                  type: "string",
                  description: "Optional price of the service.",
                  default: "0",
                },
                currency: {
                  type: "string",
                  description:
                    "Optional currency of the service (e.g., 'USD').",
                  default: "",
                },
                duration: {
                  type: "string",
                  description:
                    "Optional duration of the service (e.g., '2 hours').",
                  default: "",
                },
                status: {
                  type: "string",
                  description: "Status of the service (active/inactive).",
                  enum: ["active", "inactive"],
                  default: "active",
                },
              },
              required: ["company_id", "title", "description", "category"],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Business service created successfully.",
        },
        400: {
          description: "Invalid request payload or validation error.",
        },
        401: {
          description: "Unauthorized - User not logged in.",
        },
      },
    },
    get: {
      summary: "Retrieve all business services (global list)",
      tags: ["BusinessServices"],
      description:
        "Fetches a global list of all business services with optional pagination and sorting.",
      parameters: [
        {
          name: "page",
          in: "query",
          required: false,
          description: "Page number for pagination.",
          schema: {
            type: "integer",
            default: 1,
          },
        },
        {
          name: "limit",
          in: "query",
          required: false,
          description: "Number of items to return per page.",
          schema: {
            type: "integer",
            default: 10,
          },
        },
        {
          name: "sort",
          in: "query",
          required: false,
          description: "Sort order for items. Default is '-createdAt'.",
          schema: {
            type: "string",
            example: "-createdAt",
          },
        },
      ],
      responses: {
        200: {
          description: "List of business services retrieved successfully.",
        },
        500: {
          description: "Internal Server Error.",
        },
      },
    },
  },
  "/business-services/search": {
    get: {
      summary: "Search for business services by category",
      tags: ["BusinessServices"],
      description: "Searches for business services by a category.",
      parameters: [
        {
          name: "category",
          in: "query",
          required: true,
          description: "Category to search for.",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "Search results fetched successfully.",
        },
        400: {
          description: "Invalid search parameters.",
        },
        404: {
          description: "No matching results found.",
        },
      },
    },
  },
  "/business-services/myServices": {
    get: {
      summary: "Retrieve the logged in user's business services",
      tags: ["BusinessServices"],
      description:
        "Fetches the business services that belong to the authenticated user.",
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: "User's business services retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "success",
                  },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      // Further service schema details here
                    },
                  },
                  message: {
                    type: "string",
                    example: "User services retrieved successfully",
                  },
                  count: {
                    type: "number",
                    example: 1,
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - user is not authenticated.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "error",
                  },
                  message: {
                    type: "string",
                    example: "Unauthorized",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "No companies found for this user.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "error",
                  },
                  message: {
                    type: "string",
                    example: "No companies found for this user.",
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Internal server error.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "error",
                  },
                  message: {
                    type: "string",
                    example: "Internal server error",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/business-services/{company_id}": {
    get: {
      summary: "Retrieve all business services for a company",
      tags: ["BusinessServices"],
      description:
        "Fetches a list of all business services for a specific company.",
      parameters: [
        {
          name: "company_id",
          in: "path",
          required: true,
          description: "ID of the company whose services are to be retrieved.",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "List of business services retrieved successfully.",
        },
        404: {
          description: "No business services found for this company.",
        },
      },
    },
  },
  "/business-services/service/{id}": {
    get: {
      summary: "Retrieve a specific business service by ID",
      tags: ["BusinessServices"],
      description: "Fetches a single business service using its ID.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "ID of the business service to retrieve.",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "Business service retrieved successfully.",
        },
        404: {
          description: "Business service not found.",
        },
      },
    },
    put: {
      summary: "Update a business service",
      tags: ["BusinessServices"],
      description: "Updates a specific business service by its ID.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "ID of the business service to update.",
          schema: {
            type: "string",
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                subTitle: { type: "string" },
                description: { type: "string" },
                price: { type: "number" },
                duration: { type: "string" },
                currency: { type: "string" },
                status: {
                  type: "string",
                  enum: ["active", "inactive"],
                },
                category: {
                  type: "string",
                  description:
                    "Category of the business service (as a string, not an array or reference).",
                },
              },
              required: ["title", "description"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Business service updated successfully.",
        },
      },
    },
    delete: {
      summary: "Delete a business service",
      tags: ["BusinessServices"],
      description: "Deletes a specific business service by its ID.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "ID of the business service to delete.",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "Business service deleted successfully.",
        },
      },
    },
  },
  "/business-services/user/{id}": {
    get: {
      summary: "Retrieve all business services for a specific user",
      tags: ["BusinessServices"],
      description: `
        Fetches business services belonging to a user by their unique ID.
        The user must be authenticated through bearerAuth. 
        If the user exists and has created or been associated with any services, 
        they will be returned in an array containing each service object.
      `,
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "User ID whose business services are being retrieved.",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description:
            "Business services retrieved successfully for this user.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "success",
                  },
                  message: {
                    type: "string",
                    example: "Services for user found successfully.",
                  },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        _id: { type: "string", example: "606c67..." },
                        company_id: { type: "string", example: "607e21..." },
                        title: {
                          type: "string",
                          example: "Web Design Service",
                        },
                        sub_title: {
                          type: "string",
                          example: "Professional website design",
                        },
                        description: {
                          type: "string",
                          example: "Creating responsive websites...",
                        },
                        price: { type: "string", example: "200" },
                        currency: { type: "string", example: "USD" },
                        duration: { type: "string", example: "3 days" },
                        status: { type: "string", example: "active" },
                        createdBy: { type: "string", example: "6065ab..." },
                        createdAt: { type: "string", format: "date-time" },
                      },
                    },
                  },
                  count: {
                    type: "number",
                    example: 2,
                  },
                },
              },
            },
          },
        },
        401: {
          description:
            "Unauthorized - user has not provided valid credentials.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "error",
                  },
                  message: {
                    type: "string",
                    example: "Unauthorized access. Please login first.",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "No business services found for this user ID.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "error" },
                  message: {
                    type: "string",
                    example: "No services found for this user.",
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Internal server error.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "error",
                  },
                  message: {
                    type: "string",
                    example:
                      "An error occurred while retrieving services for the user.",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = {
  BusinessServicesEndpoint,
};
