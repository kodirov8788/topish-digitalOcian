// async getStatusOfEmployerRequest(req, res) {
//   try {
//     if (!req.user) {
//       return handleResponse(res, 401, "error", "Unauthorized", null, 0);
//     }

//     const { userId, companyId } = req.params;

//     // Find the employment request
//     const employmentRequest = await CompanyEmploymentReq.findOne({
//       requesterId: userId,
//       companyId: companyId,
//     });

//     if (!employmentRequest) {
//       return handleResponse(
//         res,
//         404,
//         "error",
//         "No employment request found for this user and company",
//         null,
//         0
//       );
//     }

//     // Get the status of the employment request
//     const requestStatus = employmentRequest.status;
//     const rejectionDate = employmentRequest.rejectionDate;

//     let additionalInfo = null;
//     if (requestStatus === "rejected" && rejectionDate) {
//       const canReapplyDate = new Date(rejectionDate.getTime() + 3 * 24 * 60 * 60 * 1000);
//       const currentDate = new Date();
//       const canReapply = currentDate >= canReapplyDate;

//       additionalInfo = {
//         canReapply,
//         canReapplyDate,
//       };
//     }

//     return handleResponse(
//       res,
//       200,
//       "success",
//       "Employment request status fetched successfully",
//       { status: requestStatus, additionalInfo },
//       1
//     );
//   } catch (error) {
//     console.error("Error in getStatusOfEmployerRequest function:", error);
//     return handleResponse(
//       res,
//       500,
//       "error",
//       "Something went wrong: " + error.message,
//       null,
//       0
//     );
//   }
// }

const CompanyEndpoint = {
  tags: [
    {
      name: "Company",
      description: "The Company managing API",
    },
  ],

  "/companies/": {
    post: {
      summary: "Create a new company",
      tags: ["Company"],
      description:
        "Allows an authorized user with sufficient coins to create a new company entry.",
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Name of the company.",
                  example: "Innovative Tech Solutions",
                },
                location: {
                  type: "string",
                  description: "Geographical location of the company.",
                  example: "Silicon Valley, CA",
                },
                size: {
                  type: "string",
                  description: "Size of the company.",
                  example: "201-500",
                },
                type: {
                  type: "string",
                  description: "Type of the company.",
                  example: "Technology",
                },
                description: {
                  type: "string",
                  description: "Description of the company.",
                  example:
                    "We are a tech company that specializes in creating innovative solutions.",
                },
                logo: {
                  type: "string",
                  format: "binary",
                  description: "Company logo image.",
                },
              },
              required: ["name", "location"],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Company created successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Company created successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        example: "Innovative Tech Solutions",
                      },
                      location: {
                        type: "string",
                        example: "Silicon Valley, CA",
                      },
                      size: { type: "string", example: "100-500" },
                      type: { type: "string", example: "Technology" },
                      description: {
                        type: "string",
                        example:
                          "We are a tech company that specializes in creating innovative solutions.",
                      },
                      logo: {
                        type: "string",
                        example: "https://example.com/logo.jpg",
                      },
                    },
                  },
                  totalCount: { type: "number", example: 1 },
                },
              },
            },
          },
        },
        400: {
          description: "Bad Request. Validation error or not enough coins.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Not enough coins." },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized. User is not logged in or not allowed.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example:
                      "Unauthorized. User is not logged in or not allowed.",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
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
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "An error occurred while creating the company.",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
      },
    },
    get: {
      summary: "Retrieve all companies",
      tags: ["Company"],
      description:
        "Fetches a list of companies, optionally filtered by name, location, and recommendation status, with pagination and sorting capabilities.",
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "companyName",
          in: "query",
          required: false,
          description: "Filter companies by name using a regex pattern.",
          schema: {
            type: "string",
          },
        },
        {
          name: "location",
          in: "query",
          required: false,
          description: "Filter companies by location using a regex pattern.",
          schema: {
            type: "string",
          },
        },
        {
          name: "recommended",
          in: "query",
          required: false,
          description: "Filter companies by their recommendation status.",
          schema: {
            type: "boolean",
          },
        },
        {
          name: "page",
          in: "query",
          required: false,
          description: "Specify the page of results to return.",
          schema: {
            type: "integer",
            default: 1,
          },
        },
        {
          name: "limit",
          in: "query",
          required: false,
          description: "Limit the number of results per page.",
          schema: {
            type: "integer",
            default: 10,
          },
        },
        {
          name: "sort",
          in: "query",
          required: false,
          description:
            'Sort the results by specified fields separated by commas (e.g., "-createdDate" for descending).',
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "List of companies retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Company retrieved successfully",
                  },
                  data: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Company",
                    },
                    example: [
                      {
                        name: "Innovative Tech Solutions",
                        location: "Silicon Valley, CA",
                      },
                    ],
                  },
                  totalCount: { type: "number", example: 10 },
                  pagination: {
                    type: "object",
                    properties: {
                      currentPage: { type: "integer", example: 1 },
                      totalPages: { type: "integer", example: 5 },
                      limit: { type: "integer", example: 10 },
                      totalDocuments: { type: "integer", example: 50 },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Bad Request - Title cannot be empty.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Title cannot be empty" },
                  data: { type: "array", items: {}, example: [] },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - User is not logged in.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized" },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description: "Not Found - No companies found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "No companies found" },
                  data: { type: "array", items: {}, example: [] },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description:
            "Internal Server Error - Error in processing the request.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Internal Server Error" },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
      },
    },
  },
  "/companies/{id}": {
    delete: {
      summary: "Delete a company",
      tags: ["Company"],
      description:
        "Allows an authorized user with specific roles (Admin, Employer) to delete a company.",
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
          description: "The ID of the company to delete.",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "Company deleted successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Company deleted successfully",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 1 },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - User not logged in or not allowed.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Unauthorized or You are not allowed!",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description:
            "Not Found - No such company exists or user not allowed to delete.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Company with id: {companyId} not found",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description:
            "Internal Server Error - Error in processing the request.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Internal Server Error" },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
      },
    },
    // analize this and write correct one
    get: {
      summary: "Retrieve a company",
      tags: ["Company"],
      description: "Fetches a single company by its ID.",
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
          description: "The unique identifier of the company to retrieve.",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "Company retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Company retrieved successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      // Example schema properties of a Company object
                      id: { type: "string", example: "12345" },
                      name: {
                        type: "string",
                        example: "Innovative Tech Solutions",
                      },
                      location: {
                        type: "string",
                        example: "Silicon Valley, CA",
                      },
                      industry: { type: "string", example: "Technology" },
                      revenue: { type: "number", example: 5000000 },
                      // Add more properties as needed
                    },
                  },
                  totalCount: { type: "number", example: 1 },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - User not logged in.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized" },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description: "Not Found - No company found with the provided ID.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Company not found with ID: {companyId}",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description:
            "Internal Server Error - Error in processing the request.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Internal Server Error" },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
      },
    },
    put: {
      summary: "Update a company",
      tags: ["Company"],
      description:
        "Allows an authorized user with specific roles (Admin, Employer) to update details of a company.",
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
          description: "The unique identifier of the company to update.",
          schema: {
            type: "string",
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Updated name of the company.",
                  example: "Innovative Tech Solutions",
                },
                description: {
                  type: "string",
                  description: "Updated description of the company.",
                  example: "We create innovative technology solutions.",
                },
                logo: {
                  type: "string",
                  format: "binary",
                  description: "Updated logo file for the company.",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Company updated successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Company updated successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        example: "Innovative Tech Solutions",
                      },
                      description: {
                        type: "string",
                        example: "We create innovative technology solutions.",
                      },
                      logo: {
                        type: "string",
                        example: "https://example.com/new_logo.jpg",
                      },
                    },
                  },
                  totalCount: { type: "number", example: 1 },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - User not logged in or not allowed.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Unauthorized or You are not allowed!",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description:
            "Not Found - No company found with the provided ID, or user not allowed to update.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Company not found with ID: {companyId}",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description:
            "Internal Server Error - Error in processing the request.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Internal Server Error" },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
      },
    },
  },
  "/companies/{id}/addingAdmin": {
    post: {
      summary: "Add an admin to a company",
      tags: ["Hr Company"],
      description:
        "Allows an authorized user with specific roles (Admin, Employer) to add an admin to a company.",
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
          description:
            "The ID of the company to which the admin will be added.",
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
                userId: {
                  type: "string",
                  description: "The ID of the user to be added as an admin.",
                  example: "60d0fe4f5311236168a109ca",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Admin added to the company successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "success",
                  },
                  msg: {
                    type: "string",
                    example: "Admin added to the company successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      company: {
                        $ref: "#/components/schemas/Company",
                      },
                    },
                  },
                  totalCount: {
                    type: "number",
                    example: 1,
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - User not logged in or not allowed.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Unauthorized or You are not allowed!",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "number",
                    example: 0,
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Not Found - No such company or user exists.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Company or user not found with provided ID.",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "number",
                    example: 0,
                  },
                },
              },
            },
          },
        },
        500: {
          description:
            "Internal Server Error - Error in processing the request.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Internal Server Error",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "number",
                    example: 0,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/companies/{id}/removeAdmin": {
    delete: {
      summary: "Remove an admin from a company",
      tags: ["Hr Company"],
      description:
        "Allows an authorized user with specific roles (Admin, Employer) to remove an admin from a company.",
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
          description:
            "The ID of the company from which the admin will be removed.",
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
                userId: {
                  type: "string",
                  description: "The ID of the user to be removed as an admin.",
                  example: "60d0fe4f5311236168a109ca",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Admin removed from the company successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "success",
                  },
                  msg: {
                    type: "string",
                    example: "Admin removed from the company successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      company: {
                        $ref: "#/components/schemas/Company",
                      },
                    },
                  },
                  totalCount: {
                    type: "number",
                    example: 1,
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - User not logged in or not allowed.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Unauthorized or You are not allowed!",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "number",
                    example: 0,
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Not Found - No such company or user exists.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Company or user not found with provided ID.",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "number",
                    example: 0,
                  },
                },
              },
            },
          },
        },
        500: {
          description:
            "Internal Server Error - Error in processing the request.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Internal Server Error",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "number",
                    example: 0,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/companies/{id}/sendingRequest": {
    post: {
      summary: "Send employment request to a company",
      tags: ["Hr Company"],
      description:
        "Allows an authorized user with the Employer role to send an employment request to a company.",
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
          description:
            "The ID of the company to which the employment request will be sent.",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "Employment request sent to the company successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "success",
                  },
                  msg: {
                    type: "string",
                    example:
                      "Employment request sent to the company successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      request: {
                        $ref: "#/components/schemas/CompanyEmploymentReq",
                      },
                    },
                  },
                  totalCount: {
                    type: "number",
                    example: 1,
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - User not logged in or not allowed.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Unauthorized or You are not allowed!",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "number",
                    example: 0,
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Not Found - No such company exists.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Company not found with provided ID.",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "number",
                    example: 0,
                  },
                },
              },
            },
          },
        },
        500: {
          description:
            "Internal Server Error - Error in processing the request.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Internal Server Error",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "number",
                    example: 0,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/companies/{id}/admitEmployer": {
    "post": {
      "summary": "Admit an employer to a company",
      "tags": ["Hr Company"],
      "description": "Allows an authorized user with the Employer or Admin role to admit an employer to a company.",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "required": true,
          "description": "The ID of the company to which the employer will be admitted.",
          "schema": {
            "type": "string"
          }
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "userId": {
                  "type": "string",
                  "description": "The ID of the user to be admitted as an employer.",
                  "example": "60d0fe4f5311236168a109ca"
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Employer added to the company successfully.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "result": {
                    "type": "string",
                    "example": "success"
                  },
                  "msg": {
                    "type": "string",
                    "example": "Employer added to the company successfully"
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "company": {
                        "$ref": "#/components/schemas/Company"
                      }
                    }
                  },
                  "totalCount": {
                    "type": "number",
                    "example": 1
                  }
                }
              }
            }
          }
        },
        "401": {
          "description": "Unauthorized - User not logged in or not allowed.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "result": {
                    "type": "string",
                    "example": "error"
                  },
                  "msg": {
                    "type": "string",
                    "example": "Unauthorized or You are not allowed!"
                  },
                  "data": {
                    "type": "null",
                    "example": null
                  },
                  "totalCount": {
                    "type": "number",
                    "example": 0
                  }
                }
              }
            }
          }
        },
        "404": {
          "description": "Not Found - No such company or user exists.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "result": {
                    "type": "string",
                    "example": "error"
                  },
                  "msg": {
                    "type": "string",
                    "example": "Company or user not found with provided ID."
                  },
                  "data": {
                    "type": "null",
                    "example": null
                  },
                  "totalCount": {
                    "type": "number",
                    "example": 0
                  }
                }
              }
            }
          }
        },
        "500": {
          "description": "Internal Server Error - Error in processing the request.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "result": {
                    "type": "string",
                    "example": "error"
                  },
                  "msg": {
                    "type": "string",
                    "example": "Internal Server Error"
                  },
                  "data": {
                    "type": "null",
                    "example": null
                  },
                  "totalCount": {
                    "type": "number",
                    "example": 0
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "/companies/{id}/rejectEmployer": {
    "post": {
      "summary": "Reject an employer from a company",
      "tags": ["Hr Company"],
      "description": "Allows an authorized user with the Employer or Admin role to reject an employer from a company.",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "required": true,
          "description": "The ID of the company from which the employer will be rejected.",
          "schema": {
            "type": "string"
          }
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "userId": {
                  "type": "string",
                  "description": "The ID of the user to be rejected as an employer.",
                  "example": "60d0fe4f5311236168a109ca"
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Employer rejected from the company successfully.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "result": {
                    "type": "string",
                    "example": "success"
                  },
                  "msg": {
                    "type": "string",
                    "example": "Employer rejected from the company successfully"
                  },
                  "data": {
                    "type": "null",
                    "example": null
                  },
                  "totalCount": {
                    "type": "number",
                    "example": 1
                  }
                }
              }
            }
          }
        },
        "401": {
          "description": "Unauthorized - User not logged in or not allowed.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "result": {
                    "type": "string",
                    "example": "error"
                  },
                  "msg": {
                    "type": "string",
                    "example": "Unauthorized or You are not allowed!"
                  },
                  "data": {
                    "type": "null",
                    "example": null
                  },
                  "totalCount": {
                    "type": "number",
                    "example": 0
                  }
                }
              }
            }
          }
        },
        "404": {
          "description": "Not Found - No such company or user exists.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "result": {
                    "type": "string",
                    "example": "error"
                  },
                  "msg": {
                    "type": "string",
                    "example": "Company or user not found with provided ID."
                  },
                  "data": {
                    "type": "null",
                    "example": null
                  },
                  "totalCount": {
                    "type": "number",
                    "example": 0
                  }
                }
              }
            }
          }
        },
        "500": {
          "description": "Internal Server Error - Error in processing the request.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "result": {
                    "type": "string",
                    "example": "error"
                  },
                  "msg": {
                    "type": "string",
                    "example": "Internal Server Error"
                  },
                  "data": {
                    "type": "null",
                    "example": null
                  },
                  "totalCount": {
                    "type": "number",
                    "example": 0
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "/companies/{userId}/requests/status": {
    "get": {
      "summary": "Get the status of all employment requests for a user",
      "tags": ["Hr Company"],
      "description": "Fetches the status of all employment requests made by a user to different companies.",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "name": "userId",
          "in": "path",
          "required": true,
          "description": "The ID of the user.",
          "schema": {
            "type": "string"
          }
        }
      ],
      "responses": {
        "200": {
          "description": "Employment requests status fetched successfully.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "result": {
                    "type": "string",
                    "example": "success"
                  },
                  "msg": {
                    "type": "string",
                    "example": "Employment requests status fetched successfully"
                  },
                  "data": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "companyId": {
                          "type": "string",
                          "example": "60d0fe4f5311236168a109ca"
                        },
                        "status": {
                          "type": "string",
                          "example": "accepted"
                        },
                        "additionalInfo": {
                          "type": "object",
                          "properties": {
                            "canReapply": {
                              "type": "boolean",
                              "example": true
                            },
                            "canReapplyDate": {
                              "type": "string",
                              "format": "date-time",
                              "example": "2023-07-21T17:32:28Z"
                            }
                          }
                        }
                      }
                    }
                  },
                  "totalCount": {
                    "type": "number",
                    "example": 1
                  }
                }
              }
            }
          }
        },
        "401": {
          "description": "Unauthorized - User not logged in or not allowed.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "result": {
                    "type": "string",
                    "example": "error"
                  },
                  "msg": {
                    "type": "string",
                    "example": "Unauthorized or You are not allowed!"
                  },
                  "data": {
                    "type": "null",
                    "example": null
                  },
                  "totalCount": {
                    "type": "number",
                    "example": 0
                  }
                }
              }
            }
          }
        },
        "404": {
          "description": "Not Found - No employment requests found for this user.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "result": {
                    "type": "string",
                    "example": "error"
                  },
                  "msg": {
                    "type": "string",
                    "example": "No employment requests found for this user."
                  },
                  "data": {
                    "type": "null",
                    "example": null
                  },
                  "totalCount": {
                    "type": "number",
                    "example": 0
                  }
                }
              }
            }
          }
        },
        "500": {
          "description": "Internal Server Error - Error in processing the request.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "result": {
                    "type": "string",
                    "example": "error"
                  },
                  "msg": {
                    "type": "string",
                    "example": "Internal Server Error"
                  },
                  "data": {
                    "type": "null",
                    "example": null
                  },
                  "totalCount": {
                    "type": "number",
                    "example": 0
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "/companies/{id}/users/{userId}/status": {
    "get": {
      "summary": "Get the status of an employer request",
      "tags": ["Hr Company"],
      "description": "Fetches the status of an employment request for a user to a company.",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "name": "companyId",
          "in": "path",
          "required": true,
          "description": "The ID of the company.",
          "schema": {
            "type": "string"
          }
        },
        {
          "name": "userId",
          "in": "path",
          "required": true,
          "description": "The ID of the user.",
          "schema": {
            "type": "string"
          }
        }
      ],
      "responses": {
        "200": {
          "description": "Employment request status fetched successfully.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "result": {
                    "type": "string",
                    "example": "success"
                  },
                  "msg": {
                    "type": "string",
                    "example": "Employment request status fetched successfully"
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "status": {
                        "type": "string",
                        "example": "accepted"
                      },
                      "additionalInfo": {
                        "type": "object",
                        "properties": {
                          "canReapply": {
                            "type": "boolean",
                            "example": true
                          },
                          "canReapplyDate": {
                            "type": "string",
                            "format": "date-time",
                            "example": "2023-07-21T17:32:28Z"
                          }
                        }
                      }
                    }
                  },
                  "totalCount": {
                    "type": "number",
                    "example": 1
                  }
                }
              }
            }
          }
        },
        "401": {
          "description": "Unauthorized - User not logged in or not allowed.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "result": {
                    "type": "string",
                    "example": "error"
                  },
                  "msg": {
                    "type": "string",
                    "example": "Unauthorized or You are not allowed!"
                  },
                  "data": {
                    "type": "null",
                    "example": null
                  },
                  "totalCount": {
                    "type": "number",
                    "example": 0
                  }
                }
              }
            }
          }
        },
        "404": {
          "description": "Not Found - No employment request found for this user and company.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "result": {
                    "type": "string",
                    "example": "error"
                  },
                  "msg": {
                    "type": "string",
                    "example": "No employment request found for this user and company."
                  },
                  "data": {
                    "type": "null",
                    "example": null
                  },
                  "totalCount": {
                    "type": "number",
                    "example": 0
                  }
                }
              }
            }
          }
        },
        "500": {
          "description": "Internal Server Error - Error in processing the request.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "result": {
                    "type": "string",
                    "example": "error"
                  },
                  "msg": {
                    "type": "string",
                    "example": "Internal Server Error"
                  },
                  "data": {
                    "type": "null",
                    "example": null
                  },
                  "totalCount": {
                    "type": "number",
                    "example": 0
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "/companies/{id}/employmentRequests": {
    get: {
      summary: "Get employment requests for a company",
      tags: ["Hr Company"],
      description:
        "Allows an authorized user with the Employer role to retrieve employment requests for a company.",
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
          description:
            "The ID of the company for which to retrieve employment requests.",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "Employment requests retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "success",
                  },
                  msg: {
                    type: "string",
                    example: "Employment requests retrieved successfully",
                  },
                  data: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/CompanyEmploymentReq",
                    },
                  },
                  totalCount: {
                    type: "number",
                    example: 1,
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - User not logged in or not allowed.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Unauthorized or You are not allowed!",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "number",
                    example: 0,
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Not Found - No such company exists.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Company not found with provided ID.",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "number",
                    example: 0,
                  },
                },
              },
            },
          },
        },
        500: {
          description:
            "Internal Server Error - Error in processing the request.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Internal Server Error",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "number",
                    example: 0,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/companies/{id}/addingEmployerManually": {
    post: {
      summary: "Add an employer to a company manually",
      tags: ["Hr Company"],
      description:
        "Allows an authorized user with the Employer role to add an employer to a company manually.",
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
          description:
            "The ID of the company to which the employer will be added.",
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
                userId: {
                  type: "string",
                  description: "The ID of the user to be added as an employer.",
                  example: "60d0fe4f5311236168a109ca",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Employer added to the company successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "success",
                  },
                  msg: {
                    type: "string",
                    example: "Employer added to the company successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      company: {
                        $ref: "#/components/schemas/Company",
                      },
                    },
                  },
                  totalCount: {
                    type: "number",
                    example: 1,
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - User not logged in or not allowed.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Unauthorized or You are not allowed!",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "number",
                    example: 0,
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Not Found - No such company or user exists.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Company or user not found with provided ID.",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "number",
                    example: 0,
                  },
                },
              },
            },
          },
        },
        500: {
          description:
            "Internal Server Error - Error in processing the request.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Internal Server Error",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "number",
                    example: 0,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/companies/{id}/removeEmployer": {
    delete: {
      summary: "Remove an employer from a company",
      tags: ["Hr Company"],
      description:
        "Allows an authorized user with the Employer role to remove an employer from a company.",
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
          description:
            "The ID of the company from which the employer will be removed.",
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
                userId: {
                  type: "string",
                  description:
                    "The ID of the user to be removed as an employer.",
                  example: "60d0fe4f5311236168a109ca",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Employer removed from the company successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "success",
                  },
                  msg: {
                    type: "string",
                    example: "Employer removed from the company successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      company: {
                        $ref: "#/components/schemas/Company",
                      },
                    },
                  },
                  totalCount: {
                    type: "number",
                    example: 1,
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - User not logged in or not allowed.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Unauthorized or You are not allowed!",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "number",
                    example: 0,
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Not Found - No such company or user exists.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Company or user not found with provided ID.",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "number",
                    example: 0,
                  },
                },
              },
            },
          },
        },
        500: {
          description:
            "Internal Server Error - Error in processing the request.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Internal Server Error",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "number",
                    example: 0,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/companies/{id}/jobPosts": {
    get: {
      summary: "Retrieve all job posts from a company",
      tags: ["Hr Company"],
      description:
        "Fetches all job and quick job posts created by the workers of the specified company.",
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
          description: "The ID of the company.",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "Job posts retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "success",
                  },
                  msg: {
                    type: "string",
                    example: "Job posts retrieved successfully",
                  },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        _id: {
                          type: "string",
                          example: "60c72b2f5f1b2c0015b8b8b8",
                        },
                        title: {
                          type: "string",
                          example: "Software Engineer",
                        },
                        description: {
                          type: "string",
                          example: "Job description here",
                        },
                        createdBy: {
                          type: "string",
                          example: "60c72b2f5f1b2c0015b8b8b7",
                        },
                        hr_name: {
                          type: "string",
                          example: "John Doe",
                        },
                        hr_avatar: {
                          type: "string",
                          example: "avatar.png",
                        },
                        issuedBy: {
                          type: "object",
                          properties: {
                            name: {
                              type: "string",
                              example: "Tech Corp",
                            },
                            logo: {
                              type: "string",
                              example: "techcorp_logo.png",
                            },
                          },
                        },
                      },
                    },
                  },
                  totalCount: {
                    type: "number",
                    example: 1,
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - User not logged in or not allowed.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Unauthorized or You are not allowed!",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "number",
                    example: 0,
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Not Found - No such company or user exists.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Company or user not found with provided ID.",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "number",
                    example: 0,
                  },
                },
              },
            },
          },
        },
        500: {
          description:
            "Internal Server Error - Error in processing the request.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Internal Server Error",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "number",
                    example: 0,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/companies/{id}/minorChange": {
    patch: {
      summary: "Apply minor updates to a company",
      tags: ["Company"],
      description:
        "This endpoint allows minor updates to a company's information.",
      parameters: [
        {
          in: "path",
          name: "id",
          schema: {
            type: "string",
          },
          required: true,
          description: "The ID of the company to update",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CompanyUpdate",
            },
            example: {
              name: "Tech Innovators Inc.",
              description: "A leading company in tech innovations.",
              size: "201-500",
              location: "San Francisco, CA",
              type: "Technology",
              working_time: "9 AM - 6 PM",
              working_days: "Monday to Friday",
              overtime: true,
              benefits: "Health insurance, 401(k), and more.",
              info: {
                legal_representative: "John Doe",
                registration_capital: "1,000,000 USD",
                date_of_establishment: "2010-05-15",
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Company minor updates applied successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "success",
                  },
                  msg: {
                    type: "string",
                    example: "Company minor updates applied successfully",
                  },
                  data: {
                    $ref: "#/components/schemas/Company",
                  },
                  totalCount: {
                    type: "integer",
                    example: 1,
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized or not allowed",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Unauthorized or You are not allowed!",
                  },
                  data: {
                    type: "null",
                  },
                  totalCount: {
                    type: "integer",
                    example: 0,
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Company not found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Company not found with ID: {companyId}",
                  },
                  data: {
                    type: "null",
                  },
                  totalCount: {
                    type: "integer",
                    example: 0,
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Something went wrong",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Something went wrong: {error message}",
                  },
                  data: {
                    type: "null",
                  },
                  totalCount: {
                    type: "integer",
                    example: 0,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      CompanyUpdate: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the company",
          },
          description: {
            type: "string",
            description: "The description of the company",
          },
          size: {
            type: "string",
            description: "The size of the company",
          },
          location: {
            type: "string",
            description: "The location of the company",
          },
          type: {
            type: "string",
            description: "The type of the company",
          },
          working_time: {
            type: "string",
            description: "The working time of the company",
          },
          working_days: {
            type: "string",
            description: "The working days of the company",
          },
          overtime: {
            type: "boolean",
            description: "Indicates if the company has overtime",
          },
          benefits: {
            type: "string",
            description: "The benefits provided by the company",
          },
          legal_representative: {
            type: "string",
            description: "The legal representative of the company",
          },
          registration_capital: {
            type: "string",
            description: "The registration capital of the company",
          },
          date_of_establishment: {
            type: "string",
            format: "date",
            description: "The date of establishment of the company",
          },
        },
      },
      Company: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "60d0fe4f5311236168a109ca",
          },
          name: {
            type: "string",
            example: "Innovative Tech Solutions",
          },
          description: {
            type: "string",
          },
          size: {
            type: "string",
          },
          location: {
            type: "string",
          },
          type: {
            type: "string",
          },
          working_time: {
            type: "string",
          },
          working_days: {
            type: "string",
          },
          overtime: {
            type: "boolean",
          },
          benefits: {
            type: "string",
          },
          info: {
            type: "object",
            properties: {
              legal_representative: {
                type: "string",
              },
              registration_capital: {
                type: "string",
              },
              date_of_establishment: {
                type: "string",
                format: "date",
              },
            },
          },
          logo: {
            type: "array",
            items: {
              type: "string",
            },
          },
          workers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                userId: {
                  type: "string",
                  example: "60d0fe4f5311236168a109ca",
                },
                isAdmin: {
                  type: "boolean",
                  example: true,
                },
              },
            },
          },
        },
      },
      CompanyEmploymentReq: {
        type: "object",
        properties: {
          requesterId: {
            type: "string",
            example: "60d0fe4f5311236168a109ca",
          },
          companyId: {
            type: "string",
            example: "60d0fe4f5311236168a109ca",
          },
          status: {
            type: "string",
            example: "pending",
          },
        },
      },
    },
  },
};

module.exports = {
  CompanyEndpoint,
};
