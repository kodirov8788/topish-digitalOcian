
const CompanyEndpoint = {
    tags: [
        {
            name: 'Company',
            description: 'The Company managing API',
        },
    ],

    '/companies/': {

        post: {
            summary: 'Create a new company',
            tags: ['Company'],
            description: 'Allows an authorized user with sufficient coins to create a new company entry.',
            security: [
                {
                    bearerAuth: [],
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            properties: {
                                company_name: {
                                    type: 'string',
                                    description: 'Name of the company.',
                                    example: 'Innovative Tech Solutions',
                                },
                                company_location: {
                                    type: 'string',
                                    description: 'Geographical location of the company.',
                                    example: 'Silicon Valley, CA',
                                },
                                company_size: {
                                    type: 'string',
                                    description: 'Size of the company.',
                                    example: '100-500',
                                },
                                company_type: {
                                    type: 'string',
                                    description: 'Type of the company.',
                                    example: 'Technology',
                                },
                                company_description: {
                                    type: 'string',
                                    description: 'Description of the company.',
                                    example: 'We are a tech company that specializes in creating innovative solutions.',
                                },
                                company_logo: {
                                    type: 'string',
                                    format: 'binary',
                                    description: 'Company logo image.',
                                },

                            },
                            required: ['company_name', 'company_location'], // Specify all fields that are required
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Company created successfully.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "success" },
                                    msg: { type: "string", example: "Company created successfully" },
                                    data: {
                                        type: "object",
                                        properties: {
                                            company_name: { type: "string", example: "Innovative Tech Solutions" },
                                            company_location: { type: "string", example: "Silicon Valley, CA" },
                                            company_size: { type: "string", example: "100-500" },
                                            company_type: { type: "string", example: "Technology" },
                                            company_description: { type: "string", example: "We are a tech company that specializes in creating innovative solutions." },
                                            company_logo: { type: "string", example: "https://example.com/logo.jpg" },

                                        },
                                    },
                                    totalCount: { type: "number", example: 1 },
                                },
                            },
                        },
                    },
                },
                "400": {
                    description: "Bad Request. Validation error or not enough coins.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "error" },
                                    msg: { type: "string", example: "Not enough coins." },
                                    data: { type: "null", example: null },
                                    totalCount: { type: "number", example: 0 },
                                },
                            },
                        },
                    },
                },
                "401": {
                    description: "Unauthorized. User is not logged in or not allowed.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "error" },
                                    msg: { type: "string", example: "Unauthorized. User is not logged in or not allowed." },
                                    data: { type: "null", example: null },
                                    totalCount: { type: "number", example: 0 },
                                },
                            },
                        },
                    },
                },
                "500": {
                    description: "Internal server error.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "error" },
                                    msg: { type: "string", example: "An error occurred while creating the company." },
                                    data: { type: "null", example: null },
                                    totalCount: { type: "number", example: 0 },
                                },
                            },
                        },
                    },
                },
            },
        },
        get: {
            summary: 'Retrieve all companies',
            tags: ['Company'],
            description: 'Fetches a list of companies, optionally filtered by name, location, and recommendation status, with pagination and sorting capabilities.',
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: 'companyName',
                    in: 'query',
                    required: false,
                    description: 'Filter companies by name using a regex pattern.',
                    schema: {
                        type: 'string'
                    }
                },
                {
                    name: 'location',
                    in: 'query',
                    required: false,
                    description: 'Filter companies by location using a regex pattern.',
                    schema: {
                        type: 'string'
                    }
                },
                {
                    name: 'recommended',
                    in: 'query',
                    required: false,
                    description: 'Filter companies by their recommendation status.',
                    schema: {
                        type: 'boolean'
                    }
                },
                {
                    name: 'page',
                    in: 'query',
                    required: false,
                    description: 'Specify the page of results to return.',
                    schema: {
                        type: 'integer',
                        default: 1
                    }
                },
                {
                    name: 'limit',
                    in: 'query',
                    required: false,
                    description: 'Limit the number of results per page.',
                    schema: {
                        type: 'integer',
                        default: 10
                    }
                },
                {
                    name: 'sort',
                    in: 'query',
                    required: false,
                    description: 'Sort the results by specified fields separated by commas (e.g., "-createdDate" for descending).',
                    schema: {
                        type: 'string'
                    }
                },
            ],
            responses: {
                '200': {
                    description: 'List of companies retrieved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Company retrieved successfully' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/Company'
                                        },
                                        example: [
                                            {
                                                name: 'Innovative Tech Solutions',
                                                location: 'Silicon Valley, CA'
                                            }
                                        ]
                                    },
                                    totalCount: { type: 'number', example: 10 },
                                    pagination: {
                                        type: 'object',
                                        properties: {
                                            currentPage: { type: 'integer', example: 1 },
                                            totalPages: { type: 'integer', example: 5 },
                                            limit: { type: 'integer', example: 10 },
                                            totalDocuments: { type: 'integer', example: 50 }
                                        }
                                    }
                                },
                            },
                        },
                    },
                },
                '400': {
                    description: 'Bad Request - Title cannot be empty.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Title cannot be empty' },
                                    data: { type: 'array', items: {}, example: [] },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
                '401': {
                    description: 'Unauthorized - User is not logged in.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
                '404': {
                    description: 'Not Found - No companies found.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'No companies found' },
                                    data: { type: 'array', items: {}, example: [] },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
                '500': {
                    description: 'Internal Server Error - Error in processing the request.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Internal Server Error' },
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
    '/companies/{companyId}': {
        delete: {
            summary: 'Delete a company',
            tags: ['Company'],
            description: 'Allows an authorized user with specific roles (Admin, Employer) to delete a company.',
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: 'companyId',
                    in: 'path',
                    required: true,
                    description: 'The ID of the company to delete.',
                    schema: {
                        type: 'string',
                    },
                }
            ],
            responses: {
                '200': {
                    description: 'Company deleted successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Company deleted successfully' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 1 },
                                },
                            },
                        },
                    },
                },
                '401': {
                    description: 'Unauthorized - User not logged in or not allowed.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized or You are not allowed!' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
                '404': {
                    description: 'Not Found - No such company exists or user not allowed to delete.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Company with id: {companyId} not found' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
                '500': {
                    description: 'Internal Server Error - Error in processing the request.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Internal Server Error' },
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
            summary: 'Retrieve a single company by ID',
            tags: ['Company'],
            description: 'Fetches details for a single company based on its ID, available only to authenticated users.',
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: 'companyId',
                    in: 'path',
                    required: true,
                    description: 'The unique identifier of the company to retrieve.',
                    schema: {
                        type: 'string'
                    }
                }
            ],
            responses: {
                '200': {
                    description: 'Company retrieved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Company retrieved successfully' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            // Example schema properties of a Company object
                                            id: { type: 'string', example: '12345' },
                                            name: { type: 'string', example: 'Innovative Tech Solutions' },
                                            location: { type: 'string', example: 'Silicon Valley, CA' },
                                            industry: { type: 'string', example: 'Technology' },
                                            revenue: { type: 'number', example: 5000000 },
                                            // Add more properties as needed
                                        }
                                    },
                                    totalCount: { type: 'number', example: 1 },
                                },
                            },
                        },
                    },
                },
                '401': {
                    description: 'Unauthorized - User not logged in.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
                '404': {
                    description: 'Not Found - No company found with the provided ID.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Company not found with ID: {companyId}' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
                '500': {
                    description: 'Internal Server Error - Error in processing the request.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Internal Server Error' },
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
            summary: 'Update a company',
            tags: ['Company'],
            description: 'Allows an authorized user with specific roles (Admin, Employer) to update details of a company.',
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: 'companyId',
                    in: 'path',
                    required: true,
                    description: 'The unique identifier of the company to update.',
                    schema: {
                        type: 'string',
                    },
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            properties: {
                                company_name: {
                                    type: 'string',
                                    description: 'Updated name of the company.',
                                    example: 'Innovative Tech Solutions',
                                },
                                company_description: {
                                    type: 'string',
                                    description: 'Updated description of the company.',
                                    example: 'We create innovative technology solutions.',
                                },
                                company_logo: {
                                    type: 'string',
                                    format: 'binary',
                                    description: 'Updated logo file for the company.',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                '200': {
                    description: 'Company updated successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Company updated successfully' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            company_name: { type: 'string', example: 'Innovative Tech Solutions' },
                                            company_description: { type: 'string', example: 'We create innovative technology solutions.' },
                                            company_logo: { type: 'string', example: 'https://example.com/new_logo.jpg' },
                                        },
                                    },
                                    totalCount: { type: 'number', example: 1 },
                                },
                            },
                        },
                    },
                },
                '401': {
                    description: 'Unauthorized - User not logged in or not allowed.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized or You are not allowed!' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
                '404': {
                    description: 'Not Found - No company found with the provided ID, or user not allowed to update.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Company not found with ID: {companyId}' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
                '500': {
                    description: 'Internal Server Error - Error in processing the request.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Internal Server Error' },
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
    '/companies/{companyId}/selectOwner': {
        post: {
            summary: 'Change the owner of a company',
            tags: ['Company'],
            description: 'Allows an authorized user to change the ownership of an existing company.',
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: 'companyId',
                    in: 'path',
                    required: true,
                    description: 'The ID of the company to update.',
                    schema: {
                        type: 'string',
                    },
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                employerId: {
                                    type: 'string',
                                    description: 'The ID of the new company owner.',
                                    example: '12345',
                                },
                            },
                            required: ['employerId'],
                        },
                    },
                },
            },
            responses: {
                '200': {
                    description: 'Company owner changed successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Company owner changed successfully' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            company_owner: { type: 'string', example: '12345' },
                                            company_name: { type: 'string', example: 'Innovative Tech Solutions' },
                                        },
                                    },
                                    totalCount: { type: 'number', example: 1 },
                                },
                            },
                        },
                    },
                },
                '400': {
                    description: 'Bad Request - Employer is already the owner or validation failure.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'This employer is already the owner of this company' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
                '401': {
                    description: 'Unauthorized - User is not logged in.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
                '404': {
                    description: 'Not Found - No such company exists.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Company not found' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
                '500': {
                    description: 'Internal Server Error',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Internal Server Error' },
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
    '/companies/{companyId}/workers': {
        post: {
            tags: ['Company Management'],
            summary: 'Add a worker to a company',
            description: 'Allows an authorized employer to add a worker to a company.',
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'companyId',
                    in: 'path',
                    required: true,
                    description: 'ID of the company',
                    schema: { type: 'string' }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                workerId: {
                                    type: 'string',
                                    description: 'ID of the worker to add to the company'
                                }
                            },
                            required: ['workerId']
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Worker added to the company successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Worker added to the company successfully' },
                                    data: {
                                        type: 'object',
                                        additionalProperties: true
                                    },
                                    totalCount: { type: 'number', example: 1 }
                                }
                            }
                        }
                    }
                },
                '400': {
                    description: 'Bad Request - Employer is already the owner or validation failure.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'This employer is already the owner of this company' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
                '401': {
                    description: 'Unauthorized - User is not logged in.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
                '404': {
                    description: 'Not Found - No such company exists.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Company not found' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 },
                                },
                            },
                        },
                    },
                },
                '500': {
                    description: 'Internal Server Error',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Internal Server Error' },
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
module.exports = {
    CompanyEndpoint
};
