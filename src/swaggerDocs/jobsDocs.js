const JobsEndpoint = {
  tags: [
    {
      name: "Jobs",
      description: "The Jobs managing API",
    },
  ],
  // jobType: {
  //   type: String,
  //   default: "Full-time",
  //   enum: ["Full Time", "Part Time", "Contract", "Freelance","Contractual","Temporary", "Internship"],
  // },
  "/jobs": {
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
                company: {
                  type: "string",
                  required: true,
                  example: "Google",
                },
                description: {
                  type: "string",
                  example:
                    "We are looking for a Senior Software Developer to join our team.",
                },
                jobStatus: {
                  type: "string",
                  enum: ["Open", "Closed", "Expired"],
                  example: "Open",
                },
                jobType: {
                  type: "string",
                  enum: ["Full Time", "Part Time", "Contract", "Freelance", "Contractual", "Temporary", "Internship"],
                  example: "Full Time",
                },
                workingtype: {
                  type: "string",
                  example: "onsite",
                },
                educationLevel: {
                  type: "string",
                  example: "Bachelor's",
                },
                benefits: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  example: [
                    "Health insurance, Paid time off, Remote work options",
                    "Health insurance, Paid time off, Remote work options 2",
                    "Health insurance, Paid time off, Remote work options 3",
                  ],
                },
                location: {
                  type: "string",
                  required: true,
                  example: "New York, NY",
                },
                jobTitle: {
                  type: "string",
                  example: "Senior Software Developer",
                },
                numberOfVacancies: {
                  type: "string",
                  example: "2",
                },
                industry: {
                  type: "string",
                  example: "Software Development",
                },
                workingHours: {
                  type: "string",
                  example: "9am-5pm",
                },
                salaryRange: {
                  type: "string",
                  example: "90000-120000",
                },
                qualifications: {
                  type: "string",
                  example:
                    "Must have a Bachelor's degree in Computer Science or equivalent",
                },
                experience: {
                  type: "string",
                  example: "2 years",
                },
                languagesRequired: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  example: ["English"],
                },
                callOnly: {
                  type: "boolean",
                  example: "false",
                },
                phoneNumber: {
                  type: "string",
                  example: "994567890",
                },
                telegramUsername: {
                  type: "string",
                  example: "telegramUsername",
                },
                requirements: {
                  type: "string",
                  example:
                    "Proficient in modern JavaScript frameworks, RESTful APIs, and database management",
                },
              },
              required: [
                "hr_name",
                "company",
                "jobStatus",
                "jobType",
                "location",
                "jobTitle",
                "industry",
                "role",
              ],
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
                    $ref: "#/components/schemas/Jobs",
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
      summary: "Get all jobs",
      tags: ["Jobs"],
      description:
        "Endpoint to retrieve all job listings with optional filtering, sorting, and field selection. Requires authentication.",
      parameters: [
        {
          in: "query",
          name: "education",
          schema: {
            type: "string",
          },
          description:
            "Filter by education level. Multiple values can be separated by commas.",
        },
        {
          in: "query",
          name: "experience",
          schema: {
            type: "string",
          },
          description: "Filter by required experience.",
        },
        {
          in: "query",
          name: "location",
          schema: {
            type: "string",
          },
          description: "Filter by required location.",
        },
        {
          in: "query",
          name: "workingtype",
          schema: {
            type: "string",
          },
          description: "Filter by working type.",
        },
        {
          in: "query",
          name: "recommended",
          schema: {
            type: "boolean",
          },
          description: "Filter for recommended jobs only.",
        },
        {
          in: "query",
          name: "salary",
          schema: {
            type: "string",
          },
          description: "Filter by salary.",
        },
        {
          in: "query",
          name: "jobTitle",
          schema: {
            type: "string",
          },
          description: "Search by job title.",
        },
        {
          in: "query",
          name: "sort",
          schema: {
            type: "string",
          },
          description:
            'Sort results. Use field names to specify sorting order, prefixed by "-" for descending order.',
        },
        {
          in: "query",
          name: "recentjob",
          schema: {
            type: "boolean",
          },
          description: "Filter for recently posted jobs only.",
        },
        {
          in: "query",
          name: "page",
          schema: {
            type: "integer",
            default: 1,
          },
          description: "Specify the page number for pagination.",
        },
        {
          in: "query",
          name: "limit",
          schema: {
            type: "integer",
            default: 10,
          },
          description: "Limit the number of results per page.",
        },
        {
          in: "query",
          name: "numericFilters",
          schema: {
            type: "string",
          },
          description:
            "Filter by numeric values (e.g., salary ranges). Use the format field<operator>value, with operators like <, >, =, <=, >=.",
        },
        {
          in: "query",
          name: "jobType",
          schema: {
            type: "string",
          },
          description:
            "Filter by job type (e.g., Full-time, Part-time). Multiple values can be separated by commas.",
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
                    items: { $ref: "#/components/schemas/Jobs" },
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
  "/jobs/search": {
    get: {
      summary: "Get all jobs",
      tags: ["Jobs"],
      description:
        "Endpoint to retrieve all job listings with optional filtering, sorting, and field selection. Requires authentication.",
      parameters: [
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
                    items: { $ref: "#/components/schemas/Jobs" },
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
  "/jobs/myJobs": {
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
                    items: { $ref: "#/components/schemas/Jobs" },
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
  "/jobs/{id}": {
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
                    $ref: "#/components/schemas/Jobs",
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
              type: "object",
              properties: {
                company: {
                  type: "string",
                  example: "Google",
                },
                description: {
                  type: "string",
                  example:
                    "We are looking for a Senior Software Developer to join our team.",
                },
                jobStatus: {
                  type: "string",
                  enum: ["Open", "Closed", "Expired"],
                  example: "Open",
                },
                jobType: {
                  type: "string",
                  enum: ["Full-time", "Freelance", "Part-time", "negotiable"],
                  example: "Full-time",
                },
                location: {
                  type: "string",
                  example: "New York, NY",
                },
                jobTitle: {
                  type: "string",
                  example: "Senior Software Developer",
                },
                industry: {
                  type: "string",
                  example: "Software Development",
                },
                salaryRange: {
                  type: "string",
                  example: "90000-120000",
                },
                qualifications: {
                  type: "string",
                  example:
                    "Must have a Bachelor's degree in Computer Science or equivalent",
                },
                experience: {
                  type: "string",
                  example: "2 years",
                },
                languagesRequired: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  example: ["English"],
                },
                requirements: {
                  type: "string",
                  example:
                    "Proficient in modern JavaScript frameworks, RESTful APIs, and database management",
                },
              },
              required: [
                "company",
                "jobStatus",
                "jobType",
                "location",
                "jobTitle",
                "industry",
              ],
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
  "/jobs/{id}/apply": {
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
  "/jobs/myJobs/{id}/applicants": {
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

  "/users/favoriteJob/{id}": {
    post: {
      summary: "Mark a job as favorite",
      tags: ["liked_jobs"],
      description:
        "Allows a job seeker to mark a job as their favorite. Requires job seeker authentication.",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description:
            "The unique identifier of the job to be marked as favorite.",
        },
      ],
      responses: {
        201: {
          description: "Job marked as favorite successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "Job liked successfully." },
                  data: { type: "null" },
                },
              },
            },
          },
        },
        400: {
          description:
            "Validation error, such as attempting to like a job already liked.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example:
                      "You have already liked this job or only job seekers can favorite jobs.",
                  },
                  data: { type: "null" },
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
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized" },
                  data: { type: "null" },
                },
              },
            },
          },
        },
        404: {
          description: "Job not found with the given ID.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Job not found" },
                  data: { type: "null" },
                },
              },
            },
          },
        },
        500: {
          description:
            "Internal server error occurred while processing the request.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Internal Server Error" },
                  data: { type: "null" },
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
    delete: {
      summary: "Remove a Job from Favorites",
      tags: ["liked_jobs"],
      description:
        "Allows a job seeker to remove a job from their list of favorite jobs. Requires job seeker authentication.",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description:
            "The unique identifier of the job to be removed from favorites.",
        },
      ],
      responses: {
        200: {
          description: "Job removed from favorites successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Job removed from favorites successfully.",
                  },
                  data: { type: "null" },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid request or operation not allowed.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Only job seekers can manage favorite jobs",
                  },
                  data: { type: "null" },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized access, no authentication token provided.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized" },
                  data: { type: "null" },
                },
              },
            },
          },
        },
        404: {
          description: "Job not found or not in favorites.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Job not found in favorites",
                  },
                  data: { type: "null" },
                },
              },
            },
          },
        },
        500: {
          description:
            "Internal server error occurred while processing the request.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Internal Server Error" },
                  data: { type: "null" },
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
  "/users/favoriteQuickJob/{id}": {
    post: {
      summary: "Mark a quick job as favorite",
      tags: ["liked_jobs"],
      description:
        "Allows a job seeker to mark a quick job as their favorite. Requires job seeker authentication.",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description:
            "The unique identifier of the quick job to be marked as favorite.",
        },
      ],
      responses: {
        201: {
          description: "Quick job marked as favorite successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "Job liked successfully." },
                  data: { type: "null" },
                },
              },
            },
          },
        },
        400: {
          description:
            "Validation error, such as attempting to like a job already liked or unauthorized action.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example:
                      "You have already liked this job or only job seekers can favorite jobs.",
                  },
                  data: { type: "null" },
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
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized" },
                  data: { type: "null" },
                },
              },
            },
          },
        },
        404: {
          description: "Quick job not found with the given ID.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Job not found" },
                  data: { type: "null" },
                },
              },
            },
          },
        },
        500: {
          description:
            "Internal server error occurred while processing the request.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Internal Server Error" },
                  data: { type: "null" },
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
  "/users/favoriteJob": {
    get: {
      summary: "Get Favorite Jobs and Quick Jobs",
      tags: ["liked_jobs"],
      description:
        "Retrieves both favorite Jobs and Quick Jobs for a job seeker. Requires job seeker authentication.",
      responses: {
        200: {
          description: "Favorite jobs retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Favorite jobs retrieved successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      jobs: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Job" },
                      },
                      quickJobs: {
                        type: "array",
                        items: { $ref: "#/components/schemas/QuickJob" },
                      },
                    },
                  },
                  count: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        400: {
          description: "Only job seekers can retrieve favorite jobs.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Only job seekers can favorite jobs",
                  },
                  data: { type: "null" },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized access, no authentication token provided.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized" },
                  data: { type: "null" },
                },
              },
            },
          },
        },
        500: {
          description:
            "Internal server error occurred while processing the request.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Internal Server Error" },
                  data: { type: "null" },
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
  JobsEndpoint,
};
