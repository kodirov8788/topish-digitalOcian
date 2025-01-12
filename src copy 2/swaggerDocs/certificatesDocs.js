const certificatesEndpoint = {
    tags: [
        {
            name: 'Certificates',
            description: 'The Certificates managing API',
        },
    ],

    '/users/resume/certificates/': {
        post: {
            summary: 'Add a new certificate entry',
            tags: ['Certificates'],
            description: 'Allows a user to add a new certificate to their resume.',
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
                                title: {
                                    type: 'string',
                                    description: 'Title of the certificate.',
                                    example: 'Certified Cloud Practitioner',
                                },
                                organization: {
                                    type: 'string',
                                    description: 'Organization that issued the certificate.',
                                    example: 'Amazon Web Services',
                                },
                                dateOfIssue: {
                                    type: 'string',
                                    format: 'date',
                                    description: 'The date the certificate was issued.',
                                    example: '2020-08-01',
                                },
                                expirationDate: {
                                    type: 'string',
                                    format: 'date',
                                    description: 'The date the certificate expires. Can be null if it does not expire.',
                                    example: '2023-08-01',
                                },
                                notExpire: {
                                    type: 'boolean',
                                    description: 'Indicates if the certificate does not expire.',
                                    default: false,
                                },
                                credentialId: {
                                    type: 'string',
                                    description: 'The credential ID of the certificate.',
                                    example: 'AWS-01234567',
                                },
                                credentialUrl: {
                                    type: 'string',
                                    description: 'URL to verify the certificate.',
                                    example: 'https://www.yourcertificate.com',
                                },
                            },
                            required: ['title', 'organization', 'dateOfIssue', 'notExpire', 'credentialId'],
                        },
                    },
                },
            },
            responses: {
                "201": {
                    "description": "Certificate added successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Certificate added successfully" },
                                    "data": {
                                        "type": "array",
                                        "items": {
                                            "$ref": "#/components/schemas/Certificate"
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
            }
        },
        get: {
            summary: 'Retrieve certificate entries',
            tags: ['Certificates'],
            description: 'Allows a user to retrieve their certificates from their resume.',
            security: [
                {
                    bearerAuth: [],
                },
            ],
            responses: {
                "200": {
                    "description": "Certificates retrieved successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Certificates retrieved successfully." },
                                    "data": {
                                        "type": "array",
                                        "items": {
                                            "$ref": "#/components/schemas/Certificate"
                                        },
                                        "description": "An array of certificate entries."
                                    },
                                    "totalCount": { "type": "number", "example": "Specify the actual count or remove if not applicable" }
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
    },
    '/users/resume/certificates/{id}': {
        put: {
            summary: 'Update a specific certificate entry',
            tags: ['Certificates'],
            description: 'Allows a user to update a specific certificate entry in their resume.',
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
                    description: 'UUID of the certificate to update',
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
                            $ref: '#/components/schemas/Certificate',
                        },
                    },
                },
            },
            responses: {
                "200": {
                    "description": "Certificate updated successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Certificate updated successfully." },
                                    "data": {
                                        "$ref": "#/components/schemas/Certificate"
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
        delete: {
            summary: 'Delete a specific certificate entry',
            tags: ['Certificates'],
            description: 'Allows a user to delete a specific certificate entry from their resume.',
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
                    description: 'UUID of the certificate to delete',
                    schema: {
                        type: 'string',
                        format: 'uuid',
                    },
                },
            ],
            responses: {
                "200": {
                    "description": "Certificate deleted successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Certificate deleted successfully." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": {
                                        "type": "number",
                                        "description": "Total count is not applicable for deletion responses and is set to 0.",
                                        "example": 0
                                    }
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
                    "description": "Certificate not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Certificate not found." },
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

module.exports = { certificatesEndpoint }





