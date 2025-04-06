// src/docs/adminDocs.js
const DiscoverEndpoint = {
  tags: [
    {
      name: "Discover",
      description: "The Discover managing API",
    },
  ],
  "/discovers/": {
    post: {
      summary: "Create a new discover item",
      tags: ["Discover"],
      description:
        "Allows an authenticated user to create a new discover item with single-language support, single image uploads, and detailed location.",
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
                title: {
                  type: "string",
                  description:
                    "Title of the discover item in the specified language.",
                  example: "Discover Samarkand",
                },
                description: {
                  type: "string",
                  description:
                    "Description of the discover item in the specified language.",
                  example: "Explore the historical beauty of Samarkand.",
                },
                tags: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description:
                    "Array of tag IDs referencing DiscoverTag documents.",
                  example: ["677cc080cb1c1f748b5a771d"],
                },
                image: {
                  type: "string",
                  format: "binary",
                  description: "Main image for the discover item.",
                },
                industry: {
                  type: "string",
                  description: "Industry type for the discover item.",
                  example: "Tourism",
                },
                locationImage: {
                  type: "string",
                  format: "binary",
                  description:
                    "Image representing the location for the discover item.",
                },
                countryCode: {
                  type: "string",
                  description: "The country code for the discover item.",
                  example: "UZ",
                },
                language: {
                  type: "string",
                  description: "Language code for the discover item.",
                  example: "en",
                },
                location: {
                  type: "object",
                  description: "Detailed location information.",
                  properties: {
                    country: {
                      type: "string",
                      description: "The country of the location.",
                      example: "Uzbekistan",
                    },
                  },
                },
              },
              required: [
                "title",
                "description",
                "image",
                "countryCode",
                "language",
                "tags",
                "location",
              ],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Discover item created successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Discover item created successfully.",
                  },
                  data: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        example: "64f1a5e8764f03b0f7c2a310",
                      },
                      title: { type: "string", example: "Discover Samarkand" },
                      description: {
                        type: "string",
                        example: "Explore the historical beauty of Samarkand.",
                      },
                      tags: {
                        type: "array",
                        items: { type: "string" },
                        example: [
                          "64f1a5e8764f03b0f7c2a312",
                          "64f1a5e8764f03b0f7c2a313",
                        ],
                      },
                      image: {
                        type: "string",
                        example: "https://example.com/main-image.jpg",
                      },
                      locationImage: {
                        type: "string",
                        example: "https://example.com/location-image.jpg",
                      },
                      countryCode: { type: "string", example: "UZ" },
                      language: { type: "string", example: "en" },
                      location: {
                        type: "object",
                        properties: {
                          country: {
                            type: "string",
                            example: "Uzbekistan",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid request payload or validation error.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "At least one tag ID is required.",
                  },
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
                  msg: { type: "string", example: "Unauthorized." },
                },
              },
            },
          },
        },
      },
    },
    get: {
      summary: "Retrieve all discover items",
      tags: ["Discover"],
      description:
        "Fetches a list of all discover items with optional pagination, sorting, filtering, and random ordering capabilities.",
      parameters: [
        {
          name: "page",
          in: "query",
          required: false,
          description: "Page number for pagination. Defaults to 1.",
          schema: {
            type: "integer",
            default: 1,
            example: 1,
          },
        },
        {
          name: "limit",
          in: "query",
          required: false,
          description: "Number of items to return per page. Defaults to 10.",
          schema: {
            type: "integer",
            default: 10,
            example: 10,
          },
        },
        {
          name: "sort",
          in: "query",
          required: false,
          description:
            "Sort order for items. Use fields like 'createdAt' or '-createdAt' for ascending or descending order. Ignored if random=true.",
          schema: {
            type: "string",
            example: "-createdAt",
          },
        },
        {
          name: "random",
          in: "query",
          required: false,
          description:
            "When set to 'true', returns items in random order instead of using the sort parameter.",
          schema: {
            type: "boolean",
            default: false,
            example: "true",
          },
        },
        {
          name: "language",
          in: "query",
          required: false,
          description:
            "Filter items by language. Provide a language code (e.g., 'en', 'fr').",
          schema: {
            type: "string",
            example: "en",
          },
        },
        {
          name: "industry",
          in: "query",
          required: false,
          description: "Filter items by industry. Provide industry type.",
          schema: {
            type: "string",
            example: "Tourism",
          },
        },
        {
          name: "tags",
          in: "query",
          required: false,
          description:
            "Filter items by tags. Provide tag IDs as a comma-separated list.",
          schema: {
            type: "string",
            example: "63abc123456789abcdef1234,63def567890123abcdef4567",
          },
        },
      ],
      responses: {
        200: {
          description: "Discover items fetched successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Items retrieved successfully.",
                  },
                  data: {
                    type: "object",
                    properties: {
                      discovers: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string", example: "12345" },
                            title: {
                              type: "string",
                              example: "Discover the Rocky Mountains",
                            },
                            description: {
                              type: "string",
                              example:
                                "A breathtaking view of the Rocky Mountains.",
                            },
                            tags: {
                              type: "array",
                              items: {
                                type: "string",
                                example: "63abc123456789abcdef1234",
                              },
                            },
                            image: {
                              type: "string",
                              example: "https://example.com/image1.jpg",
                            },
                            locationImage: {
                              type: "string",
                              example: "https://example.com/location1.jpg",
                            },
                            countryCode: {
                              type: "string",
                              example: "US",
                            },
                            language: {
                              type: "string",
                              example: "en",
                            },
                            location: {
                              type: "object",
                              properties: {
                                country: {
                                  type: "string",
                                  example: "United States",
                                },
                              },
                            },
                          },
                        },
                      },
                      totalCount: { type: "integer", example: 20 },
                      totalPages: { type: "integer", example: 2 },
                      currentPage: { type: "integer", example: 1 },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Bad Request - Invalid query parameters.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Invalid query parameters provided.",
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Internal Server Error.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Something went wrong." },
                },
              },
            },
          },
        },
      },
    },
  },
  "/discovers/{id}": {
    get: {
      summary: "Retrieve a specific discover item",
      tags: ["Discover"],
      description: "Fetches a discover item by its unique ID.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Unique ID of the discover item to retrieve.",
          schema: {
            type: "string",
            example: "64f1a5e8764f03b0f7c2a310",
          },
        },
      ],
      responses: {
        200: {
          description: "Discover item retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Item retrieved successfully.",
                  },
                  data: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        example: "64f1a5e8764f03b0f7c2a310",
                      },
                      title: {
                        type: "string",
                        example: "Discover the Grand Canyon",
                      },
                      description: {
                        type: "string",
                        example:
                          "Experience the majestic views of the Grand Canyon.",
                      },
                      tags: {
                        type: "array",
                        items: {
                          type: "string",
                          example: "64f1a5e8764f03b0f7c2a312",
                        },
                      },
                      image: {
                        type: "string",
                        example: "https://example.com/main-image.jpg",
                      },
                      locationImage: {
                        type: "string",
                        example: "https://example.com/location-image.jpg",
                      },
                      countryCode: {
                        type: "string",
                        example: "US",
                      },
                      language: {
                        type: "string",
                        example: "en",
                      },
                      location: {
                        type: "object",
                        properties: {
                          country: {
                            type: "string",
                            example: "United States",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        404: {
          description:
            "Not Found - The requested discover item does not exist.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Item not found." },
                },
              },
            },
          },
        },
        500: {
          description: "Internal Server Error.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "An error occurred while retrieving the item.",
                  },
                },
              },
            },
          },
        },
      },
    },
    delete: {
      summary: "Delete a discover item",
      tags: ["Discover"],
      description: "Deletes a discover item by its ID.",
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
          description: "ID of the discover item to delete.",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "Discover item deleted successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Discover item deleted successfully.",
                  },
                },
              },
            },
          },
        },
        403: {
          description: "Forbidden - User not allowed to delete this item.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "You are not allowed to delete this item.",
                  },
                },
              },
            },
          },
        },
      },
    },
    put: {
      summary: "Update a discover item",
      tags: ["Discover"],
      description:
        "Allows an authenticated user to update a discover item by its unique ID.",
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
          description: "Unique ID of the discover item to update.",
          schema: {
            type: "string",
            example: "64f1a5e8764f03b0f7c2a310",
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
                title: {
                  type: "string",
                  description:
                    "Updated title of the discover item in the specified language.",
                  example: "Updated Discover Samarkand",
                },
                description: {
                  type: "string",
                  description:
                    "Updated description of the discover item in the specified language.",
                  example:
                    "Explore the updated historical beauty of Samarkand.",
                },
                tags: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description:
                    "Array of updated tag IDs referencing DiscoverTag documents.",
                  example: [
                    "64f1a5e8764f03b0f7c2a312",
                    "64f1a5e8764f03b0f7c2a313",
                  ],
                },
                image: {
                  type: "string",
                  format: "binary",
                  description: "Updated main image for the discover item.",
                },
                locationImage: {
                  type: "string",
                  format: "binary",
                  description:
                    "Updated image representing the location for the discover item.",
                },
                countryCode: {
                  type: "string",
                  description: "Updated country code for the discover item.",
                  example: "UZ",
                },
                language: {
                  type: "string",
                  description: "Updated language code for the discover item.",
                  example: "en",
                },
                location: {
                  type: "object",
                  description: "Updated detailed location information.",
                  properties: {
                    country: {
                      type: "string",
                      description: "The updated country of the location.",
                      example: "Uzbekistan",
                    },
                  },
                },
              },
              required: [
                "title",
                "description",
                "tagIds",
                "countryCode",
                "language",
              ],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Discover item updated successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Discover item updated successfully.",
                  },
                  data: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        example: "64f1a5e8764f03b0f7c2a310",
                      },
                      title: {
                        type: "string",
                        example: "Updated Discover Samarkand",
                      },
                      description: {
                        type: "string",
                        example:
                          "Explore the updated historical beauty of Samarkand.",
                      },
                      text: {
                        type: "string",
                        example:
                          "Updated: Samarkand is a cultural and historical gem of Central Asia.",
                      },
                      tags: {
                        type: "array",
                        items: { type: "string" },
                        example: [
                          "64f1a5e8764f03b0f7c2a312",
                          "64f1a5e8764f03b0f7c2a313",
                        ],
                      },
                      image: {
                        type: "string",
                        example: "https://example.com/updated-main-image.jpg",
                      },
                      locationImage: {
                        type: "string",
                        example:
                          "https://example.com/updated-location-image.jpg",
                      },
                      countryCode: { type: "string", example: "UZ" },
                      language: { type: "string", example: "en" },
                      location: {
                        type: "object",
                        properties: {
                          country: { type: "string", example: "Uzbekistan" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid request payload or validation error.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Validation failed for the provided input.",
                  },
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
                  msg: { type: "string", example: "Unauthorized." },
                },
              },
            },
          },
        },
        404: {
          description: "Not Found - Item does not exist.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Item not found." },
                },
              },
            },
          },
        },
        500: {
          description: "Internal Server Error.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "An error occurred while updating the item.",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/discovers/search": {
    get: {
      summary: "Search for discover items",
      tags: ["Discover"],
      description:
        "Search discover items by tags, query, location, or language. Tags should be passed as text to match against the `keyText` of DiscoverTags, query searches within titles, location searches for discover items' locations, and language searches for the discover items' language.",
      parameters: [
        {
          name: "query",
          in: "query",
          required: false,
          description: "Text to search in the title of discover items.",
          schema: { type: "string" },
        },
        {
          name: "tags",
          in: "query",
          required: false,
          description: "Comma-separated list of tag texts to search for.",
          schema: { type: "string" },
        },
        {
          name: "location",
          in: "query",
          required: false,
          description: "Text to search in the location of discover items.",
          schema: { type: "string" },
        },
        {
          name: "language",
          in: "query",
          required: false,
          description: "Text to search the language of discover items.",
          schema: { type: "string" },
        },
        {
          name: "page",
          in: "query",
          required: false,
          description: "Page number for pagination.",
          schema: { type: "integer", default: 1 },
        },
        {
          name: "limit",
          in: "query",
          required: false,
          description: "Number of items to return per page.",
          schema: { type: "integer", default: 10 },
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
                    example: "Search results retrieved successfully.",
                  },
                  data: {
                    type: "object",
                    properties: {
                      discovers: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string", example: "12345" },
                            title: {
                              type: "object",
                              description:
                                "Title translations in multiple languages, where keys are language codes.",
                              additionalProperties: {
                                type: "string",
                                example: "Explore the Mountains",
                              },
                            },
                            tags: {
                              type: "array",
                              items: { type: "string" },
                            },
                            location: {
                              type: "string",
                              description: "Location of the discover item.",
                              example: "Rocky Mountains, Colorado, USA",
                            },
                            language: {
                              type: "string",
                              description: "Language of the discover item.",
                              example: "English",
                            },
                          },
                        },
                      },
                      totalCount: { type: "integer", example: 10 },
                      totalPages: { type: "integer", example: 2 },
                      currentPage: { type: "integer", example: 1 },
                    },
                  },
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
                  msg: {
                    type: "string",
                    example: "Search query, tags, or location are required.",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "No matching results found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "No matching tags or items found.",
                  },
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
  DiscoverEndpoint,
};
