const educationEndpoint = {
    tags: [
        {
            name: 'Education',
            description: 'The Education managing API',
        },
    ],

    '/users/resume/education': {
        post: {
            summary: 'Add a new education experience entry',
            tags: ['Education'],
            description: 'Allows a user to add a new education experience to their resume.',
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
                                school: {
                                    type: 'string',
                                    description: 'Name of the school or institution.',
                                    example: 'Harvard University',
                                },
                                degree: {
                                    type: 'string',
                                    description: 'Degree or certification obtained.',
                                    example: 'Bachelor of Science',
                                },
                                fieldOfStudy: {
                                    type: 'string',
                                    description: 'Field of study or major.',
                                    example: 'Computer Science',
                                },
                                startDate: {
                                    type: 'string',
                                    format: 'date',
                                    description: 'The starting date of the education program.',
                                    example: '2018-09-01',
                                },
                                endDate: {
                                    type: 'string',
                                    format: 'date',
                                    description: 'The ending date of the education program. Can be null if it is the current program.',
                                    example: '2022-05-31',
                                },
                                graduated: {
                                    type: 'boolean',
                                    description: 'Indicates if this is the user\'s current education program.',
                                    default: false,
                                },
                                description: {
                                    type: 'string',
                                    description: 'A brief description of the program, achievements, or responsibilities.',
                                    example: 'Graduated with honors.',
                                }
                            },
                            required: ['school', 'degree', 'fieldOfStudy', 'startDate'],
                        },
                    },
                },
            },
            responses: {
                "201": {
                    "description": "Education experience added successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Education experience added successfully" },
                                    "data": {
                                        "type": "array",
                                        "items": {
                                            "$ref": "#/components/schemas/EducationExperience"
                                        }
                                    },
                                    "totalCount": { "type": "number", "example": 1 }
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
                                    "data": { "type": "null", "example": null },
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
                                    "result": { "type": "string", "example": "error" },
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
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Internal server error." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                }
            },
        },
        get: {
            summary: 'Retrieve education experience entries',
            tags: ['Education'],
            description: 'Allows a user to retrieve their education experience from their resume.',
            security: [
                {
                    bearerAuth: [],
                },
            ],
            responses: {
                "200": {
                    "description": "Education experience retrieved successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Education experience retrieved successfully." },
                                    "data": {
                                        "type": "array",
                                        "items": {
                                            "$ref": "#/components/schemas/EducationExperience"
                                        },
                                        "description": "An array of education experience entries."
                                    },
                                    "totalCount": { "type": "number", "example": "Provide the actual count of retrieved entries" }
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
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "404": {
                    "description": "Education experience not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
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
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Internal server error." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                }
            },
        },
    },
    '/users/resume/education/{id}': {
        put: {
            summary: 'Update a specific education experience entry',
            tags: ['Education'],
            description: 'Allows a user to update a specific education experience entry in their resume.',
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'UUID of the education experience entry to update',
                    schema: {
                        type: 'string',
                    },
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/EducationExperience',
                        },
                    },
                },
            },
            responses: {
                "200": {
                    "description": "Education experience entry updated successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Education experience entry updated successfully." },
                                    "data": {
                                        "$ref": "#/components/schemas/EducationExperience"
                                    },
                                    "totalCount": { "type": "number", "example": 1 }
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
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "404": {
                    "description": "User, Resume, or Education experience entry not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "User, Resume, or Education experience entry not found." },
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
            },
        },
        delete: {
            summary: 'Delete a specific education experience entry',
            tags: ['Education'],
            description: 'Allows a user to delete a specific education experience entry from their resume.',
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'UUID of the education experience entry to delete',
                    schema: {
                        type: 'string',
                    },
                },
            ],
            responses: {
                "200": {
                    "description": "Education experience entry deleted successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Education experience entry deleted successfully." },
                                    "data": { "type": "null", "example": null }, // Assuming deletion does not return specific data
                                    "totalCount": { "type": "number", "example": 0 } // Assuming deletion leads to no countable entities
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
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "404": {
                    "description": "User, Resume, or Education experience entry not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "User, Resume, or Education experience entry not found." },
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
            },
        },
    }
}


module.exports = {
    educationEndpoint
};


