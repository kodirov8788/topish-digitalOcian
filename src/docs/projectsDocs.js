// src/docs/projectsDocs.js
const projectEndpoint = {
    tags: [
        {
            name: 'Projects',
            description: 'The Education managing API',
        },
    ],

    '/users/resume/project': {
        post: {
            summary: 'Create a new project entry',
            tags: ['Projects'],
            description: 'Adds a new project entry to the user\'s resume. Requires user authentication.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                title: {
                                    type: 'string',
                                    description: 'Title of the project',
                                    example: 'AI Research Project',
                                },
                                description: {
                                    type: 'string',
                                    description: 'Detailed description of the project',
                                    example: 'A project focusing on developing new AI algorithms.',
                                },
                                role: {
                                    type: 'string',
                                    description: 'Role of the user in the project',
                                    example: 'Lead Developer',
                                },
                                technologies: {
                                    type: 'array',
                                    items: {
                                        type: 'string'
                                    },
                                    description: 'List of technologies used in the project',
                                    example: ['Python', 'TensorFlow'],
                                },
                                startDate: {
                                    type: 'string',
                                    format: 'date',
                                    description: 'Start date of the project',
                                    example: '2020-01-15',
                                },
                                endDate: {
                                    type: 'string',
                                    format: 'date',
                                    description: 'End date of the project (can be null if ongoing)',
                                    example: '2021-04-20',
                                },
                                current: {
                                    type: 'boolean',
                                    description: 'Indicates if the project is currently ongoing',
                                    example: false,
                                },
                                link: {
                                    type: 'string',
                                    format: 'url',
                                    description: 'Link to the project or its resources',
                                    example: 'https://www.projectlink.com',
                                },

                            },
                        },
                    },
                },
            },
            responses: {
                "201": {
                    "description": "New project entry created successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": {
                                        "type": "string",
                                        "example": "success"
                                    },
                                    "msg": {
                                        "type": "string",
                                        "example": "New project entry created successfully."
                                    },
                                    "data": {
                                        "properties": {
                                            "title": { "type": "string" },
                                            "description": { "type": "string" },
                                            "role": { "type": "string" },
                                            "technologies": { "type": "array", "items": { "type": "string" } },
                                            "startDate": { "type": "string", "format": "date" },
                                            "endDate": { "type": "string", "format": "date" },
                                            "current": { "type": "boolean" },
                                            "link": { "type": "string", "format": "url" },
                                            "id": { "type": "string", "format": "uuid" }
                                        },
                                        "example": [
                                            {
                                                "title": "Job2 and projects2",
                                                "description": "Job and projects Job and projects Job and projects Job and projects ",
                                                "role": "Senior",
                                                "technologies": ["js", "React"],
                                                "startDate": "10.01.2023",
                                                "endDate": "20.05.2023",
                                                "current": false,
                                                "link": "https://work.com",
                                                "id": "39a6fbd2-f41a-4487-adc0-b66ec2dc665c"
                                            },
                                            {
                                                "title": "Job2 and projects2",
                                                "description": "Job and projects Job and projects Job and projects Job and projects ",
                                                "role": "Senior",
                                                "technologies": ["js", "React"],
                                                "startDate": "10.01.2023",
                                                "endDate": "20.05.2023",
                                                "current": false,
                                                "link": "https://work.com",
                                                "id": "0f3c2c50-e453-4f87-bdbb-0aca79310209"
                                            }
                                        ]
                                    },
                                    "totalCount": {
                                        "type": "number",
                                        "example": 2
                                    }
                                }
                            }
                        }
                    }
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
                                    "data": { "type": "object", "example": {} },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                },
                // Adjust the structure for 401, 404, 500 responses accordingly
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
                    "description": "User or resume not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "User or resume not found." },
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
            },
        },
        get: {
            summary: 'Retrieve project entries for a user',
            tags: ['Projects'],
            description: 'Fetches the project entries from the user\'s resume. Requires user authentication.',
            responses: {
                "200": {
                    "description": "Project entries retrieved successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": {
                                        "type": "string",
                                        "example": "success"
                                    },
                                    "msg": {
                                        "type": "string",
                                        "example": "Project entries retrieved successfully."
                                    },
                                    "data": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "title": {
                                                    "type": "string"
                                                },
                                                "description": {
                                                    "type": "string"
                                                },
                                                "role": {
                                                    "type": "string"
                                                },
                                                "technologies": {
                                                    "type": "array",
                                                    "items": {
                                                        "type": "string"
                                                    }
                                                },
                                                "startDate": {
                                                    "type": "string",
                                                    "format": "date"
                                                },
                                                "endDate": {
                                                    "type": "string",
                                                    "format": "date"
                                                },
                                                "current": {
                                                    "type": "boolean"
                                                },
                                                "link": {
                                                    "type": "string",
                                                    "format": "url"
                                                },
                                                "id": {
                                                    "type": "string",
                                                    "format": "uuid"
                                                }
                                            }
                                        }
                                    },
                                    "totalCount": {
                                        "type": "number",
                                        "example": 2
                                    }
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
                                    "result": {
                                        "type": "string",
                                        "example": "error"
                                    },
                                    "msg": {
                                        "type": "string",
                                        "example": "Unauthorized. User is not authenticated."
                                    },
                                    "data": {
                                        "type": "object",
                                        "example": {}
                                    },
                                    "totalCount": {
                                        "type": "number",
                                        "example": 0
                                    }
                                }
                            }
                        }
                    }
                },
                "404": {
                    "description": "User or resume not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": {
                                        "type": "string",
                                        "example": "error"
                                    },
                                    "msg": {
                                        "type": "string",
                                        "example": "User or resume not found."
                                    },
                                    "data": {
                                        "type": "object",
                                        "example": {}
                                    },
                                    "totalCount": {
                                        "type": "number",
                                        "example": 0
                                    }
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
                                    "result": {
                                        "type": "string",
                                        "example": "error"
                                    },
                                    "msg": {
                                        "type": "string",
                                        "example": "Internal server error."
                                    },
                                    "data": {
                                        "type": "object",
                                        "example": {}
                                    },
                                    "totalCount": {
                                        "type": "number",
                                        "example": 0
                                    }
                                }
                            }
                        }
                    }
                }
            },
        },
    },
    '/users/resume/project/{id}': {
        put: {
            summary: 'Update a specific project entry',
            tags: ['Projects'],
            description: 'Updates a specific project entry in the user\'s resume by ID. Requires user authentication.',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'The ID of the project to be updated',
                    schema: {
                        type: 'string',
                        format: 'uuid',
                    },
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
                                    description: 'Title of the project',
                                    example: 'AI Research Project',
                                },
                                description: {
                                    type: 'string',
                                    description: 'Detailed description of the project',
                                    example: 'A project focusing on developing new AI algorithms.',
                                },
                                role: {
                                    type: 'string',
                                    description: 'Role of the user in the project',
                                    example: 'Lead Developer',
                                },
                                technologies: {
                                    type: 'array',
                                    items: {
                                        type: 'string'
                                    },
                                    description: 'List of technologies used in the project',
                                    example: ['Python', 'TensorFlow'],
                                },
                                startDate: {
                                    type: 'string',
                                    format: 'date',
                                    description: 'Start date of the project',
                                    example: '2020-01-15',
                                },
                                endDate: {
                                    type: 'string',
                                    format: 'date',
                                    description: 'End date of the project (can be null if ongoing)',
                                    example: '2021-04-20',
                                },
                                current: {
                                    type: 'boolean',
                                    description: 'Indicates if the project is currently ongoing',
                                    example: false,
                                },
                                link: {
                                    type: 'string',
                                    format: 'url',
                                    description: 'Link to the project or its resources',
                                    example: 'https://www.projectlink.com',
                                },

                            },
                        },
                    },
                },
            },
            responses: {
                "200": {
                    "description": "Project entry updated successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Project entry updated successfully." },
                                    "data": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "title": { "type": "string" },
                                                "description": { "type": "string" },
                                                "role": { "type": "string" },
                                                "technologies": { "type": "array", "items": { "type": "string" } },
                                                "startDate": { "type": "string", "format": "date" },
                                                "endDate": { "type": "string", "format": "date" },
                                                "current": { "type": "boolean" },
                                                "link": { "type": "string", "format": "url" },
                                                "id": { "type": "string", "format": "uuid" }
                                            },
                                            "example":
                                            {
                                                "title": "Job2 and projects2",
                                                "description": "Job and projects Job and projects Job and projects Job and projects ",
                                                "role": "Senior",
                                                "technologies": ["js", "React"],
                                                "startDate": "10.01.2023",
                                                "endDate": "20.05.2023",
                                                "current": false,
                                                "link": "https://work.com",
                                                "id": "39a6fbd2-f41a-4487-adc0-b66ec2dc665c"
                                            },


                                        }
                                    },
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
                    "description": "User, resume, or project not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "User, resume, or project not found." },
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
            },
        },
        delete: {
            summary: 'Delete a specific project entry',
            tags: ['Projects'],
            description: 'Deletes a specific project entry in the user\'s resume by UUID. Requires user authentication.',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'The UUID of the project to be deleted',
                    schema: {
                        type: 'string',
                        format: 'uuid',
                    },
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
                                    "data": { "type": "object", "example": {} },
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
                                properties: {
                                    error: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                '404': {
                    description: 'User, resume, or project not found.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    error: { type: 'string' },
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
                                    error: { type: 'string' },
                                },
                            },
                        },
                    },
                },
            },
        },
    }
}


module.exports = {
    projectEndpoint
};

