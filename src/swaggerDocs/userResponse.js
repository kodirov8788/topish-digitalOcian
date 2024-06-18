const userDocSchema = {
  schemas: {
    Users: {
      type: "object",
      required: ["phoneNumber", "email", "password"],
      properties: {
        phoneNumber: {
          type: "number",
          description: "Unique phone number of the user",
        },
        email: {
          type: "string",
          format: "email",
          description: "Unique email address of the user",
        },
        phoneConfirmed: {
          type: "boolean",
          default: false,
          description: "Indicates if the phone number is confirmed",
        },
        emailConfirmed: {
          type: "boolean",
          default: false,
          description: "Indicates if the email is confirmed",
        },
        accountVisibility: {
          type: "boolean",
          default: false,
          description: "User's account visibility status",
        },
        lastSeen: {
          type: "string",
          format: "date-time",
          description: "The last date and time the user was seen",
        },
        role: {
          type: "string",
          enum: ["JobSeeker", "Employer"],
          description: "The role of the user",
        },
        password: {
          type: "string",
          format: "password",
          description: "User's password with a minimum length of 8 characters",
        },
        tokens: {
          type: "array",
          items: {
            type: "object",
          },
          description: "Array of user's tokens",
        },
        coins: {
          type: "number",
          default: 50,
          description: "Number of coins assigned to the user",
        },
        favorites: {
          type: "array",
          items: {
            type: "string",
            format: "uuid",
          },
          description: "Array of favorite user IDs",
        },
        avatar: {
          type: "string",
          description: "URL to the user's avatar",
        },
        createdAt: {
          type: "string",
          format: "date-time",
          description: "The date and time when the user account was created",
        },
      },
    },
  },
};
// const UserDocResponseSchema = {
//     UserResponse: {
//         type: 'object',
//         properties: {
//             success: {
//                 type: 'boolean',
//                 example: true,
//             },
//             message: {
//                 type: 'string',
//                 example: 'User registered successfully',
//             },
//             user: {
//                 type: 'object',
//                 properties: {
//                     email: {
//                         type: 'string',
//                         example: 'user@example.com',
//                     },
//                     phoneNumber: {
//                         type: 'integer',
//                         example: 1234567890,
//                     },
//                     coins: {
//                         type: 'integer',
//                         example: 50,
//                     },
//                     userId: {
//                         type: 'string',
//                         example: '65a6e58bedc6b24ba1e91ed5',
//                     },
//                     role: {
//                         type: 'string',
//                         example: 'JobSeeker',
//                     },
//                     favorites: {
//                         type: 'array',
//                         items: {
//                             type: 'string',
//                         },
//                     },
//                     jobSeeker: {
//                         type: 'object',
//                         properties: {
//                             fullName: {
//                                 type: 'string',
//                                 example: 'John Doe',
//                             },
//                             gender: {
//                                 type: 'string',
//                                 example: 'Male',
//                             },
//                             currentLocation: {
//                                 type: 'string',
//                                 example: 'New York',
//                             },
//                             // Add other properties of jobSeeker if needed
//                         },
//                     },
//                     // Add other properties if needed
//                 },
//             },
//         },
//     },
// };

const UserDocResponseSchema = {
  UserResponse: {
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "65a6e58bedc6b24ba1e91ed5",
      },
      phoneNumber: {
        type: "number",
        example: 1234567890,
      },
      email: {
        type: "string",
        format: "email",
        example: "user@example.com",
      },
      role: {
        type: "string",
        example: "JobSeeker",
      },
      jobSeeker: {
        $ref: "#/components/schemas/JobSeeker",
      },
      employer: {
        $ref: "#/components/schemas/Employer",
      },
      resume: {
        $ref: "#/components/schemas/Resume",
      },
      coins: {
        type: "number",
        example: 50,
      },
      favorites: {
        type: "array",
        items: {
          type: "string",
        },
      },
      avatar: {
        type: "string",
        example: "avatar-url",
      },
    },
  },
};

module.exports = { UserDocResponseSchema, userDocSchema };
