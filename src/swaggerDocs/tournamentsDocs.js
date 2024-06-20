const tournamentsEndpoint = {
  tags: [
    {
      name: "Tournaments",
      description: "The Tournaments managing API",
    },
  ],
  "/tournaments": {
    post: {
      summary: "Create a new tournament",
      tags: ["Tournaments"],
      description:
        "Endpoint to create a new tournament. Requires authentication.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  required: true,
                  example: "Championship Tournament",
                },
                location: {
                  type: "string",
                  required: true,
                  example: "New York, NY",
                },
                date: {
                  type: "string",
                  format: "date",
                  required: true,
                  example: "2024-08-21",
                },
              },
              required: ["name", "location", "date"],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Tournament created successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "Tournament created successfully." },
                  data: {
                    $ref: "#/components/schemas/Tournament",
                  },
                  totalCount: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized access.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized." },
                  data: { type: "null", example: null },
                  totalCount: { type: "integer", example: 0 },
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
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
      },
    },
    get: {
      summary: "Get all tournaments",
      tags: ["Tournaments"],
      description:
        "Endpoint to retrieve all tournaments with optional filtering. Requires authentication.",
      parameters: [
        {
          in: "query",
          name: "name",
          schema: {
            type: "string",
          },
          description: "Filter tournaments by name with regex search.",
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
            "A list of tournaments with optional filtering, sorting, and field selection.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Tournaments retrieved successfully.",
                  },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Tournament" },
                  },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized access.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized." },
                  data: { type: "null", example: null },
                  totalCount: { type: "integer", example: 0 },
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
  "/tournaments/{id}": {
    get: {
      summary: "Get a tournament by ID",
      tags: ["Tournaments"],
      description: "Endpoint to retrieve a single tournament by its ID. Requires authentication.",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "The unique identifier of the tournament.",
        },
      ],
      responses: {
        200: {
          description: "Details of the requested tournament.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "Tournament retrieved successfully." },
                  data: {
                    $ref: "#/components/schemas/Tournament",
                  },
                  totalCount: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized access.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized." },
                  data: { type: "null", example: null },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        404: {
          description: "Tournament not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Tournament not found." },
                  data: { type: "null", example: null },
                  totalCount: { type: "integer", example: 0 },
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
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
      },
    },
    patch: {
      summary: "Update a tournament",
      tags: ["Tournaments"],
      description: "Endpoint to update a tournament by its ID. Requires authentication.",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "The unique identifier of the tournament to update.",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  example: "Championship Tournament",
                },
                location: {
                  type: "string",
                  example: "New York, NY",
                },
                date: {
                  type: "string",
                  format: "date",
                  example: "2024-08-21",
                },
              },
              required: ["name", "location", "date"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Tournament updated successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "Tournament updated successfully." },
                  data: {
                    $ref: "#/components/schemas/Tournament",
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized access.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized." },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        404: {
          description: "Tournament not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Tournament not found." },
                  data: { type: "null", example: null },
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
                },
              },
            },
          },
        },
      },
    },
    delete: {
      summary: "Delete a tournament",
      tags: ["Tournaments"],
      description: "Endpoint to delete a tournament by its ID. Requires authentication.",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "The unique identifier of the tournament to delete.",
        },
      ],
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: "Tournament deleted successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "Tournament deleted successfully." },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized access.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized." },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        404: {
          description: "Tournament not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Tournament not found." },
                  data: { type: "null", example: null },
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
                },
              },
            },
          },
        },
      },
    },
  },
  "/tournaments/{id}/join": {
    post: {
      summary: "Join a tournament",
      tags: ["Tournaments"],
      description: "Endpoint to join a tournament by its ID. Requires authentication.",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "The unique identifier of the tournament to join.",
        },
      ],
      responses: {
        200: {
          description: "Joined tournament successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "Joined tournament successfully." },
                  data: { $ref: "#/components/schemas/Tournament" },
                },
              },
            },
          },
        },
        400: {
          description: "User has already joined the tournament.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "User has already joined the tournament." },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized access.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized." },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        404: {
          description: "Tournament not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Tournament not found." },
                  data: { type: "null", example: null },
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
  "/tournaments/{id}/leave": {
    post: {
      summary: "Leave a tournament",
      tags: ["Tournaments"],
      description: "Endpoint to leave a tournament by its ID. Requires authentication.",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "The unique identifier of the tournament to leave.",
        },
      ],
      responses: {
        200: {
          description: "Left tournament successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "Left tournament successfully." },
                  data: { $ref: "#/components/schemas/Tournament" },
                },
              },
            },
          },
        },
        400: {
          description: "User is not a participant in the tournament.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "User is not a participant in the tournament." },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized access.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized." },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        404: {
          description: "Tournament not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Tournament not found." },
                  data: { type: "null", example: null },
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
  tournamentsEndpoint,
};
