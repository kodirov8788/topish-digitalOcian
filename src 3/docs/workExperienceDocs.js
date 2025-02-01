// src/docs/workExperienceDocs.js
const workExperienceEndpoint = {
    tags: [
        {
            name: 'WorkExperience',
            description: 'The WorkExperience managing API',
        },
    ],

    '/users/resume/experience': {
        post: {
            summary: 'Create new work experience entries',
            tags: ['WorkExperience'],
            description: 'Adds a new work experience entry to the user\'s resume. If the resume does not exist, it creates a new one. Requires user authentication.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                jobTitle: { type: 'string', description: 'Title of the job.' },
                                company: { type: 'string', description: 'Name of the company.' },
                                startDate: { type: 'string', format: 'date', description: 'Start date of the job.' },
                                endDate: { type: 'string', format: 'date', description: 'End date of the job. Can be empty if it is the current job.' },
                                current: { type: 'boolean', description: 'Indicates if this is the user\'s current job.' },
                                description: { type: 'string', description: 'Description of the job.' },
                                employmentType: {
                                    type: 'string',
                                    enum: ['Full-time', 'Part-time', 'Self-employed', 'Freelance', 'Contract', 'Internship', 'Apprenticeship', 'Seasonal'],
                                    description: 'Type of employment.'
                                },
                                location: { type: 'string', description: 'Location of the job.' }
                            }
                        }
                    }
                }
            },
            responses: {
                "201": {
                    "description": "Work experience entry added successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Work experience entry added successfully." },
                                    "data": { "$ref": "#/components/schemas/WorkExperience" },
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
            },
        },
        get: {
            summary: 'Retrieve work experience entries',
            tags: ['WorkExperience'],
            description: 'Retrieves all work experience entries from the user\'s resume. Requires user authentication.',
            responses: {
                "200": {
                    "description": "Work experience entries retrieved successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Work experience entries retrieved successfully." },
                                    "data": {
                                        "type": "array",
                                        "items": { "$ref": "#/components/schemas/WorkExperience" }
                                    },
                                    "totalCount": { "type": "number", "example": "Provide actual count" }
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
            }

        },
    },
    '/users/resume/experience/{id}': {
        put: {
            summary: 'Update a specific work experience entry',
            tags: ['WorkExperience'],
            description: 'Updates a specific work experience entry identified by UUID in the user\'s resume. Requires user authentication.',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                    },
                    description: 'ID of the work experience entry to update',
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/WorkExperience',
                        },
                    },
                },
                description: 'Data for updating the work experience entry',
            },
            responses: {
                "200": {
                    "description": "Work experience entry updated successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Work experience entry updated successfully." },
                                    "data": { "$ref": "#/components/schemas/WorkExperience" },
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
                    "description": "User, resume, or work experience entry not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "User, resume, or work experience entry not found." },
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
        delete: {
            summary: 'Delete a specific work experience entry',
            tags: ['WorkExperience'],
            description: 'Deletes a specific work experience entry identified by UUID from the user\'s resume. Requires user authentication.',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                    },
                    description: 'UUID of the work experience entry to delete',
                },
            ],
            responses: {
                "200": {
                    "description": "Work experience entry deleted successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Work experience entry deleted successfully." },
                                    "data": { "type": "object", "example": {} }, // No data to return upon deletion
                                    "totalCount": { "type": "number", "example": 0 } // No entries left to count after deletion
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
                    "description": "User, resume, or work experience entry not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "User, resume, or work experience entry not found." },
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
    }
}

module.exports = {
    workExperienceEndpoint
};


