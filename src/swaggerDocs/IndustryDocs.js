const IndustryEndpoints = {
    tags: [
        {
            name: 'Industry',
            description: 'Endpoints for managing the user’s industries in their resume.',
        },
    ],
    '/users/resume/industry': {
        post: {
            summary: 'Add a new industry to the user’s resume',
            tags: ['Industry'],
            description: 'Allows an authenticated user to add a new industry entry to their resume.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                    description: 'Name of the industry.',
                                    example: 'Marketing',
                                },
                                description: {
                                    type: 'string',
                                    description: 'Optional description or notes about this industry.',
                                    example: 'Focuses on market research, advertising, and branding strategies.',
                                },
                            },
                            required: ['name'],
                        },
                    },
                },
            },
            responses: {
                '201': {
                    description: 'Industry added successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Industry added successfully.' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                name: { type: 'string', example: 'Marketing' },
                                                description: {
                                                    type: 'string',
                                                    example: 'Focuses on market research, advertising, and branding strategies.',
                                                },
                                                id: { type: 'string', example: '2b7b52ba-2d54-449d-b60f-bb75c4f7f200' },
                                            },
                                        },
                                    },
                                    totalCount: { type: 'number', example: 1 },
                                },
                            },
                        },
                    },
                },
                '401': {
                    description: 'Unauthorized. User is not authenticated.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized. User is not authenticated.' },
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
            },
        },
        get: {
            summary: 'Retrieve industries from the user’s resume',
            tags: ['Industry'],
            description: 'Allows an authenticated user to retrieve all industry entries from their resume.',
            responses: {
                '200': {
                    description: 'Industries retrieved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Industries retrieved successfully.' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                name: { type: 'string', example: 'Marketing' },
                                                description: {
                                                    type: 'string',
                                                    example: 'Focuses on market research, advertising, and branding strategies.',
                                                },
                                                id: { type: 'string', example: '2b7b52ba-2d54-449d-b60f-bb75c4f7f200' },
                                            },
                                        },
                                    },
                                    totalCount: { type: 'number', example: 1 },
                                },
                            },
                        },
                    },
                },
                '401': {
                    description: 'Unauthorized. User is not authenticated.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized. User is not authenticated.' },
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
            },
        },
    },
    '/users/resume/industry/{id}': {
        put: {
            summary: 'Update a specific industry in the user’s resume',
            tags: ['Industry'],
            description: 'Allows an authenticated user to update a specific industry entry in their resume.',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' },
                    description: 'UUID of the industry to update',
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                    description: 'Updated name of the industry.',
                                    example: 'Finance',
                                },
                                description: {
                                    type: 'string',
                                    description: 'Updated description or notes about this industry.',
                                    example: 'Focuses on banking, investments, and capital management.',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                '200': {
                    description: 'Industry updated successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Industry updated successfully.' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                name: { type: 'string', example: 'Finance' },
                                                description: {
                                                    type: 'string',
                                                    example: 'Focuses on banking, investments, and capital management.',
                                                },
                                                id: { type: 'string', example: '2b7b52ba-2d54-449d-b60f-bb75c4f7f200' },
                                            },
                                        },
                                    },
                                    totalCount: { type: 'number', example: 1 },
                                },
                            },
                        },
                    },
                },
                '400': {
                    description: 'Bad Request. Validation error.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: '"name" is not allowed to be empty' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
                '401': {
                    description: 'Unauthorized. User is not authenticated.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized. User is not authenticated.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
                '404': {
                    description: 'User or resume or industry not found.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'User or resume or industry not found.' },
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
            },
        },
        delete: {
            summary: 'Delete a specific industry from the user’s resume',
            tags: ['Industry'],
            description: 'Allows an authenticated user to delete a specific industry entry from their resume.',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' },
                    description: 'UUID of the industry to delete',
                },
            ],
            responses: {
                '200': {
                    description: 'Industry entry deleted successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Industry entry deleted successfully.' },
                                    data: { type: 'object', example: {} },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
                '401': {
                    description: 'Unauthorized. User is not authenticated.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized. User is not authenticated.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
                '404': {
                    description: 'User, resume, or industry not found.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'User, resume, or industry not found.' },
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
            },
        },
    },
};

module.exports = { IndustryEndpoints };
