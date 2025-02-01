// src/docs/tournamentsDocs.js
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
      description: "Endpoint to create a new tournament. Requires authentication.",
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                tournament_name: {
                  type: "string",
                  example: "Topish Cup tournament",
                },
                date_range: {
                  type: "string",
                  example: "12-28-Sentyabr",
                },
                location: {
                  type: "string",
                  example: "Online",
                },
                prize_pool: {
                  type: "string",
                  example: "5 000 000 so'm",
                },
                organizer: {
                  type: "string",
                  example: "Topish va Navana Technologies",
                },
                game: {
                  type: "string",
                  example: "PlayerUnknown’s Battlegrounds (PUBG)",
                },
                platform: {
                  type: "string",
                  example: "PC, Mobile",
                },
                description: {
                  type: "string",
                  example: "Description of the tournament",
                },
                image: {
                  type: "string",
                  format: "binary",
                  description: "The image file to upload",
                },
                type: {
                  type: "string",
                  example: "kibersport",
                },
              },
              required: ["tournament_name", "date_range", "location", "organizer", "type"],
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
      description: "Endpoint to retrieve all tournaments with optional filtering. Requires authentication.",
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
          description: "A list of tournaments with optional filtering, sorting, and field selection.",
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
                tournament_name: {
                  type: "string",
                  example: "Topish Cup tournament",
                },
                date_range: {
                  type: "string",
                  example: "12-28-Sentyabr",
                },
                location: {
                  type: "string",
                  example: "Online",
                },
                prize_pool: {
                  type: "string",
                  example: "5 000 000 so'm",
                },
                organizer: {
                  type: "string",
                  example: "Topish va Navana Technologies",
                },
                game: {
                  type: "string",
                  example: "PlayerUnknown’s Battlegrounds (PUBG)",
                },
                platform: {
                  type: "string",
                  example: "PC, Mobile",
                },
                player_id: {
                  type: "string",
                  example: "@Topish2398900240",
                },
                special_code: {
                  type: "string",
                  example: "Topish-tour2398",
                },
                description: {
                  type: "string",
                  example: "Description of the tournament",
                },
                image: {
                  type: "string",
                  example: "image_url",
                },
                type: {
                  type: "string",
                  example: "kibersport",
                },
              },
              required: ["tournament_name", "date_range", "location", "organizer", "type"],
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
  "/tournaments/{id}/updateStatus": {
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
            type: "string"
          },
          description: "The unique identifier of the tournament to update."
        }
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
                  enum: ["open", "closed", "expired"],
                  example: "open"
                }
              },
              required: ["status"]
            }
          }
        }
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
                    $ref: "#/components/schemas/Tournament"
                  }
                }
              }
            }
          }
        },
        400: {
          description: "Invalid status value.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Invalid status value." },
                  data: { type: "null", example: null }
                }
              }
            }
          }
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
                  data: { type: "null", example: null }
                }
              }
            }
          }
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
                  data: { type: "null", example: null }
                }
              }
            }
          }
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
                  data: { type: "null", example: null }
                }
              }
            }
          }
        }
      }
    }
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
  "/tournaments/{id}/checkUser": {
    post: {
      summary: "Check user in a tournament",
      tags: ["Tournaments"],
      description: "Endpoint to check if a user is a participant in a tournament by its ID. Requires authentication.",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "The unique identifier of the tournament to check user in.",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                specialCode: {
                  type: "string",
                  example: "Topish-123A2398"
                }
              },
              required: ["specialCode"]
            }
          }
        }
      },
      responses: {
        200: {
          description: "User is a participant in the tournament.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "User is a participant in the tournament." },
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
  "/tournaments/{id}/users": {
    get: {
      summary: "Get users of a tournament",
      tags: ["Tournaments"],
      description: "Endpoint to retrieve users of a tournament by its ID. Requires authentication.",
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
          description: "Users of the tournament retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "Users of the tournament retrieved successfully." },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        user_id: { type: "string", example: "user123" },
                        player_id: { type: "string", example: "Topish2398900240" },
                        special_code: { type: "string", example: "Topish-tour2398" },
                      },
                    },
                  },
                  totalCount: { type: "integer", example: 10 },
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
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  },
  "/tournaments/{id}/addUser": {
    post: {
      summary: "Add user to a tournament",
      tags: ["Tournaments"],
      description: "Endpoint for admin to add a user to a tournament by its ID. Requires authentication.",
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
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                userId: {
                  type: "string",
                  example: "user123",
                },
              },
              required: ["userId"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "User added to tournament successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "User added to tournament successfully." },
                  data: { $ref: "#/components/schemas/Tournament" },
                },
              },
            },
          },
        },
        400: {
          description: "User is already a participant in this tournament.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "User is already a participant in this tournament." },
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
  "/tournaments/{id}/removeUser": {
    post: {
      summary: "Remove user from a tournament",
      tags: ["Tournaments"],
      description: "Endpoint for admin to remove a user from a tournament by its ID. Requires authentication.",
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
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                userId: {
                  type: "string",
                  example: "user123",
                },
              },
              required: ["userId"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "User removed from tournament successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "User removed from tournament successfully." },
                  data: { $ref: "#/components/schemas/Tournament" },
                },
              },
            },
          },
        },
        400: {
          description: "User is not a participant in this tournament.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "User is not a participant in this tournament." },
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
  components: {
    schemas: {
      Tournament: {
        type: "object",
        properties: {
          tournament_id: {
            type: "string",
            example: "tournament123",
          },
          tournament_name: {
            type: "string",
            example: "Topish Cup tournament",
          },
          date_range: {
            type: "string",
            example: "12-28-Sentyabr",
          },
          location: {
            type: "string",
            example: "Online",
          },
          prize_pool: {
            type: "string",
            example: "5 000 000 so'm",
          },
          organizer: {
            type: "string",
            example: "Topish va Navana Technologies",
          },
          game: {
            type: "string",
            example: "PlayerUnknown’s Battlegrounds (PUBG)",
          },
          platform: {
            type: "string",
            example: "PC, Mobile",
          },
          playerId: {
            type: "string",
            example: "@Topish2398900240",
          },
          specialCode: {
            type: "string",
            example: "Topish-tour2398",
          },
          description: {
            type: "string",
            example: "Description of the tournament",
          },
          image: {
            type: "string",
            example: "image_url",
          },
          type: {
            type: "string",
            example: "kibersport",
          },
          participants: {
            type: "array",
            items: {
              type: "object",
              properties: {
                user_id: {
                  type: "string",
                  example: "user123",
                },
                player_id: {
                  type: "string",
                  example: "Topish2398900240",
                },
                special_code: {
                  type: "string",
                  example: "Topish-tour2398",
                },
              },
            },
            example: [
              {
                user_id: "user123",
                player_id: "Topish2398900240",
                special_code: "Topish-tour2398",
              },
            ],
          },
          status: {
            type: "string",
            enum: ["open", "closed", "expired"],
            example: "open",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2023-01-01T00:00:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2023-01-01T00:00:00.000Z",
          },
        },
      },
    },
  },
};

module.exports = {
  tournamentsEndpoint,
};
