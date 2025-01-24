// src/docs/awardsDocs.js
const AwardsEndpoints = {
    tags: [
        {
            name: 'Awards',
            description: 'The Awards managing API',
        },
    ],
    '/users/resume/awards': {
        post: {
            summary: 'Add a new award to the user\'s resume',
            tags: ['Awards'],
            description: 'Allows users to add a new award to their resume. The user must be authenticated.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                title: {
                                    type: 'string',
                                    description: 'Title of the award.',
                                    example: 'Best Innovator of the Year'
                                },
                                issuer: {
                                    type: 'string',
                                    description: 'Issuer of the award.',
                                    example: 'Innovation Institute'
                                },
                                dateAwarded: {
                                    type: 'string',
                                    format: 'date',
                                    description: 'Date when the award was received.',
                                    example: '2023-05-12'
                                },
                                description: {
                                    type: 'string',
                                    description: 'Description of the award.',
                                    example: 'Awarded for outstanding innovation in technology.'
                                }
                            },
                            required: ['title', 'issuer', 'dateAwarded']
                        }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Award added successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Award added successfully' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                title: { type: 'string', example: 'Best Innovator of the Year' },
                                                issuer: { type: 'string', example: 'Innovation Institute' },
                                                dateAwarded: { type: 'string', format: 'date', example: '2023-05-12' },
                                                description: { type: 'string', example: 'Awarded for outstanding innovation in technology.' },
                                                id: { type: 'string', example: '1afa7dbe-e513-4563-8877-d7a10db87c37' }
                                            }
                                        }
                                    },
                                    totalCount: { type: 'number', example: 1 },
                                },
                            },
                        },
                    },
                },
                '401': {
                    description: 'Unauthorized. Incorrect email or password.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Incorrect email or password.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
                '404': {
                    description: 'User or resume not found.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'User or resume not found.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
                '500': {
                    description: 'Internal server error.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Internal server error.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
            }
        },
        get: {
            summary: 'Retrieve awards from the user\'s resume',
            tags: ['Awards'],
            description: 'Allows users to retrieve all awards from their resume. The user must be authenticated.',
            responses: {
                '200': {
                    description: 'Awards retrieved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Awards retrieved successfully.' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                title: { type: 'string', example: 'Best Innovator of the Year' },
                                                issuer: { type: 'string', example: 'Innovation Institute' },
                                                dateAwarded: { type: 'string', format: 'date', example: '2023-05-12' },
                                                description: { type: 'string', example: 'Awarded for outstanding innovation in technology.' },
                                                id: { type: 'string', example: '1afa7dbe-e513-4563-8877-d7a10db87c37' }
                                            }
                                        }
                                    },
                                    totalCount: { type: 'number', example: 1 },
                                },
                            },
                        },
                    },
                },
                "400": {
                    "description": "Bad Request. Validation error.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "\"title\" is not allowed to be empty" },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized. User is not authenticated.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "\"title\" is not allowed to be empty" },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'User or resume not found.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "\"title\" is not allowed to be empty" },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal server error.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "\"title\" is not allowed to be empty" },
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
    '/users/resume/awards/{id}': {
        put: {
            summary: 'Update a specific award in the user\'s resume',
            tags: ['Awards'],
            description: 'Allows users to update a specific award in their resume. The user must be authenticated.',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string'
                    },
                    description: 'UUID of the award to update',
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                title: {
                                    type: 'string',
                                    description: 'Title of the award.',
                                    example: 'Best Innovator of the Year'
                                },
                                issuer: {
                                    type: 'string',
                                    description: 'Issuer of the award.',
                                    example: 'Innovation Institute'
                                },
                                dateAwarded: {
                                    type: 'string',
                                    format: 'date',
                                    description: 'Date when the award was received.',
                                    example: '2023-05-12'
                                },
                                description: {
                                    type: 'string',
                                    description: 'Description of the award.',
                                    example: 'Awarded for outstanding innovation in technology.'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Award updated successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Award updated successfully.' }, // Adjusted to match the operation
                                    data: {
                                        type: 'array', // If updating a single award, consider changing this to 'type: 'object'' unless you're indeed returning an array of updated awards
                                        items: {
                                            type: 'object',
                                            properties: {
                                                title: { type: 'string', example: 'Best Innovator of the Year' },
                                                issuer: { type: 'string', example: 'Innovation Institute' },
                                                dateAwarded: { type: 'string', format: 'date', example: '2023-05-12' },
                                                description: { type: 'string', example: 'Awarded for outstanding innovation in technology.' },
                                                id: { type: 'string', example: '1afa7dbe-e513-4563-8877-d7a10db87c37' }
                                            }
                                        }
                                    },
                                    totalCount: { type: 'number', example: 1 }, // If updating a single award, this might not be necessary unless you're returning a collection of items
                                },
                            },
                        },
                    },
                },
                "400": {
                    "description": "Bad Request. Validation error.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "\"title\" is not allowed to be empty" },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized. User is not authenticated.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "\"title\" is not allowed to be empty" },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'User or resume not found.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "\"title\" is not allowed to be empty" },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal server error.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "\"title\" is not allowed to be empty" },
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
            summary: 'Delete a specific award from the user\'s resume',
            tags: ['Awards'],
            description: 'Allows users to delete a specific award from their resume. The user must be authenticated.',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string'
                    },
                    description: 'UUID of the award to delete',
                },
            ],
            responses: {
                "200": {
                    "description": "Project entry deleted successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Project entry deleted successfully." },
                                    "data": { "type": "object", "example": {} }, // Empty object as no data is returned on deletion
                                    "totalCount": { "type": "number", "example": 0 } // Reflects no items returned
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
                                    "data": { "type": "null", "example": null },// Consistent with other error responses
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "404": {
                    "description": "User, resume, or project not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "User, resume, or project not found." },
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
                                    "msg": { "type": "string", "example": "Internal server error." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
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
    AwardsEndpoints
};


