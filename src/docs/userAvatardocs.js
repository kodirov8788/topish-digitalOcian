// src/docs/userAvatardocs.js
const UserAvatarEndpoint = {
  tags: [
    {
      name: "userAvatar",
      description: "The User Avatar managing API",
    },
  ],
  "/users/avatar": {
    post: {
      summary: "Upload avatar",
      tags: ["userAvatar"],
      description:
        "Endpoint for a user to upload an avatar. Requires authentication and multipart/form-data for the file upload.",
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                avatar: {
                  type: "string",
                  format: "binary",
                  description: "File to be uploaded as the user avatar.",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Avatar uploaded successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Avatar uploaded successfully.",
                  },
                  data: {
                    type: "object",
                    properties: {
                      avatar: {
                        type: "string",
                        example:
                          "https://your-bucket.s3.region.amazonaws.com/avatar.jpg",
                        description: "The URL of the uploaded avatar.",
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
          description: "Bad request, error during file upload or processing.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Error message related to file upload.",
                  },
                  data: { type: "null" },
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
                  msg: { type: "string", example: "Unauthorized User!" },
                  data: { type: "null" },
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
                  msg: { type: "string", example: "Something went wrong." },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
      },
    },
    get: {
      summary: "Get avatar of the authenticated user",
      tags: ["userAvatar"],
      description:
        "Endpoint for retrieving the authenticated user's avatar. Requires authentication.",
      responses: {
        200: {
          description: "Avatar fetched successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Avatar fetched successfully.",
                  },
                  data: {
                    type: "string",
                    format: "binary",
                    example: "data:image/png;base64,...",
                    description: "Base64 encoded avatar image.",
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
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description: "User or avatar not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: { type: "string", example: "User or avatar not found." },
                  data: { type: "null" },
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
                    example: "An error occurred while fetching the avatar.",
                  },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
      },
    },
    patch: {
      summary: "Update avatar of the authenticated user",
      tags: ["userAvatar"],
      description:
        "Endpoint for updating the authenticated user's avatar. Requires authentication and multipart/form-data for the file upload.",
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                avatar: {
                  type: "string",
                  format: "binary",
                  description: "File to be uploaded as the new user avatar.",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Avatar updated successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Avatar updated successfully.",
                  },
                  data: {
                    type: "object",
                    properties: {
                      avatar: {
                        type: "string",
                        example:
                          "https://your-bucket.s3.region.amazonaws.com/new-avatar.jpg",
                        description: "The URL of the updated avatar.",
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
          description: "Bad request, error during file upload or processing.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Error message related to file upload.",
                  },
                  data: { type: "null" },
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
                  data: { type: "null" },
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
                  msg: { type: "string", example: "Something went wrong." },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
      },
    },
    delete: {
      summary: "Delete avatar of the authenticated user",
      tags: ["userAvatar"],
      description:
        "Endpoint for deleting the authenticated user's avatar. Requires authentication.",
      responses: {
        200: {
          description: "Avatar deleted successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Avatar deleted successfully.",
                  },
                  data: { type: "null" },
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
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description: "Avatar not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "failure" },
                  msg: { type: "string", example: "Avatar not found." },
                  data: { type: "null" },
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
                  msg: { type: "string", example: "Something went wrong." },
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
};

module.exports = {
  UserAvatarEndpoint,
};
