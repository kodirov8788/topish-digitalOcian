// src/docs/makeFiendsDocs.js
const MakeFriendsEndpoints = {
  tags: [
    {
      name: "Friends",
      description: "The Friend Management API",
    },
  ],
  "/makeFriends": {
    get: {
      summary: "Get all accepted friends",
      tags: ["Friends"],
      description:
        "Retrieve a list of all friends that the user has accepted. The user must be authenticated.",
      responses: {
        200: {
          description: "Friends retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Friends retrieved successfully.",
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
                        name: { type: "string", example: "John Doe" },
                        email: {
                          type: "string",
                          example: "johndoe@example.com",
                        },
                      },
                    },
                  },
                  totalCount: { type: "number", example: 3 },
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
                  msg: { type: "string", example: "Unauthorized." },
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
  "/makeFriends/pending": {
    get: {
      summary: "Get all pending friend requests",
      tags: ["Friends"],
      description:
        "Retrieve a list of all pending friend requests sent to the user. The user must be authenticated.",
      responses: {
        200: {
          description: "Pending friend requests retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Pending friend requests retrieved successfully.",
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
                        name: { type: "string", example: "Jane Smith" },
                        email: {
                          type: "string",
                          example: "janesmith@example.com",
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
                  msg: { type: "string", example: "Unauthorized." },
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
  "/makeFriends/blocked": {
    get: {
      summary: "Get all blocked friends",
      tags: ["Friends"],
      description:
        "Retrieve a list of all friends that the user has blocked. The user must be authenticated.",
      responses: {
        200: {
          description: "Blocked friends retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Blocked friends retrieved successfully.",
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
                        name: { type: "string", example: "Blocked User" },
                        email: {
                          type: "string",
                          example: "blockeduser@example.com",
                        },
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
                  msg: { type: "string", example: "Unauthorized." },
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
  "/makeFriends/sendInvitation": {
    post: {
      summary: "Send a friend request",
      tags: ["Friends"],
      description:
        "Send a friend request to another user. The user must be authenticated.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                receiverId: {
                  type: "string",
                  description: "ID of the user to send the friend request to.",
                  example: "1afa7dbe-e513-4563-8877-d7a10db87c37",
                },
              },
              required: ["receiverId"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Friend request sent successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "Friend request sent." },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        400: {
          description: "Bad Request. You are already friends.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "You are already friends." },
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
                  msg: { type: "string", example: "Unauthorized." },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
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
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "User not found." },
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
  "/makeFriends/acceptFriendRequest": {
    post: {
      summary: "Accept a friend request",
      tags: ["Friends"],
      description:
        "Accept a friend request from another user. The user must be authenticated.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                senderId: {
                  type: "string",
                  description: "ID of the user who sent the friend request.",
                  example: "1afa7dbe-e513-4563-8877-d7a10db87c37",
                },
              },
              required: ["senderId"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Friend request accepted successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "Friend request accepted." },
                  data: { type: "null", example: null },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        400: {
          description: "Friend request not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Friend request not found." },
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
                  msg: { type: "string", example: "Unauthorized." },
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
  "/makeFriends/getAllCounts": {
    get: {
      summary: "Get total counts for followers, followings, and reactions",
      tags: ["Friends"],
      description:
        "Retrieve total counts for followers, followings, and reactions for the authenticated user.",
      responses: {
        200: {
          description: "Total counts retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Counts retrieved successfully.",
                  },
                  data: {
                    type: "object",
                    properties: {
                      totalFollowers: { type: "number", example: 50 },
                      totalFollowings: { type: "number", example: 30 },
                      totalReactions: { type: "number", example: 100 },
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
                  msg: { type: "string", example: "Unauthorized." },
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
  "/makeFriends/followers": {
    get: {
      summary: "Get all followers",
      tags: ["Friends"],
      description:
        "Retrieve a list of all users who follow the authenticated user. Supports pagination.",
      parameters: [
        {
          name: "page",
          in: "query",
          schema: { type: "number", default: 1 },
          description: "The page number for pagination.",
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "number", default: 10 },
          description: "The number of followers per page.",
        },
      ],
      responses: {
        200: {
          description: "Followers retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Followers fetched successfully.",
                  },
                  data: {
                    type: "object",
                    properties: {
                      followers: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: {
                              type: "string",
                              example: "1afa7dbe-e513-4563-8877-d7a10db87c37",
                            },
                            name: { type: "string", example: "John Doe" },
                            email: {
                              type: "string",
                              example: "johndoe@example.com",
                            },
                          },
                        },
                      },
                      totalPages: { type: "number", example: 5 },
                      currentPage: { type: "number", example: 1 },
                    },
                  },
                  totalCount: { type: "number", example: 10 },
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
                  msg: { type: "string", example: "Unauthorized." },
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
  "/makeFriends/following": {
    get: {
      summary: "Get all followings",
      tags: ["Friends"],
      description:
        "Retrieve a list of all users the authenticated user is following. Supports pagination.",
      parameters: [
        {
          name: "page",
          in: "query",
          schema: { type: "number", default: 1 },
          description: "The page number for pagination.",
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "number", default: 10 },
          description: "The number of followings per page.",
        },
      ],
      responses: {
        200: {
          description: "Followings retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Followings fetched successfully.",
                  },
                  data: {
                    type: "object",
                    properties: {
                      followings: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: {
                              type: "string",
                              example: "1afa7dbe-e513-4563-8877-d7a10db87c37",
                            },
                            name: { type: "string", example: "John Doe" },
                            email: {
                              type: "string",
                              example: "johndoe@example.com",
                            },
                          },
                        },
                      },
                      totalPages: { type: "number", example: 5 },
                      currentPage: { type: "number", example: 1 },
                    },
                  },
                  totalCount: { type: "number", example: 10 },
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
                  msg: { type: "string", example: "Unauthorized." },
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
  MakeFriendsEndpoints,
};
