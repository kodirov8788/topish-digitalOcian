// src/docs/jobsSeekersDocs.js
const JobSeekersEndpoint = {
  tags: [
    {
      name: "JobSeekers",
      description: "The JobSeekers managing API",
    },
  ],
  "/users/getAllJobSeekers": {
    get: {
      summary: "Get all job seeker profiles",
      tags: ["JobSeekers"],
      description:
        "Endpoint to retrieve all job seeker profiles. Requires authentication.",
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: "query",
          name: "page",
          schema: {
            type: "integer",
            default: 1,
          },
          description: "Page number of the job seeker list",
        },
        {
          in: "query",
          name: "limit",
          schema: {
            type: "integer",
            default: 10,
          },
          description: "Number of job seekers to return per page",
        },
        {
          in: "query",
          name: "jobTitle",
          schema: {
            type: "string",
          },
          description: "Job title to filter the job seekers",
        },
      ],
      responses: {
        200: {
          description: "A list of all job seeker profiles.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Job seekers retrieved successfully",
                  },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/JobSeeker" },
                  },
                  totalUsers: { type: "integer", example: 10 },
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
          description: "No job seeker profiles found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: { type: "string", example: "No job seekers found" },
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
                  msg: { type: "string", example: "Internal Server Error" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
      },
    },
  },
  "/users/getRecommendedJobSeekers": {
    get: {
      summary: "Get all Recommended job seeker profiles",
      tags: ["JobSeekers"],
      description:
        "Endpoint to retrieve all job seeker profiles. Requires authentication.",
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: "query",
          name: "page",
          schema: {
            type: "integer",
            default: 1,
          },
          description: "Page number of the job seeker list",
        },
        {
          in: "query",
          name: "limit",
          schema: {
            type: "integer",
            default: 10,
          },
          description: "Number of job seekers to return per page",
        },
        {
          in: "query",
          name: "jobTitle",
          schema: {
            type: "string",
          },
          description: "Job title to filter the job seekers",
        },
      ],
      responses: {
        200: {
          description: "A list of all recommended job seeker profiles.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Job seekers retrieved successfully",
                  },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/JobSeeker" },
                  },
                  totalUsers: { type: "integer", example: 10 },
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
          description: "No job seeker profiles found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: { type: "string", example: "No job seekers found" },
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
                  msg: { type: "string", example: "Internal Server Error" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
      },
    },
  },
  "/users/getExperiencedJobseekers": {
    get: {
      summary: "Get all Experienced job seeker profiles",
      tags: ["JobSeekers"],
      description:
        "Endpoint to retrieve all job seeker profiles. Requires authentication.",
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: "query",
          name: "page",
          schema: {
            type: "integer",
            default: 1,
          },
          description: "Page number of the job seeker list",
        },
        {
          in: "query",
          name: "limit",
          schema: {
            type: "integer",
            default: 10,
          },
          description: "Number of job seekers to return per page",
        },
        {
          in: "query",
          name: "jobTitle",
          schema: {
            type: "string",
          },
          description: "Job title to filter the job seekers",
        },
      ],
      responses: {
        200: {
          description: "A list of all experienced job seeker profiles.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Job seekers retrieved successfully",
                  },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/JobSeeker" },
                  },
                  totalUsers: { type: "integer", example: 10 },
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
          description: "No job seeker profiles found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: { type: "string", example: "No job seekers found" },
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
                  msg: { type: "string", example: "Internal Server Error" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
      },
    },
  },
  // '/users/getJobSeekersQuery': {
  //     get: {
  //         summary: 'Search job seeker profiles by skills',
  //         tags: ['JobSeekers'],
  //         description: 'Endpoint to search for job seeker profiles by specific skills. Requires authentication.',
  //         parameters: [
  //             {
  //                 in: 'query',
  //                 name: 'searchQuery',
  //                 required: false,
  //                 schema: {
  //                     type: 'string',
  //                 },
  //                 description: 'searchQuery to search for in job seeker profiles',
  //             },
  //             {
  //                 in: 'query',
  //                 name: 'page',
  //                 schema: {
  //                     type: 'integer',
  //                     default: 1,
  //                 },
  //                 description: 'Page number of the job seeker list for pagination',
  //             },
  //             {
  //                 in: 'query',
  //                 name: 'limit',
  //                 schema: {
  //                     type: 'integer',
  //                     default: 10,
  //                 },
  //                 description: 'Number of job seekers to return per page for pagination',
  //             },
  //         ],
  //         responses: {
  //             '200': {
  //                 description: 'A list of job seeker profiles that match the skills query.',
  //                 content: {
  //                     'application/json': {
  //                         schema: {
  //                             type: 'object',
  //                             properties: {
  //                                 result: { type: 'string', example: 'success' },
  //                                 msg: { type: 'string', example: 'A list of job seeker profiles that match the skills query.' },
  //                                 data: {
  //                                     type: 'array',
  //                                     items: { $ref: '#/components/schemas/JobSeeker' },
  //                                 },
  //                                 totalUsers: { type: 'integer', example: 10 },
  //                             },
  //                         },
  //                     },
  //                 },
  //             },
  //             '400': {
  //                 description: 'Bad Request - Skills parameter missing or invalid.',
  //                 content: {
  //                     'application/json': {
  //                         schema: {
  //                             type: 'object',
  //                             properties: {
  //                                 result: { type: 'string', example: 'error' },
  //                                 msg: { type: 'string', example: 'Please enter skills!' },
  //                                 data: { type: 'null', example: null },
  //                                 totalUsers: { type: 'integer', example: 0 },
  //                             },
  //                         },
  //                     },
  //                 },
  //             },
  //             '401': {
  //                 description: 'Unauthorized access, no or invalid authentication token provided.',
  //                 content: {
  //                     'application/json': {
  //                         schema: {
  //                             type: 'object',
  //                             properties: {
  //                                 result: { type: 'string', example: 'failure' },
  //                                 msg: { type: 'string', example: 'Unauthorized access, no or invalid authentication token provided.' },
  //                                 data: { type: 'null', example: null },
  //                                 totalUsers: { type: 'integer', example: 0 },
  //                             },
  //                         },
  //                     },
  //                 },
  //             },
  //             '404': {
  //                 description: 'No job seeker profiles found matching the skills query.',
  //                 content: {
  //                     'application/json': {
  //                         schema: {
  //                             type: 'object',
  //                             properties: {
  //                                 result: { type: 'string', example: 'failure' },
  //                                 msg: { type: 'string', example: 'No job seeker profiles found matching the skills query.' },
  //                                 data: { type: 'null', example: null },
  //                                 totalUsers: { type: 'integer', example: 0 },
  //                             },
  //                         },
  //                     },
  //                 },
  //             },
  //             '500': {
  //                 description: 'Internal server error or exception thrown.',
  //                 content: {
  //                     'application/json': {
  //                         schema: {
  //                             type: 'object',
  //                             properties: {
  //                                 result: { type: 'string', example: 'failure' },
  //                                 msg: { type: 'string', example: 'Internal server error or exception thrown.' },
  //                                 data: { type: 'null', example: null },
  //                                 totalUsers: { type: 'integer', example: 0 },
  //                             },
  //                         },
  //                     },
  //                 },
  //             },
  //         },
  //         security: [
  //             {
  //                 bearerAuth: [],
  //             },
  //         ],
  //     },
  // },
  "/users/getJobseekersSavedjob": {
    get: {
      summary: "Get saved jobs for a job seeker",
      tags: ["JobSeekers"],
      description:
        "Retrieves saved jobs and quick jobs for the authenticated job seeker. Supports pagination.",
      parameters: [
        {
          in: "query",
          name: "page",
          schema: {
            type: "integer",
            default: 1,
          },
          description: "Page number of the results to fetch.",
          required: false,
        },
        {
          in: "query",
          name: "limit",
          schema: {
            type: "integer",
            default: 10,
          },
          description: "Number of results per page.",
          required: false,
        },
      ],
      responses: {
        200: {
          description: "Jobs retrieved successfully",
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
                    items: {
                      oneOf: [
                        { $ref: "#/components/schemas/Jobs" },
                        { $ref: "#/components/schemas/QuickjobsSchema" },
                      ],
                    },
                  },
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
        401: {
          description: "Unauthorized or Job Seeker only",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Unauthorized or Job Seeker only",
                  },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description: "Internal Server Error",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Internal Server Error" },
                  data: { type: "null" },
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
  "/users/deleteJobseekersSavedjob/{id}": {
    delete: {
      summary: "Delete a saved job for a job seeker",
      tags: ["JobSeekers"],
      description:
        "Allows a job seeker to remove a job from their saved jobs. Requires authentication and verification that the user is a job seeker.",
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
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: {
          description:
            "Job application removed successfully from the job seeker's saved jobs.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Job application removed successfully.",
                  },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid request, such as missing job ID.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Job ID must be provided." },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        401: {
          description:
            "Unauthorized access or operation not allowed for the user's role.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Unauthorized or not a Job Seeker.",
                  },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description:
            "Job not found or job seeker not an applicant for the specified job.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Job not found or job seeker not an applicant.",
                  },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description: "Internal server error occurred.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Internal Server Error." },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
      },
    },
  },
  "/users/searchJobseekersParams": {
    get: {
      summary: "Search job seeker profiles by skills",
      tags: ["JobSeekers"],
      description:
        "Endpoint to search for job seeker profiles by specific skills. Requires authentication.",
      parameters: [
        {
          name: "newJobSeekers",
          in: "query",
          description: "List of new job seekers to filter the job seekers",
          required: false,
          schema: { type: "boolean" },
        },
        {
          name: "sortByAlphabet",
          in: "query",
          description: "SORTED BY Alphabet to filter the job seekers",
          required: false,
          schema: { type: "boolean" },
        },
        {
          name: "skills",
          in: "query",
          description: "List of skills to filter the job seekers",
          required: false,
          schema: { type: "string" },
        },
        {
          name: "location",
          in: "query",
          description: "Location to filter the job seekers",
          required: false,
          schema: { type: "string" },
        },
        {
          name: "workType",
          in: "query",
          description: "Type of work to filter the job seekers",
          required: false,
          schema: { type: "string" },
        },
        {
          name: "jobTitle",
          in: "query",
          description: "Job title to filter the job seekers",
          required: false,
          schema: { type: "string" },
        },
        {
          name: "employmentType",
          in: "query",
          description: "Employment type to filter the job seekers",
          required: false,
          schema: { type: "string" },
        },
        {
          name: "experience",
          in: "query",
          description: "Experience in years to filter the job seekers",
          required: false,
          schema: { type: "string" },
        },
        {
          name: "education",
          in: "query",
          description: "Education details to filter the job seekers",
          required: false,
          schema: { type: "string" },
        },
        {
          name: "expectedSalary",
          in: "query",
          description: "Expected salary to filter the job seekers",
          required: false,
          schema: { type: "string" },
        },
        {
          in: "query",
          name: "page",
          schema: {
            type: "integer",
            default: 1,
          },
          description: "Page number of the job seeker list for pagination",
        },
        {
          in: "query",
          name: "limit",
          schema: {
            type: "integer",
            default: 10,
          },
          description:
            "Number of job seekers to return per page for pagination",
        },
      ],
      responses: {
        200: {
          description:
            "A list of job seeker profiles that match the skills query.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example:
                      "A list of job seeker profiles that match the skills query.",
                  },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/JobSeeker" },
                  },
                  totalUsers: { type: "integer", example: 10 },
                },
              },
            },
          },
        },
        400: {
          description: "Bad Request - Skills parameter missing or invalid.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Please enter skills!" },
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
          description:
            "No job seeker profiles found matching the skills query.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example:
                      "No job seeker profiles found matching the skills query.",
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
};

module.exports = {
  JobSeekersEndpoint,
};
