const QuickjobsEndpoint = {
  tags: [
    {
      name: "Jobs",
      description: "The Quickjobs managing API",
    },
  ],
  "/quickjobs": {
    post: {
      summary: "Create a new job",
      tags: ["Jobs"],
      description:
        "Endpoint to create a new job listing. Requires authentication and appropriate role.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  required: true,
                  example: "Software Engineer",
                },
                description: {
                  type: "string",
                  example: "Job description here",
                },
                telegramUsername: {
                  type: "string",
                  example: "telegramUsername",
                },
                jobStatus: {
                  type: "string",
                  enum: ["Open", "Closed", "Expired"],
                  default: "Open",
                  example: "Open",
                },
                phoneNumber: {
                  type: "string",
                  required: true,
                  example: "939226666",
                },
                location: {
                  type: "string",
                  required: true,
                  example: "New York, NY",
                },
                validUntil: {
                  type: "string",
                  format: "date-time",
                  example: "2025-08-21T17:32:28Z",
                },
                applicants: {
                  type: "array",
                  items: {
                    type: "string",
                    format: "uuid",
                  },
                  example: [],
                },
                callOnly: {
                  type: "boolean",
                  default: false,
                  example: false,
                },
                telegramOnly: {
                  type: "boolean",
                  default: false,
                  example: false,
                },
              },
              required: ["title", "location"],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Job created successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "Job created successfully." },
                  data: {
                    $ref: "#/components/schemas/Quickjob",
                  },
                  totalCount: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        400: {
          description: "Insufficient coins or missing required fields.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Not enough coins or missing required fields.",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        401: {
          description:
            "Unauthorized access, no or invalid authentication token provided, or user not allowed to perform this action.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example: "Unauthorized or not allowed!",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "integer", example: 0 },
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
                  msg: { type: "string", example: "Internal server error." },
                  data: { type: "null", example: null },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
      },
    },
    get: {
      summary: "Get all quick jobs",
      tags: ["Jobs"],
      description:
        "Endpoint to retrieve all job listings with optional filtering, sorting, and field selection. Requires authentication.",
      parameters: [
        {
          in: "query",
          name: "recommended",
          schema: {
            type: "boolean",
          },
          description: "Filter for recommended jobs.",
        },
        {
          in: "query",
          name: "recentJob",
          schema: {
            type: "boolean",
          },
          description: "Filter for recent jobs.",
        },
        {
          in: "query",
          name: "jobTitle",
          schema: {
            type: "string",
          },
          description: "Filter jobs by title with regex search.",
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
            "A list of jobs with optional filtering, sorting, and field selection.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Jobs retrieved successfully.",
                  },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Quickjob" },
                  },
                  totalCount: { type: "integer", example: 0 },
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
                  totalCount: { type: "integer", example: 0 },
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
                  totalCount: { type: "integer", example: 0 },
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
  "/quickjobs/myJobs": {
    get: {
      summary: "Get all job posts created by the authenticated employer",
      tags: ["Jobs"],
      description:
        'Endpoint to retrieve all job posts created by the authenticated employer. Supports pagination. Requires authentication and the user must have the "Employer" role.',
      parameters: [
        {
          in: "query",
          name: "page",
          required: false,
          schema: {
            type: "integer",
            default: 1,
          },
          description: "Page number for pagination",
        },
        {
          in: "query",
          name: "limit",
          required: false,
          schema: {
            type: "integer",
            default: 10,
          },
          description: "Number of items per page for pagination",
        },
      ],
      responses: {
        200: {
          description:
            "A list of all job posts created by the authenticated employer, including pagination information.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Employer posts retrieved successfully.",
                  },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Quickjob" },
                  },
                  totalCount: { type: "integer", example: 10 },
                  currentPage: { type: "integer", example: 1 },
                  totalPages: { type: "integer", example: 5 },
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
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        404: {
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
                  totalCount: { type: "integer", example: 0 },
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
                  totalCount: { type: "integer", example: 0 },
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
  "/quickjobs/{id}": {
    get: {
      summary: "Get a single job post",
      tags: ["Jobs"],
      description:
        "Endpoint to retrieve a single job post by its ID. Requires authentication.",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "The unique identifier of the job post.",
        },
      ],
      responses: {
        200: {
          description: "Details of the requested job post.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Job post retrieved successfully.",
                  },
                  data: {
                    $ref: "#/components/schemas/Quickjob",
                  },
                  totalCount: { type: "integer", example: 1 },
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
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description: "Job post not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: { type: "string", example: "Job post not found." },
                  data: { type: "null", example: null },
                  totalCount: { type: "integer", example: 0 },
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
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
      },
    },
    patch: {
      summary: "Update a job post",
      tags: ["Jobs"],
      description:
        'Endpoint to update a job post by its ID. Requires authentication and the user must have the "Employer" role.',
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "The unique identifier of the job post to update.",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Quickjob", // Reference to your Jobs schema for request body
            },
          },
        },
      },
      responses: {
        200: {
          description: "Job updated successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "Job updated successfully." },
                  data: {
                    $ref: "#/components/schemas/Jobs", // Incorporate data structure from Jobs schema
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid job ID or job does not exist.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Invalid job ID or job does not exist.",
                  },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        401: {
          description:
            "Unauthorized access, no or invalid authentication token provided, or user not allowed to perform this action.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example:
                      "Unauthorized access, no or invalid authentication token provided, or not allowed.",
                  },
                  data: { type: "null", example: null },
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
                },
              },
            },
          },
        },
      },
    },
    delete: {
      summary: "Delete a job post",
      tags: ["Jobs"],
      description:
        'Endpoint to delete a job post by its ID. Requires authentication and the user must have the "Employer" role.',
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "The unique identifier of the job post to delete.",
        },
      ],
      security: [
        {
          bearerAuth: [], // assumes you have defined bearerAuth under securitySchemes
        },
      ],
      responses: {
        200: {
          description: "Job deleted successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "Job deleted successfully." },
                  data: { type: "null", example: null },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        401: {
          description:
            "Unauthorized access, no or invalid authentication token provided, or user not allowed to perform this action.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example:
                      "Unauthorized access, no or invalid authentication token provided, or not allowed.",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description:
            "Job post not found or not authorized to delete this job.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example: "Job post not found or not authorized to delete.",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "integer", example: 0 },
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
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
      },
    },
  },
  "/quickjobs/{id}/apply": {
    post: {
      summary: "Apply for a job",
      tags: ["Jobs"],
      description:
        "Endpoint for a job seeker to apply for a job by its ID. Requires authentication.",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "The unique identifier of the job to apply for.",
        },
      ],
      responses: {
        200: {
          description: "Job application submitted successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Job application submitted successfully.",
                  },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        400: {
          description:
            "User cannot apply for their own job or other client error.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "You cannot apply for your own job.",
                  },
                  data: { type: "null", example: null },
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
                },
              },
            },
          },
        },
        404: {
          description: "Job post not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: { type: "string", example: "Job not found." },
                  data: { type: "null", example: null },
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
                },
              },
            },
          },
        },
      },
    },
  },
  "/quickjobs/myJobs/{id}/applicants": {
    get: {
      summary: "Get applicants for a specific job",
      tags: ["Jobs"],
      description:
        'Endpoint to retrieve all applicants for a specific job post by its ID. Requires authentication and the user must have the "Employer" role.',
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "The unique identifier of the job post.",
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
          description: "List of applicants for the job post.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "List of applicants retrieved successfully.",
                  },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/JobSeeker" },
                  },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        401: {
          description:
            "Unauthorized access, no or invalid authentication token provided, or user not allowed to perform this action.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example:
                      "Unauthorized access, no or invalid authentication token provided, or not allowed.",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description:
            "Job post not found or no applicants found for this job.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example:
                      "Job post not found or no applicants found for this job.",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "integer", example: 0 },
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
                  totalCount: { type: "integer", example: 0 },
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
  QuickjobsEndpoint,
};
