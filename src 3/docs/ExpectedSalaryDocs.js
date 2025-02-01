// src/docs/ExpectedSalaryDocs.js
const ExpectedSalaryEndpoints = {
    tags: [
        {
            name: 'ExpectedSalary',
            description: 'Endpoints for managing the expectedSalary field in the user’s resume.',
        },
    ],
    '/users/resume/expected-salary': {
        post: {
            summary: 'Set an expected salary in the user’s resume',
            tags: ['ExpectedSalary'],
            description:
                'Allows an authenticated user to create or set the expected salary in their resume. In many cases, you might just use PUT, but POST is provided for completeness.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                expectedSalary: {
                                    type: 'string',
                                    description: 'The desired or expected salary.',
                                    example: '1500 USD',
                                },
                            },
                            required: ['expectedSalary'],
                        },
                    },
                },
            },
            responses: {
                '201': {
                    description: 'Expected salary set successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Expected salary set' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            expectedSalary: { type: 'string', example: '1500 USD' },
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
                                    msg: {
                                        type: 'string',
                                        example: '"expectedSalary" is required',
                                    },
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
            summary: 'Retrieve the expected salary from the user’s resume',
            tags: ['ExpectedSalary'],
            description:
                'Allows an authenticated user to retrieve the current expected salary from their resume.',
            responses: {
                '200': {
                    description: 'Expected salary retrieved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: {
                                        type: 'string',
                                        example: 'Expected salary retrieved',
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            expectedSalary: {
                                                type: 'string',
                                                example: '1500 USD',
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
        put: {
            summary: 'Update the expected salary in the user’s resume',
            tags: ['ExpectedSalary'],
            description:
                'Allows an authenticated user to update the existing expected salary in their resume.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                expectedSalary: {
                                    type: 'string',
                                    description: 'The new or updated expected salary value.',
                                    example: '2000 USD',
                                },
                            },
                            required: ['expectedSalary'],
                        },
                    },
                },
            },
            responses: {
                '200': {
                    description: 'Expected salary updated successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: {
                                        type: 'string',
                                        example: 'Expected salary updated',
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            expectedSalary: { type: 'string', example: '2000 USD' },
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
                                    msg: {
                                        type: 'string',
                                        example: '"expectedSalary" is required',
                                    },
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
        delete: {
            summary: 'Delete the expected salary from the user’s resume',
            tags: ['ExpectedSalary'],
            description:
                'Allows an authenticated user to remove or reset the expected salary field in their resume (e.g., sets it to an empty string).',
            responses: {
                '200': {
                    description: 'Expected salary removed successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: {
                                        type: 'string',
                                        example: 'Expected salary removed',
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            expectedSalary: {
                                                type: 'string',
                                                example: '',
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

module.exports = { ExpectedSalaryEndpoints };
