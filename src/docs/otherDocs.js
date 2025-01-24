// src/docs/otherDocs.js
const othersEndpoint = {
    tags: [
        {
            name: 'AddProfessions',
            description: 'The Professions managing API',
        },
    ],
    '/others/professions': {
        get: {
            summary: 'Fetch all professions',
            tags: ['AddProfessions'],
            description: 'Fetches all professions available in the database.',
            parameters: [
                {
                    name: 'language',
                    in: 'query',
                    required: true,
                    description: 'The language of the professions to fetch.',
                    schema: {
                        type: 'string',
                        example: 'en',
                    },
                },
            ],
            responses: {
                "200": {
                    "description": "Professions fetched successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Professions fetched successfully." },
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
                    "description": "Bad request. Missing language parameter.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Language is required" },
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
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Something went wrong: error message" },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                }
            }
        },
        post: {
            summary: 'Add or update professions',
            tags: ['AddProfessions'],
            description: 'Allows a user to add or update professions in their resume.',
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
                                language: {
                                    type: 'string',
                                    description: 'The language for the professions.',
                                    example: 'en',
                                },
                                professions: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                    },
                                    description: 'Array of professions to add or update.',
                                },
                            },
                            example: {
                                language: 'en',
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
                                    "msg": { "type": "string", "example": "Professions updated successfully." },
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
                                    "msg": { "type": "string", "example": "Professions should be a non-empty array of strings." },
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
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Something went wrong: error message" },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
};

module.exports = {
    othersEndpoint,
};
