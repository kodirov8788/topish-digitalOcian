const GPTDocs = {
  tags: [
    {
      name: "GPT",
      description: "AI assistant endpoints using OpenAI GPT",
    },
  ],
  "/gpt/prompt": {
    post: {
      summary: "Send a prompt to GPT",
      tags: ["GPT"],
      description:
        "Submit a prompt to OpenAI's GPT model and receive a response. Limited usage per day.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["prompt"],
              properties: {
                prompt: {
                  type: "string",
                  description: "The prompt text to send to GPT",
                  example: "Explain the difference between REST and GraphQL",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "AI generated response",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "success" },
                  msg: {
                    type: "string",
                    example: "GPT response generated successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      response: {
                        type: "string",
                        example:
                          "REST is an architectural style for API design that...",
                      },
                      usageToday: { type: "integer", example: 3 },
                      dailyLimit: { type: "integer", example: 5 },
                      remaining: { type: "integer", example: 2 },
                    },
                  },
                  totalCount: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid request",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: { type: "string", example: "Prompt is required" },
                  data: { type: "null", example: null },
                  totalCount: { type: "integer", example: 0 },
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
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        429: {
          description: "Daily limit exceeded",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", example: "error" },
                  msg: {
                    type: "string",
                    example:
                      "Daily limit of 5 GPT requests reached. Please try again tomorrow.",
                  },
                  data: { type: "null", example: null },
                  totalCount: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
        500: {
          description: "Server error",
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
  "/gpt/settings": {
    put: {
      summary: "Update GPT settings",
      tags: ["GPT"],
      description:
        "Update user's GPT settings including system prompt and daily usage limit.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                gptPrompt: {
                  type: "string",
                  description: "System prompt to use with GPT",
                  example:
                    "You are a helpful assistant specialized in programming tasks.",
                },
                gptDailyLimit: {
                  type: "integer",
                  description: "Number of GPT requests allowed per day",
                  example: 10,
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Settings updated successfully",
        },
        400: {
          description: "Invalid request",
        },
        401: {
          description: "Unauthorized",
        },
        500: {
          description: "Server error",
        },
      },
    },
  },
  "/gpt/usage": {
    get: {
      summary: "Get user's GPT usage",
      tags: ["GPT"],
      description:
        "Get information about the user's GPT usage for today, including remaining requests.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Usage information retrieved successfully",
        },
        401: {
          description: "Unauthorized",
        },
        500: {
          description: "Server error",
        },
      },
    },
  },
};

module.exports = {
  GPTDocs,
};
