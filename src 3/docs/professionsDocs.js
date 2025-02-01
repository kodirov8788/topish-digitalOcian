// src/docs/professionsDocs.js
const professionsEndpoint = {
    tags: [
        {
            name: 'Professions',
            description: 'The Professions managing API',
        },
    ],
    '/users/resume/professions': {
        post: {
            summary: 'Add or update professions in a user\'s resume',
            tags: ['Professions'],
            description: 'Allows a user to add or update professions in their resume. Requires user authentication.',
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
                                professions: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                    },
                                },
                            },
                            example: {
                                professions: ["Teacher", "Doctor", "Engineer"],
                            },
                        },
                    },
                },
            },
            responses: {
                "200": {
                    "description": "Professions added or updated successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Professions added or updated successfully." },
                                    "data": {
                                        "type": "array",
                                        "items": {
                                            "type": "string"
                                        },
                                        "example": ["Teacher", "Doctor", "Engineer"]
                                    },
                                    "totalCount": { "type": "number", "example": 3 }
                                }
                            }
                        }
                    }
                },
                "400": {
                    "description": "Bad request. Invalid or missing professions.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Bad request. Invalid or missing professions." },
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
    professionsEndpoint,
};



