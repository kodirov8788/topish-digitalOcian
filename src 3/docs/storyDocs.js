// src/docs/storyDocs.js
const StoryEndpoints = {
  tags: [
    {
      name: "Stories",
      description: "The Stories managing API",
    },
  ],
  "/stories": {
    post: {
      summary: "Create a new story for the user",
      tags: ["Stories"],
      description:
        "Allows users to create a new story. The user must be authenticated.",
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                content: {
                  type: "string",
                  description: "Content of the story.",
                  example: "This is my new story!",
                },
                media: {
                  type: "array",
                  items: {
                    type: "string",
                    format: "binary",
                  },
                  description:
                    "Array of media files (images or videos) to be uploaded with the story.",
                },
              },
              required: ["content"],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Story created successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Story created successfully.",
                  },
                  data: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        example: "1afa7dbe-e513-4563-8877-d7a10db87c37",
                      },
                      content: {
                        type: "string",
                        example: "This is my new story!",
                      },
                      media: {
                        type: "array",
                        items: {
                          type: "string",
                          example: "https://example.com/media/image.jpg",
                        },
                      },
                      createdAt: {
                        type: "string",
                        format: "date-time",
                        example: "2023-05-12T10:00:00Z",
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
          description: "Unauthorized. User is not authenticated.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Unauthorized. User is not authenticated.",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        400: {
          description: "Bad Request. Content or media is required.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Content or media is required",
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
                  msg: { type: "string", example: "Internal server error." },
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
      summary: "Retrieve all stories for the user",
      tags: ["Stories"],
      description:
        "Allows users to retrieve all their stories. The user must be authenticated.",
      responses: {
        200: {
          description: "Stories retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Stories retrieved successfully.",
                  },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          example: "1afa7dbe-e513-4563-8877-d7a10db87c37",
                        },
                        content: {
                          type: "string",
                          example: "This is my new story!",
                        },
                        media: {
                          type: "array",
                          items: {
                            type: "string",
                            example: "https://example.com/media/image.jpg",
                          },
                        },
                        createdAt: {
                          type: "string",
                          format: "date-time",
                          example: "2023-05-12T10:00:00Z",
                        },
                      },
                    },
                  },
                  totalCount: { type: "number", example: 2 },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized. User is not authenticated.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Unauthorized. User is not authenticated.",
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
                  msg: { type: "string", example: "Internal server error." },
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
  "/stories/getAllReactions": {
    get: {
      summary: "Get all stories with their reactions",
      tags: ["Stories"],
      description:
        "Retrieve all stories along with their total reactions and likes. The user must be authenticated.",
      responses: {
        200: {
          description: "Stories with reactions retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Stories with reactions retrieved successfully.",
                  },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        story: {
                          type: "object",
                          properties: {
                            id: {
                              type: "string",
                              example: "1afa7dbe-e513-4563-8877-d7a10db87c37",
                            },
                            content: {
                              type: "string",
                              example: "This is my new story!",
                            },
                            media: {
                              type: "array",
                              items: {
                                type: "string",
                                example: "https://example.com/media/image.jpg",
                              },
                            },
                            createdAt: {
                              type: "string",
                              format: "date-time",
                              example: "2023-05-12T10:00:00Z",
                            },
                          },
                        },
                        totalReactions: { type: "number", example: 5 },
                        totalLikes: { type: "number", example: 3 },
                        reactions: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              userId: { type: "string", example: "12345678" },
                              emoji: { type: "string", example: "👍" },
                            },
                          },
                        },
                      },
                    },
                  },
                  totalCount: { type: "number", example: 5 },
                },
              },
            },
          },
        },
        404: {
          description: "No stories found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "info" },
                  msg: { type: "string", example: "No stories found" },
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
                  msg: { type: "string", example: "Internal server error." },
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
  "/stories/{storyId}": {
    get: {
      summary: "Retrieve a specific story by ID",
      tags: ["Stories"],
      description:
        "Allows users to retrieve a specific story by its ID. The user must be authenticated.",
      parameters: [
        {
          name: "storyId",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
          description: "UUID of the story to retrieve",
        },
      ],
      responses: {
        200: {
          description: "Story retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Story retrieved successfully.",
                  },
                  data: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        example: "1afa7dbe-e513-4563-8877-d7a10db87c37",
                      },
                      content: { type: "string", example: "This is my story!" },
                      media: {
                        type: "array",
                        items: {
                          type: "string",
                          example: "https://example.com/media/image.jpg",
                        },
                      },
                      createdAt: {
                        type: "string",
                        format: "date-time",
                        example: "2023-05-12T10:00:00Z",
                      },
                      totalReactions: { type: "number", example: 5 },
                      totalLikes: { type: "number", example: 3 },
                    },
                  },
                  totalCount: { type: "number", example: 1 },
                },
              },
            },
          },
        },
        404: {
          description: "Story not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Story not found." },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized. User is not authenticated.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Unauthorized. User is not authenticated.",
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
                  msg: { type: "string", example: "Internal server error." },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
      },
    },
    patch: {
      summary: "Update a story by ID",
      tags: ["Stories"],
      description:
        "Allows users to update a story's content by its ID. The user must be authenticated.",
      parameters: [
        {
          name: "storyId",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
          description: "UUID of the story to update",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                content: {
                  type: "string",
                  description: "Updated content of the story.",
                  example: "Updated story content!",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Story updated successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Story updated successfully.",
                  },
                  data: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        example: "1afa7dbe-e513-4563-8877-d7a10db87c37",
                      },
                      content: {
                        type: "string",
                        example: "Updated story content!",
                      },
                      createdAt: {
                        type: "string",
                        format: "date-time",
                        example: "2023-05-12T10:00:00Z",
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
          description: "Unauthorized. User is not authenticated.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Unauthorized. User is not authenticated.",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        403: {
          description: "Forbidden. User is not allowed to update this story.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "You are not allowed to update this story.",
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
                  msg: { type: "string", example: "Internal server error." },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
      },
    },
    delete: {
      summary: "Delete a story by ID",
      tags: ["Stories"],
      description:
        "Allows users to delete a story by its ID. The user must be authenticated.",
      parameters: [
        {
          name: "storyId",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
          description: "UUID of the story to delete",
        },
      ],
      responses: {
        200: {
          description: "Story deleted successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Story deleted successfully.",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 1 },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized. User is not authenticated.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Unauthorized. User is not authenticated.",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        403: {
          description: "Forbidden. User is not allowed to delete this story.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "You are not allowed to delete this story.",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description: "Story not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Story not found." },
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
                  msg: { type: "string", example: "Internal server error." },
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
  "/stories/user/{userId}": {
    get: {
      summary: "Retrieve stories by user ID",
      tags: ["Stories"],
      description:
        "Allows users to retrieve all stories created by a specific user. The user must be authenticated.",
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
          description: "UUID of the user whose stories are to be retrieved",
        },
      ],
      responses: {
        200: {
          description: "Stories retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Stories retrieved successfully.",
                  },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          example: "1afa7dbe-e513-4563-8877-d7a10db87c37",
                        },
                        content: {
                          type: "string",
                          example: "This is my new story!",
                        },
                        media: {
                          type: "array",
                          items: {
                            type: "string",
                            example: "https://example.com/media/image.jpg",
                          },
                        },
                        createdAt: {
                          type: "string",
                          format: "date-time",
                          example: "2023-05-12T10:00:00Z",
                        },
                      },
                    },
                  },
                  totalCount: { type: "number", example: 2 },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized. User is not authenticated.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Unauthorized. User is not authenticated.",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description: "No stories found for this user.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "info" },
                  msg: { type: "string", example: "No stories found for this user" },
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
                  msg: { type: "string", example: "Internal server error." },
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
};

module.exports = {
  StoryEndpoints,
};
