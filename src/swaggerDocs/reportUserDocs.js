const reportUserEndPoint = {
  tags: [
    {
      name: "reportUser",
      description: "The reportUser managing API",
    },
  ],

  "/report": {
    post: {
      summary: "Make a report to admin about a user",
      tags: ["reportUser"],
      description: "Make a report to admin about a user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                reportedUserId: {
                  type: "string",
                  example: "user_id_of_the_reported_user",
                },
                reportReason: {
                  type: "string",
                  example: "reason_for_reporting",
                },
                details: { type: "string", example: "additional_details" },
                jobPostId: { type: "string", example: "job_id" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Report sent successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "Report sent successfully." },
                  data: {
                    type: "object",
                    properties: {
                      _id: { type: "string", example: "unique_id" },
                      reportedUserId: {
                        type: "string",
                        example: "user_id_of_the_reported_user",
                      },
                      reportReason: {
                        type: "string",
                        example: "reason_for_reporting",
                      },
                      details: {
                        type: "string",
                        example: "additional_details",
                      },
                      reportedBy: {
                        type: "string",
                        example: "user_id_of_the_reporter",
                      },
                      reportDate: { type: "string", example: "ISODate" },
                      status: { type: "string", example: "open/resolved" },
                    },
                  },
                  totalCount: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        400: {
          description: "Please provide all the required fields.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example: "Please provide all the required fields.",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description: "User not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: { type: "string", example: "User not found." },
                  data: { type: "null", example: null },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description: "Something went wrong.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example: "Something went wrong: error.message",
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
    get: {
      summary: "Get all reports",
      tags: ["reportUser"],
      description: "Get all reports",
      parameters: [
        {
          name: "status",
          in: "query",
          description: "Filter reports by status",
          required: false,
          schema: {
            type: "string",
            enum: ["open", "resolved"],
          },
        },
      ],
      responses: {
        200: {
          description: "Reports fetched successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Reports fetched successfully.",
                  },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        _id: { type: "string", example: "unique_id" },
                        reportedUserId: {
                          type: "string",
                          example: "user_id_of_the_reported_user",
                        },
                        reportReason: {
                          type: "string",
                          example: "reason_for_reporting",
                        },
                        details: {
                          type: "string",
                          example: "additional_details",
                        },
                        reportedBy: {
                          type: "string",
                          example: "user_id_of_the_reporter",
                        },
                        reportDate: { type: "string", example: "ISODate" },
                        status: { type: "string", example: "open/resolved" },
                      },
                    },
                  },
                  totalCount: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        403: {
          description: "You are not authorized to view this page.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example: "You are not authorized to view this page.",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description: "Something went wrong.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example: "Something went wrong: error.message",
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

  "/report/{reportId}": {
    patch: {
      summary: "Change the status of the report to resolved",
      tags: ["reportUser"],
      description: "Change the status of the report to resolved",
      parameters: [
        {
          name: "reportId",
          in: "path",
          description: "ID of the report to be resolved",
          required: true,
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
                status: {
                  type: "string",
                  required: true,
                  example: "resolved",
                },

              },
              required: [
                "status"
              ],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Report resolved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Report resolved successfully.",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        403: {
          description: "You are not authorized to view this page.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example: "You are not authorized to view this page.",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description: "Report not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: { type: "string", example: "Report not found." },
                  data: { type: "null", example: null },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description: "Something went wrong.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: {
                    type: "string",
                    example: "Something went wrong: error.message",
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
};

module.exports = {
  reportUserEndPoint,
};
