const SearchJobEndpoints = {
    tags: [
        {
            name: 'SearchJob',
            description: 'Endpoints for managing the searchJob field in the user’s resume.',
        },
    ],
    '/users/resume/search-job': {
        post: {
            summary: 'Set the searchJob field in the user’s resume',
            tags: ['SearchJob'],
            description:
                'Allows an authenticated user to create or set the searchJob field in their resume. Often you might just use PUT, but a POST endpoint is provided for consistency.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                searchJob: {
                                    type: 'boolean',
                                    description: 'Whether the user is currently searching for a job.',
                                    example: true,
                                },
                            },
                            required: ['searchJob'],
                        },
                    },
                },
            },
            responses: {
                '201': {
                    description: 'searchJob field set successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'searchJob field set' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            searchJob: { type: 'boolean', example: true },
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
                                    msg: { type: 'string', example: '"searchJob" is required' },
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
                                    msg: {
                                        type: 'string',
                                        example: 'Unauthorized. User is not authenticated.',
                                    },
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
            summary: 'Retrieve the searchJob field from the user’s resume',
            tags: ['SearchJob'],
            description:
                'Allows an authenticated user to retrieve the current searchJob status from their resume (true or false).',
            responses: {
                '200': {
                    description: 'searchJob field retrieved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'searchJob field retrieved' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            searchJob: { type: 'boolean', example: true },
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
                                    msg: {
                                        type: 'string',
                                        example: 'Unauthorized. User is not authenticated.',
                                    },
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
        put: {
            summary: 'Update the searchJob field in the user’s resume',
            tags: ['SearchJob'],
            description:
                'Allows an authenticated user to change the searchJob field to true or false in their resume.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                searchJob: {
                                    type: 'boolean',
                                    description: 'New searchJob value (true or false).',
                                    example: false,
                                },
                            },
                            required: ['searchJob'],
                        },
                    },
                },
            },
            responses: {
                '200': {
                    description: 'searchJob field updated successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'searchJob field updated' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            searchJob: { type: 'boolean', example: false },
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
                                    msg: { type: 'string', example: '"searchJob" is required' },
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
                                    msg: {
                                        type: 'string',
                                        example: 'Unauthorized. User is not authenticated.',
                                    },
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
        delete: {
            summary: 'Delete or reset the searchJob field from the user’s resume',
            tags: ['SearchJob'],
            description:
                'Allows an authenticated user to remove or reset the searchJob field. For example, you might reset it to the default (true) or remove it altogether.',
            responses: {
                '200': {
                    description: 'searchJob field reset or removed successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: {
                                        type: 'string',
                                        example: 'searchJob field reset',
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            searchJob: { type: 'boolean', example: true },
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
                                    msg: {
                                        type: 'string',
                                        example: 'Unauthorized. User is not authenticated.',
                                    },
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
                                    msg: {
                                        type: 'string',
                                        example: 'Internal server error.',
                                    },
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

module.exports = { SearchJobEndpoints };
