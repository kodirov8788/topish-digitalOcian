const UpdateUser = {
    tags: [
        {
            name: 'UpdateUser',
            description: 'The UpdateUser managing API',
        },
    ],
    '/users/updateUserNumber': {
        patch: {
            summary: 'Update user profile',
            tags: ['UpdateUser'],
            description: 'Endpoint to update the authenticated user\'s profile. Requires authentication.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                phoneNumber: {
                                    type: 'number',
                                    example: "937774444"
                                }
                            },
                            required: ['phoneNumber']
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "The user profile was updated successfully.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: {
                                        type: "boolean",
                                        example: true,
                                    },
                                    msg: {
                                        type: "string",
                                        example: "The information was updated successfully",
                                    },
                                    data: {
                                        type: "object",
                                        properties: {
                                            email: {
                                                type: "string",
                                                example: "",
                                            },
                                            phoneNumber: {
                                                type: "string",
                                                example: "937774444",
                                            },
                                        }
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
                "400": {
                    description: "Missing email or phoneNumber in the request body.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: {
                                        type: "boolean",
                                        example: false,
                                    },
                                    msg: {
                                        type: "string",
                                        example: "Please provide all values",
                                    },
                                    data: {
                                        type: "object",
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
                "401": {
                    description: "Unauthorized access, no or invalid authentication token provided.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: {
                                        type: "boolean",
                                        example: false,
                                    },
                                    msg: {
                                        type: "string",
                                        example: "Unauthorized!",
                                    },
                                    data: {
                                        type: "object",
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
                "500": {
                    description: "Internal server error or exception thrown.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: {
                                        type: "boolean",
                                        example: false,
                                    },
                                    msg: {
                                        type: "string",
                                        example: "There is an error with Updating your information",
                                    },
                                    data: {
                                        type: "object",
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
            }
        }
    },
    '/users/updateUserEmail': {
        patch: {
            summary: 'Update user profile',
            tags: ['UpdateUser'],
            description: 'Endpoint to update the authenticated user\'s profile. Requires authentication.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                email: {
                                    type: 'string',
                                    format: 'email',
                                    example: 'newemail@example.com',
                                },
                            },
                            required: ['email']
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "The user profile was updated successfully.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: {
                                        type: "boolean",
                                        example: true,
                                    },
                                    msg: {
                                        type: "string",
                                        example: "The information was updated successfully",
                                    },
                                    data: {
                                        $ref: "#/components/schemas/UserResponse",
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
                "400": {
                    description: "Missing email or phoneNumber in the request body.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: {
                                        type: "boolean",
                                        example: false,
                                    },
                                    msg: {
                                        type: "string",
                                        example: "Please provide all values",
                                    },
                                    data: {
                                        type: "object",
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
                "401": {
                    description: "Unauthorized access, no or invalid authentication token provided.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: {
                                        type: "boolean",
                                        example: false,
                                    },
                                    msg: {
                                        type: "string",
                                        example: "Unauthorized!",
                                    },
                                    data: {
                                        type: "object",
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
                "500": {
                    description: "Internal server error or exception thrown.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: {
                                        type: "boolean",
                                        example: false,
                                    },
                                    msg: {
                                        type: "string",
                                        example: "There is an error with Updating your information",
                                    },
                                    data: {
                                        type: "object",
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
            }
        }
    },
    '/users/updatePassword': {
        patch: {
            summary: 'Update user password',
            tags: ['UpdateUser'],
            description: 'Endpoint to update the authenticated user\'s password. Requires authentication.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                oldPassword: {
                                    type: 'string',
                                    format: 'password',
                                    example: 'oldPassword123',
                                },
                                newPassword: {
                                    type: 'string',
                                    format: 'password',
                                    example: 'newPassword123'
                                }
                            },
                            required: ['oldPassword', 'newPassword']
                        }
                    }
                }
            },
            responses: {
                "200": {
                    "description": "Password updated successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Success! Password Updated." },
                                    "data": { "type": "object", "example": {} },
                                    "totalCount": { "type": "integer", "example": 1 }
                                }
                            }
                        }
                    }
                },
                "400": {
                    "description": "Missing oldPassword or newPassword in the request body or invalid credentials.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Please provide all required values or Invalid Credentials" },
                                    "data": { "type": "object", "example": {} },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "401": {
                    "description": "Unauthorized access, no or invalid authentication token provided.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Unauthorized access, no or invalid authentication token provided." },
                                    "data": { "type": "object", "example": {} },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "500": {
                    "description": "Internal server error or exception thrown.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Internal server error or exception thrown." },
                                    "data": { "type": "object", "example": {} },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

}


module.exports = {
    UpdateUser
};

