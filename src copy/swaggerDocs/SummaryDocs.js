const summaryEndpoint = {
    tags: [
        {
            name: 'Summary',
            description: 'The Summary managing API',
        },
    ],
    '/users/resume/summary': {
        post: {
            summary: 'Add or update the summary in a user\'s resume',
            tags: ['Summary'],
            description: 'Allows a user to add or update the summary in their resume.',
            security: [
                {
                    bearerAuth: [],
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                summary: {
                                    type: 'string',
                                    description: 'A brief summary or introduction about the user.',
                                    example: 'Experienced web developer with a strong background in developing award-winning applications for a diverse clientele.',
                                },
                            },
                            required: ['summary'],
                        },
                    },
                },
            },
            responses: {
                "200": {
                    "description": "Summary updated successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Summary updated successfully." },
                                    "data": {
                                        "summary": "Experienced web developer with a strong background in developing award-winning applications for a diverse clientele."

                                    },
                                    "totalCount": { "type": "number", "example": 1 }
                                }
                            }
                        }
                    }
                },
                "201": {
                    "description": "Summary added successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Summary added successfully." },
                                    "data": {
                                        "summary": "Experienced web developer with a strong background in developing award-winning applications for a diverse clientele."

                                    },
                                    "totalCount": { "type": "number", "example": 1 }
                                }
                            }
                        }
                    }
                },
                "400": {
                    "description": "Invalid request. Invalid or missing summary.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Invalid request. Invalid or missing summary." },
                                    "data": { "type": "object", "example": {} },
                                    "totalCount": { "type": "number", "example": 0 }
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
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Unauthorized. User is not logged in." },
                                    "data": { "type": "object", "example": {} },
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
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "User or Resume not found." },
                                    "data": { "type": "object", "example": {} },
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
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Internal server error." },
                                    "data": { "type": "object", "example": {} },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                }
            }
        },
    },
};



module.exports = {
    summaryEndpoint,
};



