// src/docs/skillsDocs.js
const skillsEndpoint = {
    tags: [
        {
            name: 'Skills',
            description: 'The Skills managing API',
        },
    ],
    '/users/resume/skills': {
        post: {
            summary: 'Add or update skills in a user\'s resume',
            tags: ['Skills'],
            description: 'Allows a user to add or update skills in their resume. Requires user authentication.',
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
                                skills: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                    },
                                },
                            },
                            example: {
                                skills: ["JavaScript", "React", "Node.js"],
                            },
                        },
                    },
                },
            },
            responses: {
                "200": {
                    "description": "Skills added or updated successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Skills added or updated successfully." },
                                    "data": {
                                        "type": "array",
                                        "items": {
                                            "type": "string"
                                        },
                                        "example": ["JavaScript", "React", "Node.js"]
                                    },
                                    "totalCount": { "type": "number", "example": 3 }
                                }
                            }
                        }
                    }
                },
                "400": {
                    "description": "Bad request. Invalid or missing skills.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Bad request. Invalid or missing skills." },
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
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Unauthorized. User is not authenticated." },
                                    "data": { "type": "object", "example": {} },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "404": {
                    "description": "User not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "User not found." },
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
    skillsEndpoint,
};



