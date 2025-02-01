// src/docs/employersDocs.js
const EmployersEndpoint = {
  tags: [
    {
      name: "Employers",
      description: "The Employers managing API",
    },
  ],
  "/users/getAllEmployers": {
    get: {
      summary: "Get all employer profiles",
      tags: ["Employers"],
      description:
        "Endpoint to retrieve all employer profiles. Requires authentication.",
      parameters: [
        {
          in: "query",
          name: "page",
          schema: {
            type: "integer",
            default: 1,
          },
          description: "Page number for pagination.",
        },
        {
          in: "query",
          name: "limit",
          schema: {
            type: "integer",
            default: 10,
          },
          description: "Number of items per page for pagination.",
        },
      ],
      responses: {
        200: {
          description: "A list of all employer profiles.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "A list of all employer profiles.",
                  },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Employer" },
                  },
                  totalUsers: { type: "integer", example: 10 },
                },
              },
            },
          },
        },
        401: {
          description:
            "Unauthorized access, no or invalid authentication token provided.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example:
                      "Unauthorized access, no or invalid authentication token provided.",
                  },
                  data: { type: "null", example: null },
                  totalUsers: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description: "No employer profiles found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example: "No employer profiles found.",
                  },
                  data: { type: "null", example: null },
                  totalUsers: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description: "Internal server error or exception thrown.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example: "Internal server error or exception thrown.",
                  },
                  data: { type: "null", example: null },
                  totalUsers: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  },
  "/users/searchEmployers": {
    get: {
      summary: "Search employers by company name",
      tags: ["Employers"],
      description:
        "Endpoint to search for employer profiles by company name. Requires authentication.",
      parameters: [
        {
          in: "query",
          name: "fullName",
          required: false,
          schema: {
            type: "string",
          },
          description: "Company name to search for in employer profiles",
        },
        {
          in: "query",
          name: "page",
          schema: {
            type: "integer",
            default: 1,
          },
          description: "Page number for pagination.",
        },
        {
          in: "query",
          name: "limit",
          schema: {
            type: "integer",
            default: 10,
          },
          description: "Number of items per page for pagination.",
        },
      ],
      responses: {
        200: {
          description:
            "A list of employer profiles that match the company name query.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example:
                      "A list of employer profiles that match the company name query.",
                  },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Employer" },
                  },
                  totalUsers: { type: "integer", example: 10 },
                },
              },
            },
          },
        },
        400: {
          description:
            "Bad Request - Company name parameter missing or invalid.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Please enter a valid company name.",
                  },
                  data: { type: "null", example: null },
                  totalUsers: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        401: {
          description:
            "Unauthorized access, no or invalid authentication token provided.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example:
                      "Unauthorized access, no or invalid authentication token provided.",
                  },
                  data: { type: "null", example: null },
                  totalUsers: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description: "No employers found matching the query.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example: "No employers found matching the query.",
                  },
                  data: { type: "null", example: null },
                  totalUsers: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description: "Internal server error or exception thrown.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example: "Internal server error or exception thrown.",
                  },
                  data: { type: "null", example: null },
                  totalUsers: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  },
  "/users/getEmployer/{id}": {
    get: {
      summary: "Get all employer profiles",
      tags: ["Employers"],
      description:
        "Endpoint to retrieve employer profile . Requires authentication.",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "The unique identifier of the job to be removed.",
        },
      ],
      responses: {
        200: {
          description: "A list of all employer profiles.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "A list of all employer profiles.",
                  },
                  data: {
                    type: "object",
                    items: { $ref: "#/components/schemas/Employer" },
                  },
                  totalUsers: { type: "integer", example: 10 },
                },
              },
            },
          },
        },
        401: {
          description:
            "Unauthorized access, no or invalid authentication token provided.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example:
                      "Unauthorized access, no or invalid authentication token provided.",
                  },
                  data: { type: "null", example: null },
                  totalUsers: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description: "No employer profiles found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example: "No employer profiles found.",
                  },
                  data: { type: "null", example: null },
                  totalUsers: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description: "Internal server error or exception thrown.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example: "Internal server error or exception thrown.",
                  },
                  data: { type: "null", example: null },
                  totalUsers: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  },
  "/users/getJobMaker/{id}": {
    get: {
      summary: "Get Employer Details",
      tags: ["Employers"],
      description:
        "Retrieves details of an employer by their ID. Requires authentication and appropriate permissions.",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "The unique identifier of the employer.",
        },
      ],
      responses: {
        200: {
          description: "Employer details retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "User retrieved successfully",
                  },
                  data: {
                    $ref: "#/components/schemas/User",
                  },
                  count: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        401: {
          description:
            "Unauthorized access, either not logged in or not permitted to access this data.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized" },
                  count: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description: "Employer not found with the provided ID.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "User not found" },
                  count: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description: "Internal server error while processing the request.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Internal Server Error" },
                  count: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  },
};

module.exports = {
  EmployersEndpoint,
};
