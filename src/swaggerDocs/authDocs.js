// swaggerSchemas.js

const AuthEndpoints = {
  tags: [
    {
      name: "Auth",
      description: "The Auth managing API",
    },
  ],
  "/auth/create-user": {
    post: {
      summary: "Send registration code",
      tags: ["Auth"],
      description: "Send a confirmation code to the user's phone number for registration.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["phoneNumber", "role", "mobileToken"],
              properties: {
                phoneNumber: {
                  type: "string",
                  description: "User's phone number",
                  example: "996730970",
                  pattern: "^[0-9]+$",
                },
                role: {
                  type: "string",
                  enum: ["JobSeeker", "Employer"],
                  description: "Role of the user in the system",
                  example: "JobSeeker",
                },
                mobileToken: {
                  type: "string",
                  description: "The mobile token of the user",
                  example: "12345",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Confirmation code sent successfully",
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
                    example: "Confirmation code sent. Please check your phone.",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "User already exists with this phone number or validation error",
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
                    example: "User already exists with this phone number or validation error.",
                  },
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
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Something went wrong",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/auth/create-user/confirmCode": {
    post: {
      summary: "Confirm phone number with code",
      tags: ["Auth"],
      description: "Confirm the phone number using the confirmation code sent to the user's phone.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                phoneNumber: {
                  type: "string",
                  description: "The user's phone number",
                  example: "996730970",
                },
                confirmationCode: {
                  type: "string",
                  description: "The confirmation code sent to the user's phone",
                  example: "112233",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "User registered successfully",
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
                    example: "User registered successfully.",
                  },
                  data: {
                    type: "object",
                    properties: {
                      accessToken: { type: "string", example: "access_token_example" },
                      refreshToken: { type: "string", example: "refresh_token_example" },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid or expired confirmation code or validation error",
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
                    example: "Invalid or expired confirmation code or validation error.",
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Something went wrong",
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
                    example: "Something went wrong",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/auth/create-user/resendCode": {
    post: {
      summary: "Resend confirmation code",
      tags: ["Auth"],
      description: "Resend the confirmation code to the user's phone number.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                phoneNumber: {
                  type: "string",
                  description: "The user's phone number",
                  example: "996730970",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Confirmation code resent successfully",
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
                    example: "Confirmation code resent successfully",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "User not found with this phone number",
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
                    example: "User not found with this phone number",
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Something went wrong",
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
                    example: "Something went wrong",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/auth/sign-in": {
    post: {
      summary: "Send login code",
      tags: ["Auth"],
      description: "Send a confirmation code to the user's phone number for login.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                phoneNumber: {
                  type: "string",
                  description: "User's phone number",
                  example: "996730970",
                  pattern: "^[0-9]+$",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Confirmation code sent successfully",
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
                    example: "Confirmation code sent. Please check your phone.",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "User not found with this phone number",
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
                    example: "User not found with this phone number",
                  },
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
                  result: {
                    type: "string",
                    example: "error",
                  },
                  msg: {
                    type: "string",
                    example: "Something went wrong",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/auth/sign-in/confirm": {
    post: {
      summary: "Confirm login",
      tags: ["Auth"],
      description: "Confirm the user's login using the confirmation code sent to their phone.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                phoneNumber: {
                  type: "string",
                  description: "The user's phone number",
                  example: "996730970",
                },
                confirmationCode: {
                  type: "string",
                  description: "The confirmation code sent to the user's phone",
                  example: "112233",
                },
                mobileToken: {
                  type: "string",
                  description: "The mobile token of the user",
                  example: "fcmToken",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Login successful",
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
                    example: "Login successful",
                  },
                  data: {
                    type: "object",
                    properties: {
                      accessToken: { type: "string", example: "access_token_example" },
                      refreshToken: { type: "string", example: "refresh_token_example" },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid or expired confirmation code",
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
                    example: "Invalid or expired confirmation code",
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Something went wrong",
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
                    example: "Something went wrong",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/auth/sign-out": {
    post: {
      summary: "Sign out the current user",
      tags: ["Auth"],
      description: "Endpoint for signing out the current user. This clears the user's auth token.",
      security: [
        {
          cookieAuth: [], // Assuming you are using cookie-based authentication
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                mobileToken: {
                  type: "string",
                  description: "The mobile token of the user",
                  example: "12345",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "User logged out successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "User logged out!" },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized. User is not authenticated or token is invalid.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized!" },
                  data: { type: "object", example: {} },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description: "Internal server error. Something went wrong during the sign out process.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Something went wrong during the sign out process." },
                  data: { type: "object", example: {} },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
      },
    },
  },
  "/auth/deleteAccount": {
    delete: {
      summary: "Delete a user account",
      tags: ["Auth"],
      description: "This endpoint deletes a user's account. It requires the user to be authenticated.",
      security: [
        {
          cookieAuth: [],
        },
      ],
      responses: {
        200: {
          description: "Account deleted successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: { type: "string", example: "Account deleted successfully" },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized. User is not authenticated or token is invalid.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Unauthorized!" },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description: "Internal server error. An error occurred while deleting the account.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "An error occurred while deleting the account." },
                  data: {
                    type: "null",
                    example: null,
                  },
                  totalCount: { type: "number", example: 0 },
                },
              },
            },
          },
        },
      },
    },
  },
  "/auth/renewAccessToken": {
    post: {
      summary: "Renew access token",
      tags: ["Auth"],
      description: "Endpoint for renewing the access token using a refresh token.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                refreshToken: {
                  type: "string",
                  description: "The refresh token",
                  example: "refresh_token_example",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Access token renewed successfully",
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
                    example: "Access token renewed successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      accessToken: { type: "string", example: "access_token_example" },
                      refreshToken: { type: "string", example: "refresh_token_example" },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Refresh token is required",
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
                    example: "Refresh token is required",
                  },
                },
              },
            },
          },
        },
        403: {
          description: "Invalid refresh token",
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
                    example: "Invalid refresh token",
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Something went wrong",
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
                    example: "Something went wrong",
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
// authEndpoints.js

module.exports = { AuthEndpoints };
