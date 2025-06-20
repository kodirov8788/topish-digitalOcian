// src/docs/userDocs.js
const UsersEndpoint = {
  tags: [
    {
      name: "Users",
      description: "The Users managing API",
    },
  ],
  "/users/allUsers": {
    get: {
      summary: "Retrieve all users",
      tags: ["Users"],
      description: "Endpoint to retrieve all user profiles.",
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
          description: "Page number for pagination.",
        },
        {
          in: "query",
          name: "limit",
          schema: {
            type: "integer",
            default: 10,
          },
          description: "Number of items per page.",
        },
      ],
      responses: {
        200: {
          description: "A list of all user profiles.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "success",
                  },
                  msg: {
                    type: "string",
                    example: "Users retrieved successfully",
                  },
                  data: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/UserResponse",
                    },
                  },
                  totalCount: {
                    type: "integer",
                    example: 3,
                  },
                  pagination: {
                    type: "object",
                    properties: {
                      currentPage: {
                        type: "integer",
                      },
                      totalPages: {
                        type: "integer",
                      },
                      limit: {
                        type: "integer",
                      },
                      totalDocuments: {
                        type: "integer",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized access attempt.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Unauthorized!",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                },
              },
            },
          },
        },
        404: {
          description: "No users found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "info",
                  },
                  msg: {
                    type: "string",
                    example: "No users found",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "integer",
                    example: 0,
                  },
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
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Unauthorized!",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/users/allUsers/{userId}": {
    get: {
      summary: "Retrieve a single user",
      tags: ["Users"],
      description:
        "Endpoint to retrieve a user profile by ID. Requires authentication.",
      parameters: [
        {
          in: "path",
          name: "userId",
          required: true,
          schema: {
            type: "string",
          },
          description: "The unique identifier of the user.",
        },
      ],
      responses: {
        200: {
          description: "A single user profile without password.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "success",
                  },
                  msg: {
                    type: "string",
                    example: "User retrieved successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      _id: { type: "string" },
                      phoneNumber: { type: "string" },
                      email: { type: "string" },
                      phoneConfirmed: { type: "boolean" },
                      emailConfirmed: { type: "boolean" },
                      accountVisibility: { type: "boolean" },
                      friends: {
                        type: "array",
                        items: { type: "string" },
                      },
                      role: { type: "string" },
                      jobSeeker: {
                        type: "object",
                        properties: {
                          // Define jobSeeker properties here
                        },
                      },
                      resumeId: {
                        type: "object",
                        properties: {
                          // Define resumeId properties here
                        },
                      },
                      tokens: {
                        type: "array",
                        items: { type: "string" },
                      },
                      coins: { type: "number" },
                      favorites: {
                        type: "array",
                        items: { type: "string" },
                      },
                      avatar: { type: "string" },
                      lastSeen: { type: "string", format: "date-time" },
                      createdAt: { type: "string", format: "date-time" },
                      __v: { type: "number" },
                    },
                  },
                  totalCount: {
                    type: "integer",
                    example: 1,
                  },
                },
              },
            },
          },
        },
        400: {
          description: "User not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "User not found",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "integer",
                    example: 0,
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized access attempt.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Unauthorized!",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "integer",
                    example: 0,
                  },
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
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Internal server error",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "integer",
                    example: 0,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/users/currentUser": {
    get: {
      summary: "Get the current authenticated user's profile",
      tags: ["Users"],
      description:
        "Endpoint to retrieve the profile of the current authenticated user.",
      responses: {
        200: {
          description: "The profile of the current user.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "success",
                  },
                  msg: {
                    type: "string",
                    example: "User retrieved successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      _id: {
                        type: "string",
                        example: "65c32d9a161b1868b18862c7",
                      },
                      phoneNumber: {
                        type: "string",
                        example: "+998934440022",
                      },
                      email: {
                        type: "string",
                        example: "",
                      },
                      phoneConfirmed: {
                        type: "boolean",
                        example: false,
                      },
                      emailConfirmed: {
                        type: "boolean",
                        example: false,
                      },
                      accountVisibility: {
                        type: "boolean",
                        example: false,
                      },
                      friends: {
                        type: "array",
                        items: {},
                      },
                      role: {
                        type: "string",
                        example: "Employer",
                      },
                      employer: {
                        type: "object",
                        properties: {
                          fullName: {
                            type: "string",
                            example: "Asadbek Alimov",
                          },
                          companyName: {
                            type: "string",
                            example: "AliExpress",
                          },
                          // Additional properties as defined in your response
                        },
                      },
                      tokens: {
                        type: "array",
                        items: {},
                      },
                      coins: {
                        type: "number",
                        example: 50,
                      },
                      favorites: {
                        type: "array",
                        items: {},
                      },
                      avatar: {
                        type: "string",
                        example: "",
                      },
                      lastSeen: {
                        type: "string",
                        format: "date-time",
                        example: "2024-02-07T07:13:30.692Z",
                      },
                      createdAt: {
                        type: "string",
                        format: "date-time",
                        example: "2024-02-07T07:13:30.692Z",
                      },
                    },
                  },
                  totalCount: {
                    type: "integer",
                    example: 1,
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
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Unauthorized!",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "integer",
                    example: 0,
                  },
                },
              },
            },
          },
        },
        404: {
          description: "The user profile was not found.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "User not found",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "integer",
                    example: 0,
                  },
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
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Internal server error",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: {
                    type: "integer",
                    example: 0,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/users/roles": {
    patch: {
      summary: "Add roles to a user",
      tags: ["Users"],
      description: "Endpoint to add roles to a user. Requires authentication.",
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
                userId: {
                  type: "string",
                  description: "The unique identifier of the user.",
                  example: "60d0fe4f5311236168a109ca",
                },
                roles: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "Array of roles to add to the user.",
                  example: ["copywriter", "editor"],
                },
              },
              required: ["userId", "roles"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Roles added successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "success",
                  },
                  msg: {
                    type: "string",
                    example: "Roles updated successfully",
                  },
                  data: {
                    $ref: "#/components/schemas/UserResponse",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid input.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Please provide valid userId and roles",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized access attempt.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Unauthorized!",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
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
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "User not found",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
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
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Something went wrong: {error.message}",
                  },
                  data: {
                    type: "null",
                    example: null,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  // "/users/updateRole": {
  //   patch: {
  //     requestBody: {
  //       required: true,
  //       content: {
  //         "application/json": {
  //           schema: {
  //             type: "object",
  //             properties: {
  //               role: {
  //                 type: "string",
  //                 enum: ["JobSeeker", "Employer", "Service"],
  //                 example: "Employer",
  //               },
  //             },
  //             required: ["role"],
  //           },
  //         },
  //       },
  //     },
  //     summary: "Update the role of the current authenticated user",
  //     tags: ["Users"],
  //     description:
  //       "Endpoint to update the role of the current authenticated user.",
  //     responses: {
  //       200: {
  //         description: "The role of the current user was updated successfully.",
  //         content: {
  //           "application/json": {
  //             schema: {
  //               type: "object",
  //               properties: {
  //                 result: {
  //                   type: "string",
  //                   example: "success",
  //                 },
  //                 msg: {
  //                   type: "string",
  //                   example: "User role updated successfully",
  //                 },
  //                 data: {
  //                   type: "object",
  //                   properties: {
  //                     _id: {
  //                       type: "string",
  //                       example: "65c32d9a161b1868b18862c7",
  //                     },
  //                     phoneNumber: {
  //                       type: "string",
  //                       example: "+998934440022",
  //                     },
  //                     email: {
  //                       type: "string",
  //                       example: "",
  //                     },
  //                     phoneConfirmed: {
  //                       type: "boolean",
  //                       example: false,
  //                     },
  //                     emailConfirmed: {
  //                       type: "boolean",
  //                       example: false,
  //                     },
  //                     accountVisibility: {
  //                       type: "boolean",
  //                       example: false,
  //                     },
  //                     friends: {
  //                       type: "array",
  //                       items: {},
  //                     },
  //                     role: {
  //                       type: "string",
  //                       example: "Employer",
  //                     },
  //                     employer: {
  //                       type: "object",
  //                       properties: {
  //                         fullName: {
  //                           type: "string",
  //                           example: "Asadbek Alimov",
  //                         },
  //                         companyName: {
  //                           type: "string",
  //                           example: "AliExpress",
  //                         },
  //                         // Additional properties as defined in your response
  //                       },
  //                     },
  //                     tokens: {
  //                       type: "array",
  //                       items: {},
  //                     },
  //                     coins: {
  //                       type: "number",
  //                       example: 50,
  //                     },
  //                     favorites: {
  //                       type: "array",
  //                       items: {},
  //                     },
  //                     avatar: {
  //                       type: "string",
  //                       example: "",
  //                     },
  //                     lastSeen: {
  //                       type: "string",
  //                       format: "date-time",
  //                       example: "2024-02-07T07:13:30.692Z",
  //                     },
  //                     createdAt: {
  //                       type: "string",
  //                       format: "date-time",
  //                       example: "2024-02-07T07:13:30.692Z",
  //                     },
  //                   },
  //                 },
  //                 totalCount: {
  //                   type: "integer",
  //                   example: 1,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //       401: {
  //         description:
  //           "Unauthorized access, no or invalid authentication token provided.",
  //         content: {
  //           "application/json": {
  //             schema: {
  //               type: "object",
  //               properties: {
  //                 result: {
  //                   type: "string",
  //                   example: "error",
  //                 },
  //                 msg: {
  //                   type: "string",
  //                   example: "Unauthorized!",
  //                 },
  //                 data: {
  //                   type: "null",
  //                   example: null,
  //                 },
  //                 totalCount: {
  //                   type: "integer",
  //                   example: 0,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //       404: {
  //         description: "The user profile was not found.",
  //         content: {
  //           "application/json": {
  //             schema: {
  //               type: "object",
  //               properties: {
  //                 result: {
  //                   type: "string",
  //                   example: "error",
  //                 },
  //                 msg: {
  //                   type: "string",
  //                   example: "User not found",
  //                 },
  //                 data: {
  //                   type: "null",
  //                   example: null,
  //                 },
  //                 totalCount: {
  //                   type: "integer",
  //                   example: 0,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //       500: {
  //         description: "Internal server error.",
  //         content: {
  //           "application/json": {
  //             schema: {
  //               type: "object",
  //               properties: {
  //                 result: {
  //                   type: "string",
  //                   example: "error",
  //                 },
  //                 msg: {
  //                   type: "string",
  //                   example: "Internal server error",
  //                 },
  //                 data: {
  //                   type: "null",
  //                   example: null,
  //                 },
  //                 totalCount: {
  //                   type: "integer",
  //                   example: 0,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // },

  "/users/updateProfile": {
    put: {
      summary: "Update user profile",
      description:
        "Update user profile information. Handles all user types in one endpoint.",
      tags: ["Users"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                fullName: { type: "string", example: "John Doe" },
                gender: { type: "string", example: "Male" },
                birthday: { type: "string", example: "1990-01-01" },
                location: { type: "string", example: "Tashkent" },
                email: { type: "string", example: "example@example.com" },
                jobTitle: { type: "string", example: "Software Developer" },
                expectedSalary: { type: "string", example: "0-10000" },
                skills: {
                  type: "array",
                  items: { type: "string" },
                  example: ["JavaScript", "React", "Node.js"],
                },
                workingExperience: { type: "string", example: "5 years" },
                employmentType: { type: "string", example: "full-time" },
                companyName: { type: "string", example: "Google" },
                industry: { type: "string", example: "IT" },
                aboutCompany: {
                  type: "string",
                  example: "Google is a multinational technology company",
                },
                number: { type: "string", example: "1234567890" },
                purpose: { type: "string", example: "New Career Objective" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Profile updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Profile updated successfully",
                  },
                  data: { $ref: "#/components/schemas/Users" },
                  totalCount: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid input or bad request",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Invalid input or bad request",
                  },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized access",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        404: {
          description: "User not found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "User not found" },
                  data: { type: "null", example: null },
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
                  msg: { type: "string", example: "Internal server error" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
      },
    },
  },

  "/users/updateUsername": {
    patch: {
      summary: "Update username",
      tags: ["Users"],
      description:
        "Endpoint to update the username of the current authenticated user.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                username: {
                  type: "string",
                  example: "newUsername",
                },
              },
              required: ["username"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Username updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Username updated successfully",
                  },
                  data: { $ref: "#/components/schemas/Users" },
                  totalCount: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        400: {
          description: "Bad Request, username already exists",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Username already in use" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        404: {
          description: "User not found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "User not found" },
                  data: { type: "null", example: null },
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
                  msg: { type: "string", example: "Internal server error" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
      },
    },
  },
  // router.route("/updateCoinsForUser").patch(authMiddleware, updateCoinsForUser); // updateUser
  "/users/updateCoinsForAllUsers": {
    patch: {
      summary: "Update coins for all users",
      tags: ["Users"],
      description: "Endpoint to update coins for all users.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                coins: {
                  type: "number",
                  example: 500,
                },
              },
              required: ["coins"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Username updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Username updated successfully",
                  },
                  data: { $ref: "#/components/schemas/Users" },
                  totalCount: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        400: {
          description: "Bad Request, username already exists",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Username already in use" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        404: {
          description: "User not found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "User not found" },
                  data: { type: "null", example: null },
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
                  msg: { type: "string", example: "Internal server error" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
      },
    },
  },
  "/users/updateCoinsForUser": {
    patch: {
      summary: "Update coins for a single user",
      tags: ["Users"],
      description: "Endpoint to update coins for a single user.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                coins: {
                  type: "number",
                  example: 500,
                  required: true,
                },
                userId: {
                  type: "string",
                  example: "65c32d9a161b1868b18862c7",
                  required: true,
                },
              },

              required: ["coins"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Username updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Username updated successfully",
                  },
                  data: { $ref: "#/components/schemas/Users" },
                  totalCount: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        400: {
          description: "Bad Request, username already exists",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Username already in use" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        404: {
          description: "User not found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "User not found" },
                  data: { type: "null", example: null },
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
                  msg: { type: "string", example: "Internal server error" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
      },
    },
  },
  "/users/updateUserVisibility": {
    patch: {
      summary: "Update visibility for all users",
      tags: ["Users"],
      description: "Endpoint to update visibility for all users.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                visible: {
                  type: "boolean",
                  example: true,
                  required: true,
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Visibility updated successfully for all users",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "Visibility updated successfully for all users",
                  },
                  data: { $ref: "#/components/schemas/Users" },
                  totalCount: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        400: {
          description: "Bad Request",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Invalid visibility value" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized" },
                  data: { type: "null", example: null },
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
                  msg: { type: "string", example: "Internal server error" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
      },
    },
// ...existing code...
},
"/users/searchUsers": {
  get: {
    summary: "Search users",
    tags: ["Users"],
    description: "Endpoint to search users by fullName, email, username, or phoneNumber.",
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        in: "query",
        name: "searchTerm",
        required: true,
        schema: {
          type: "string",
        },
        description: "The search term to look for in fullName, email, username, or phoneNumber.",
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
        description: "Number of items per page.",
      },
    ],
    responses: {
      200: {
        description: "Users retrieved successfully.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                result: {
                  type: "string",
                  example: "success",
                },
                msg: {
                  type: "string",
                  example: "Users retrieved successfully",
                },
                data: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/UserResponse",
                  },
                },
                totalCount: {
                  type: "integer",
                  example: 3,
                },
                pagination: {
                  type: "object",
                  properties: {
                    currentPage: {
                      type: "integer",
                    },
                    totalPages: {
                      type: "integer",
                    },
                    limit: {
                      type: "integer",
                    },
                    totalDocuments: {
                      type: "integer",
                    },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: "Please provide a search term",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                result: {
                  type: "string",
                  example: "error",
                },
                msg: {
                  type: "string",
                  example: "Please provide a search term",
                },
                data: {
                  type: "null",
                  example: null,
                },
              },
            },
          },
        },
      },
      401: {
        description: "Unauthorized access attempt.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                result: {
                  type: "string",
                  example: "error",
                },
                msg: {
                  type: "string",
                  example: "Unauthorized!",
                },
                data: {
                  type: "null",
                  example: null,
                },
              },
            },
          },
        },
      },
      404: {
        description: "No users found.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                result: {
                  type: "string",
                  example: "info",
                },
                msg: {
                  type: "string",
                  example: "No users found",
                },
                data: {
                  type: "array",
                  example: [],
                },
                totalCount: {
                  type: "integer",
                  example: 0,
                },
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
                result: {
                  type: "string",
                  example: "error",
                },
                msg: {
                  type: "string",
                  example: "Something went wrong: {error.message}",
                },
                data: {
                  type: "null",
                  example: null,
                },
              },
            },
          },
        },
      },
    },
  },
},
"/users/updateJobTitle": {
// ...existing code...
    patch: {
      summary: "Update the user's job title",
      tags: ["Users"],
      description: "Endpoint to update the jobTitle of the current authenticated user.",
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
                jobTitle: {
                  type: "string",
                  example: "Senior Developer",
                },
              },
              required: ["jobTitle"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Job title updated successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: {
                    type: "string",
                    example: "success",
                  },
                  msg: {
                    type: "string",
                    example: "Job title updated successfully",
                  },
                  data: {
                    $ref: "#/components/schemas/Users",
                  },
                  totalCount: {
                    type: "integer",
                    example: 1,
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Bad request or invalid input",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Please provide a jobTitle",
                  },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized access, no or invalid auth token provided",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        404: {
          description: "User not found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "User not found" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        500: {
          description: "Internal server error or exception thrown",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example: "Internal server error",
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

module.exports = { UsersEndpoint };
