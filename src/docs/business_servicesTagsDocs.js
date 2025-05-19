// src/docs/business_servicesTagsDocs.js
const Business_servicesTagsEndpoint = {
  tags: [
    {
      name: "BusinessServicesTags",
      description: "The Discover Tags managing API",
    },
  ],
  "/business-servicesTags/": {
    post: {
      summary: "Create a new tag",
      tags: ["BusinessServicesTags"],
      description:
        "Allows an authenticated user to create a new tag for discover items with multilingual support.",
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
                keyText: {
                  type: "object",
                  description:
                    "Tag translations in multiple languages, where keys are language codes.",
                  additionalProperties: {
                    type: "string",
                    description:
                      "Translation of the tag in the specified language.",
                  },
                  example: {
                    en: "Software Development",
                    zh: "软件开发",
                    uz: "Dasturiy ta'minot ishlab chiqish",
                  },
                },
                countryCode: {
                  type: "string",
                  description: "The country code associated with the tag.",
                  example: "UZ",
                },
                languages: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description:
                    "List of language codes used in the translations.",
                  example: ["en", "zh", "uz"],
                },
              },
              required: ["keyText", "countryCode", "languages"],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Tag created successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "Tag created successfully." },
                  data: {
                    type: "object",
                    properties: {
                      _id: {
                        type: "string",
                        example: "60d21b4667d0d8992e610c85",
                      },
                      keyText: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            translations: {
                              type: "object",
                              additionalProperties: { type: "string" },
                            },
                          },
                        },
                        example: [
                          {
                            translations: {
                              en: "Software Development",
                              zh: "软件开发",
                              uz: "Dasturiy ta'minot ishlab chiqish",
                            },
                          },
                        ],
                      },
                      countryCode: { type: "string", example: "UZ" },
                      languages: {
                        type: "array",
                        items: { type: "string" },
                        example: ["en", "zh", "uz"],
                      },
                      createdBy: {
                        type: "string",
                        example: "60d21b4667d0d8992e610c85",
                      },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                    },
                  },
                  totalCount: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        400: {
          description: "Validation Error.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Languages are required." },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized" },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description: "Server Error.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "An error occurred while creating the tag.",
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
    get: {
      summary: "Retrieve all tags",
      tags: ["BusinessServicesTags"],
      description: "Fetches a list of all tags with pagination.",
      parameters: [
        {
          name: "page",
          in: "query",
          required: false,
          description: "Page number for pagination.",
          schema: {
            type: "integer",
            default: 1,
            minimum: 1,
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
            minimum: 1,
          },
        },
      ],
      responses: {
        200: {
          description: "Tags fetched successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Tags fetched successfully.",
                  },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        _id: {
                          type: "string",
                          example: "60d21b4667d0d8992e610c85",
                        },
                        keyText: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              translations: {
                                type: "object",
                                additionalProperties: { type: "string" },
                              },
                            },
                          },
                        },
                        countryCode: { type: "string" },
                        languages: {
                          type: "array",
                          items: { type: "string" },
                        },
                        createdBy: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                      },
                    },
                  },
                  totalCount: { type: "integer", example: 20 },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid pagination parameters.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Invalid pagination parameters.",
                  },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description: "Server Error.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "An error occurred while fetching tags.",
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
  },
  "/business-servicesTags/search": {
    get: {
      summary: "Search tags",
      tags: ["BusinessServicesTags"],
      description:
        "Search for tags based on text query and optional language filters.",
      parameters: [
        {
          name: "query",
          in: "query",
          required: true,
          description: "Search query to find tags.",
          schema: {
            type: "string",
          },
        },
        {
          name: "languages",
          in: "query",
          required: false,
          description:
            "Optional language filters to search in specific languages.",
          schema: {
            type: "object",
            additionalProperties: {
              type: "boolean",
            },
            example: {
              en: true,
              zh: true,
            },
          },
        },
        {
          name: "page",
          in: "query",
          required: false,
          description: "Page number for pagination.",
          schema: {
            type: "integer",
            default: 1,
            minimum: 1,
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
            minimum: 1,
          },
        },
      ],
      responses: {
        200: {
          description: "Search results fetched successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Search results fetched successfully.",
                  },
                  data: {
                    type: "object",
                    properties: {
                      tags: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            keyText: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  translations: {
                                    type: "object",
                                    additionalProperties: { type: "string" },
                                  },
                                },
                              },
                            },
                            countryCode: { type: "string" },
                            languages: {
                              type: "array",
                              items: { type: "string" },
                            },
                            createdBy: { type: "string" },
                            createdAt: { type: "string", format: "date-time" },
                            updatedAt: { type: "string", format: "date-time" },
                          },
                        },
                      },
                      totalCount: { type: "integer", example: 5 },
                    },
                  },
                  totalCount: { type: "integer", example: 5 },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid search parameters.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Search query is required." },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description: "Server Error.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "An error occurred while searching tags.",
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
  },
  "/business-servicesTags/{id}": {
    get: {
      summary: "Retrieve a specific tag",
      tags: ["BusinessServicesTags"],
      description: "Fetches a tag by its ID.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "ID of the tag to retrieve.",
          schema: {
            type: "string",
            pattern: "^[0-9a-fA-F]{24}$",
            example: "60d21b4667d0d8992e610c85",
          },
        },
      ],
      responses: {
        200: {
          description: "Tag retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Tag retrieved successfully.",
                  },
                  data: {
                    type: "object",
                    properties: {
                      _id: {
                        type: "string",
                        example: "60d21b4667d0d8992e610c85",
                      },
                      keyText: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            translations: {
                              type: "object",
                              additionalProperties: { type: "string" },
                            },
                          },
                        },
                      },
                      countryCode: { type: "string" },
                      languages: {
                        type: "array",
                        items: { type: "string" },
                      },
                      createdBy: { type: "string" },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                    },
                  },
                  totalCount: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid tag ID format.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Invalid tag ID format." },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description: "Tag not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Tag not found." },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description: "Server Error.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "An error occurred while retrieving the tag.",
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
    put: {
      summary: "Update a tag",
      tags: ["BusinessServicesTags"],
      description: "Allows updating a tag's details.",
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
          description: "ID of the tag to update.",
          schema: {
            type: "string",
            pattern: "^[0-9a-fA-F]{24}$",
            example: "60d21b4667d0d8992e610c85",
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
                keyText: {
                  type: "object",
                  description:
                    "Updated tag translations in multiple languages, where keys are language codes.",
                  additionalProperties: { type: "string" },
                  example: {
                    en: "Updated Software Development",
                    zh: "更新的软件开发",
                    uz: "Yangilangan dasturiy ta'minot",
                  },
                },
                countryCode: {
                  type: "string",
                  example: "UZ",
                },
                languages: {
                  type: "array",
                  items: { type: "string" },
                  description: "Updated list of language codes.",
                  example: ["en", "zh", "uz"],
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Tag updated successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "Tag updated successfully." },
                  data: {
                    type: "object",
                    properties: {
                      _id: {
                        type: "string",
                        example: "60d21b4667d0d8992e610c85",
                      },
                      keyText: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            translations: {
                              type: "object",
                              additionalProperties: { type: "string" },
                            },
                          },
                        },
                      },
                      countryCode: { type: "string" },
                      languages: {
                        type: "array",
                        items: { type: "string" },
                      },
                      createdBy: { type: "string" },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                    },
                  },
                  totalCount: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        400: {
          description: "Validation Error.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Invalid tag ID format." },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        403: {
          description: "Forbidden.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "You are not allowed to update this tag.",
                  },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description: "Tag not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Tag not found." },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description: "Server Error.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "An error occurred while updating the tag.",
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
    delete: {
      summary: "Delete a tag",
      tags: ["BusinessServicesTags"],
      description: "Deletes a tag by its ID.",
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
          description: "ID of the tag to delete.",
          schema: {
            type: "string",
            pattern: "^[0-9a-fA-F]{24}$",
            example: "60d21b4667d0d8992e610c85",
          },
        },
      ],
      responses: {
        200: {
          description: "Tag deleted successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "Tag deleted successfully." },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid tag ID format.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Invalid tag ID format." },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        403: {
          description: "Forbidden.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "You are not allowed to delete this tag.",
                  },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description: "Tag not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Tag not found." },
                  data: { type: "null" },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description: "Server Error.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "An error occurred while deleting the tag.",
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
  },
};

module.exports = {
  Business_servicesTagsEndpoint,
};
