const AppVersionDocs = {
  tags: [
    {
      name: "AppVersion",
      description:
        "API endpoints for managing mobile app versions and update requirements",
    },
  ],
  "/app-version/check": {
    get: {
      summary: "Check app version status",
      tags: ["AppVersion"],
      description:
        "Allows mobile apps to check if they need to update based on their current version",
      parameters: [
        {
          name: "platform",
          in: "query",
          required: true,
          description: "Mobile platform ('ios' or 'android')",
          schema: {
            type: "string",
            enum: ["ios", "android"],
            example: "ios",
          },
        },
        {
          name: "version",
          in: "query",
          required: false,
          description:
            "Current app version (semantic versioning, e.g. '1.2.3')",
          schema: {
            type: "string",
            example: "1.0.0",
          },
        },
      ],
      responses: {
        200: {
          description: "Version information retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Version information retrieved successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      latestVersion: { type: "string", example: "1.2.0" },
                      minRequiredVersion: { type: "string", example: "1.0.0" },
                      updateMessage: {
                        type: "string",
                        example:
                          "Please update to the latest version for exciting new features!",
                      },
                      updateUrl: {
                        type: "string",
                        example: "https://apps.apple.com/app/your-app-id",
                      },
                      updateRequired: { type: "boolean", example: false },
                      hasUpdate: { type: "boolean", example: true },
                    },
                  },
                  totalCount: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid platform specified",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example:
                      "Invalid platform specified. Use 'ios' or 'android'.",
                  },
                  data: { type: "object", example: null },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description:
            "No version information found for the specified platform",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "No version information found for ios",
                  },
                  data: { type: "object", example: null },
                  totalCount: { type: "integer", example: 0 },
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
                    example: "Something went wrong: Internal server error",
                  },
                  data: { type: "object", example: null },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
      },
    },
  },
  "/app-version/": {
    get: {
      summary: "Get all app versions",
      tags: ["AppVersion"],
      description:
        "Allows admins to retrieve information about all app versions",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "App versions retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "All app versions retrieved successfully",
                  },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        _id: {
                          type: "string",
                          example: "64abc123456789abcdef1234",
                        },
                        platform: { type: "string", example: "ios" },
                        latestVersion: { type: "string", example: "1.2.0" },
                        minRequiredVersion: {
                          type: "string",
                          example: "1.0.0",
                        },
                        updateMessage: {
                          type: "string",
                          example:
                            "Please update to the latest version for exciting new features!",
                        },
                        updateUrl: {
                          type: "string",
                          example: "https://apps.apple.com/app/your-app-id",
                        },
                        updateRequired: { type: "boolean", example: false },
                        createdBy: {
                          type: "string",
                          example: "64abc123456789abcdef5678",
                        },
                        createdAt: {
                          type: "string",
                          example: "2023-07-15T12:30:45.123Z",
                        },
                        updatedAt: {
                          type: "string",
                          example: "2023-07-15T12:30:45.123Z",
                        },
                      },
                    },
                  },
                  totalCount: { type: "integer", example: 2 },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - User not logged in",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized" },
                  data: { type: "object", example: null },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        403: {
          description: "Forbidden - User is not an admin",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Only admins can view all app versions",
                  },
                  data: { type: "object", example: null },
                  totalCount: { type: "integer", example: 0 },
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
                    example: "Something went wrong: Internal server error",
                  },
                  data: { type: "object", example: null },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
      },
    },
    post: {
      summary: "Create or update app version",
      tags: ["AppVersion"],
      description:
        "Allows admins to create or update version information for a specific platform",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                platform: {
                  type: "string",
                  enum: ["ios", "android"],
                  description: "Mobile platform",
                  example: "ios",
                },
                latestVersion: {
                  type: "string",
                  description: "Latest app version (semantic versioning)",
                  example: "1.2.0",
                },
                minRequiredVersion: {
                  type: "string",
                  description: "Minimum required version (semantic versioning)",
                  example: "1.0.0",
                },
                updateMessage: {
                  type: "string",
                  description: "Message to display when update is needed",
                  example:
                    "Please update to the latest version for exciting new features!",
                },
                updateUrl: {
                  type: "string",
                  description: "URL to the app store for updates",
                  example: "https://apps.apple.com/app/your-app-id",
                },
                updateRequired: {
                  type: "boolean",
                  description:
                    "Force all users to update regardless of version",
                  example: false,
                },
              },
              required: ["platform", "latestVersion"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "App version information updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "App version information updated successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      _id: {
                        type: "string",
                        example: "64abc123456789abcdef1234",
                      },
                      platform: { type: "string", example: "ios" },
                      latestVersion: { type: "string", example: "1.2.0" },
                      minRequiredVersion: { type: "string", example: "1.0.0" },
                      updateMessage: {
                        type: "string",
                        example:
                          "Please update to the latest version for exciting new features!",
                      },
                      updateUrl: {
                        type: "string",
                        example: "https://apps.apple.com/app/your-app-id",
                      },
                      updateRequired: { type: "boolean", example: false },
                      createdBy: {
                        type: "string",
                        example: "64abc123456789abcdef5678",
                      },
                      createdAt: {
                        type: "string",
                        example: "2023-07-15T12:30:45.123Z",
                      },
                      updatedAt: {
                        type: "string",
                        example: "2023-07-15T12:30:45.123Z",
                      },
                    },
                  },
                  totalCount: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        400: {
          description: "Bad Request - Invalid input",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Missing required fields" },
                  data: { type: "object", example: null },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - User not logged in",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized" },
                  data: { type: "object", example: null },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        403: {
          description: "Forbidden - User is not an admin",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Only admins can manage app versions",
                  },
                  data: { type: "object", example: null },
                  totalCount: { type: "integer", example: 0 },
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
                    example: "Something went wrong: Internal server error",
                  },
                  data: { type: "object", example: null },
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
  AppVersionDocs,
};
