const cvFileEndpoints = {
    tags: [
        {
            name: 'CVFiles',
            description: 'The CV File managing API',
        },
    ],
    '/users/resume/cv': {
        post: {
            summary: 'Add a new CV file',
            tags: ['CVFiles'],
            description: 'Allows a user to upload a new CV file to their resume.',
            security: [
                {
                    bearerAuth: [],
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            properties: {
                                cv: {
                                    type: 'string',
                                    format: 'binary',
                                    description: 'CV file to upload.',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                "201": {
                    "description": "CV file uploaded successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "CV file uploaded successfully." },
                                    "data": { "$ref": "#/components/schemas/CVFile" },
                                    "totalCount": { "type": "number", "example": 1 }
                                }
                            }
                        }
                    }
                },
                "401": {
                    "description": "Unauthorized. User is not authenticated.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Unauthorized. User is not authenticated." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "404": {
                    "description": "User or Resume not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "User or Resume not found." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "500": {
                    "description": "Internal server error.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Internal server error." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                }
            }
        },
        get: {
            summary: 'Retrieve CV files',
            tags: ['CVFiles'],
            description: 'Allows a user to retrieve their CV files from their resume.',
            security: [
                {
                    bearerAuth: [],
                },
            ],
            responses: {
                "200": {
                    "description": "CV files retrieved successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "CV files retrieved successfully." },
                                    "data": {
                                        "type": "array",
                                        "items": { "$ref": "#/components/schemas/CVFile" }
                                    },
                                    "totalCount": { "type": "number", "example": 2 } // Assuming an actual count example is provided
                                }
                            }
                        }
                    }
                },
                "401": {
                    "description": "Unauthorized. User is not logged in.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Unauthorized. User is not logged in." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "404": {
                    "description": "User or Resume not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "User or Resume not found." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "500": {
                    "description": "Internal server error.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Internal server error." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                }
            }
        },
        delete: {
            summary: 'Remove an existing CV file',
            tags: ['CVFiles'],
            description: 'Allows a user to remove an existing CV file from their resume.',
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
            ],
            responses: {
                "200": {
                    "description": "CV file removed successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "CV file removed successfully." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "401": {
                    "description": "Unauthorized. User is not authenticated.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Unauthorized. User is not authenticated." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "404": {
                    "description": "User, Resume, or CV file not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "User, Resume, or CV file not found." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "500": {
                    "description": "Internal server error.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Internal server error." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                }
            }
        },
    }
};

module.exports = {
    cvFileEndpoints,
};


