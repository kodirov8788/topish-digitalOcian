const OfficesEndpoint = {
    tags: [
        {
            name: 'Offices',
            description: 'The Offices managing API',
        },
    ],
    '/offices': {
        post: {
            tags: ['Offices'],
            summary: 'Create a new office listing',
            description: 'Allows a service user to create a new office listing. Requires at least 5 coins.',
            operationId: 'createOffice',
            security: [
                {
                    bearerAuth: []
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            properties: {
                                title: {
                                    type: 'string',
                                    description: 'Title of the office listing.',
                                    example: 'Spacious Modern Office'
                                },
                                description: {
                                    type: 'string',
                                    description: 'Detailed description of the office space.',
                                    example: 'A well-lit, spacious office located in the heart of the city, close to public transport.'
                                },
                                location: {
                                    type: 'string',
                                    description: 'Location of the office.',
                                    example: 'Downtown, CityName'
                                },
                                officeType: {
                                    type: 'string',
                                    description: 'Type of office space (e.g., shared, private, coworking).',
                                    example: 'Shared'
                                },
                                phoneNumber: {
                                    type: 'string',
                                    description: 'Phone number of the office owner.',
                                    example: '123-456-7890'
                                },
                                price: {
                                    type: 'number',
                                    description: 'Monthly rental price in dollars.',
                                    example: 1500
                                },
                                officeImages: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                        format: 'binary',
                                        description: 'Office images'
                                    },
                                    description: 'Array of images for the office. Each image should be uploaded as a separate file.'
                                }
                            },
                            required: ['title', 'description', 'location', 'price']
                        }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Office created successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Office created successfully.' },
                                    data: {
                                        $ref: '#/components/schemas/Office'
                                    },
                                    totalCount: { type: 'integer', example: 1 }
                                }
                            }
                        }
                    }
                },
                '400': {
                    description: 'Bad request. Possible issues: not enough coins, service details not found, or invalid input data.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Not enough coins or missing required fields.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized. User must be authenticated.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized access.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '403': {
                    description: 'Forbidden. User does not have permission to create an office.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'User does not have permission to perform this action.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal Server Error. An error occurred while creating the office.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'An error occurred while creating the office.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                }
            }
        },
        get: {
            tags: ['Offices'],
            summary: 'Retrieve all office listings',
            description: 'Fetches a list of all office listings with optional filters, sorting, and pagination.',
            operationId: 'getAllOffices',
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: 'recommended',
                    in: 'query',
                    description: 'Filter for recommended offices',
                    required: false,
                    schema: {
                        type: 'boolean',
                    },
                },
                {
                    name: 'title',
                    in: 'query',
                    description: 'Filter offices by title',
                    required: false,
                    schema: {
                        type: 'string',
                    },
                },
                {
                    name: 'location',
                    in: 'query',
                    description: 'Filter offices by location',
                    required: false,
                    schema: {
                        type: 'string',
                    },
                },
                {
                    name: 'page',
                    in: 'query',
                    description: 'Page number for pagination',
                    required: false,
                    schema: {
                        type: 'integer',
                        default: 1,
                    },
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Number of items per page',
                    required: false,
                    schema: {
                        type: 'integer',
                        default: 10,
                    },
                },
                {
                    name: 'sort',
                    in: 'query',
                    description: 'Sort order',
                    required: false,
                    schema: {
                        type: 'string',
                        example: 'price,-createdAt',
                    },
                },
            ],
            responses: {
                '200': {
                    description: 'Offices retrieved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Offices retrieved successfully.' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/Office'
                                        },
                                    },
                                    totalCount: { type: 'integer', example: 100 },
                                    currentPage: { type: 'integer', example: 1 },
                                    totalPages: { type: 'integer', example: 10 },
                                    limit: { type: 'integer', example: 10 },
                                }
                            }
                        }
                    }
                },
                '400': {
                    description: 'Bad request. Possible issues: invalid query parameters.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Invalid query parameters.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 },
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized. User must be authenticated.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized. You need to log in to perform this action.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal Server Error. An error occurred while fetching the offices.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'An error occurred while fetching the offices.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 },
                                }
                            }
                        }
                    }
                },
            }
        }
    },
    '/offices/myposts': {
        get: {
            tags: ['Offices'],
            summary: 'Retrieve service user\'s office listings',
            description: 'Fetches office listings created by the service user, with support for pagination.',
            operationId: 'getServicePosts',
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: 'page',
                    in: 'query',
                    description: 'Page number for pagination, starting at 1',
                    required: false,
                    schema: {
                        type: 'integer',
                        default: 1,
                    },
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Number of items per page',
                    required: false,
                    schema: {
                        type: 'integer',
                        default: 10,
                    },
                },
            ],
            responses: {
                '200': {
                    description: 'Office listings retrieved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Service user\'s office listings retrieved successfully.' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/Office'
                                        },
                                    },
                                    pagination: {
                                        type: 'object',
                                        properties: {
                                            currentPage: { type: 'integer', example: 1 },
                                            totalPages: { type: 'integer', example: 10 },
                                            limit: { type: 'integer', example: 10 },
                                            totalDocuments: { type: 'integer', example: 100 },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                '401': {
                    description: 'Unauthorized. User must be authenticated and have the "Service" role.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized. You need to log in and have the appropriate permissions to access this resource.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 },
                                },
                            },
                        },
                    },
                },
                '500': {
                    description: 'Internal Server Error. An error occurred while retrieving the office listings.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'An error occurred while attempting to retrieve the service user\'s office listings.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 },
                                },
                            },
                        },
                    },
                },
            }
        }
    },
    '/offices/{officeId}': {
        get: {
            tags: ['Offices'],
            summary: 'Retrieve a single office listing',
            description: 'Fetches details of a specific office listing by its ID. Requires user authentication.',
            operationId: 'getSingleOffice',
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: 'officeId',
                    in: 'path',
                    required: true,
                    description: 'The unique identifier of the office to retrieve',
                    schema: {
                        type: 'string',
                    },
                },
            ],
            responses: {
                '200': {
                    description: 'Office retrieved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Office retrieved successfully.' },
                                    data: {
                                        $ref: '#/components/schemas/Office'
                                    },
                                    totalCount: { type: 'integer', example: 1 }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized. User must be authenticated.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized. You need to log in to perform this action.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'Office not found with the given ID.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Office not found with ID: ${officeId}.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal Server Error. An error occurred while retrieving the office.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Internal Server Error. An error occurred while retrieving the office.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
            }
        },
        patch: {
            tags: ['Offices'],
            summary: 'Update an existing office listing',
            description: 'Allows a service user to update an existing office listing. The user must be the creator of the office listing and have appropriate permissions.',
            operationId: 'updateOffice',
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: 'officeId',
                    in: 'path',
                    required: true,
                    description: 'The ID of the office to update',
                    schema: {
                        type: 'string'
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            properties: {
                                title: {
                                    type: 'string',
                                    description: 'Title of the office listing.',
                                    example: 'Updated Office Title'
                                },
                                description: {
                                    type: 'string',
                                    description: 'Detailed description of the office space.',
                                    example: 'Updated description of the office.'
                                },
                                location: {
                                    type: 'string',
                                    description: 'Location of the office.',
                                    example: 'New Location, CityName'
                                },
                                officeType: {
                                    type: 'string',
                                    description: 'Type of office space (e.g., shared, private, coworking).',
                                    example: 'Private'
                                },
                                phoneNumber: {
                                    type: 'string',
                                    description: 'Contact phone number for the office.',
                                    example: '987-654-3210'
                                },
                                price: {
                                    type: 'number',
                                    description: 'Monthly rental price in dollars.',
                                    example: 2000
                                },
                                images: {
                                    type: 'string',
                                    description: 'Existing image IDs to keep.',
                                    example: 'image1,image2'
                                },
                                officeImages: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                        format: 'binary',
                                        description: 'New office images'
                                    },
                                    description: 'Array of images for the office. Each image should be uploaded as a separate file.'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Office updated successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Office updated successfully.' },
                                    data: {
                                        $ref: '#/components/schemas/Office'
                                    },
                                    totalCount: { type: 'integer', example: 1 }
                                }
                            }
                        }
                    }
                },
                '400': {
                    description: 'Bad request. Possible issues with request format or data.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Bad request. Please check your request format and data.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized. User must be authenticated.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized access.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '403': {
                    description: 'Forbidden. User does not have permission to update this office.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Forbidden. You do not have permission to update this office.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'Office not found with the given ID.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Office not found with the given ID.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal Server Error. An error occurred while updating the office.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'An error occurred while updating the office.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                }
            }
        },
        delete: {
            tags: ['Offices'],
            summary: 'Delete an office listing',
            description: 'Allows a service user to delete an existing office listing. The user must be the creator of the listing.',
            operationId: 'deleteOffice',
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: 'officeId',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                    },
                    description: 'The ID of the office to delete',
                }
            ],
            responses: {
                '200': {
                    description: 'Office deleted successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Office deleted successfully.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized. User must be authenticated.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized. You need to log in to perform this action.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'Office not found with the given ID or not authorized to delete.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Office not found with the given ID or you are not allowed to delete this office.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal Server Error. An error occurred while attempting to delete the office.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'An error occurred while attempting to delete the office.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
            }
        }
    },
    '/offices/{officeId}/favorite': {
        post: {
            tags: ['Offices'],
            summary: 'Mark an office as a favorite',
            description: 'Allows authenticated users to mark a specific office as their favorite.',
            operationId: 'postFavoriteOffice',
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: 'officeId',
                    in: 'path',
                    description: 'Unique identifier of the office to be marked as favorite',
                    required: true,
                    schema: {
                        type: 'string',
                        example: '5e8d9a9e2f9f3b4a3c7d9c41'
                    }
                }
            ],
            responses: {
                '201': {
                    description: 'Office marked as favorite successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Office liked successfully' },
                                    data: { type: 'null' },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '400': {
                    description: 'Bad request. User not found or office already liked.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'User not found or you have already liked this office' },
                                    data: { type: 'null' },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized. The user is not authenticated.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized' },
                                    data: { type: 'null' },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'Office not found.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Office not found' },
                                    data: { type: 'null' },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal Server Error.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Internal Server Error' },
                                    data: { type: 'null' },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                }
            }
        },
        delete: {
            tags: ['Offices'],
            summary: 'Remove an office from favorites',
            description: 'Allows authenticated users to remove an office from their list of favorites.',
            operationId: 'deleteFavoriteOffice',
            parameters: [
                {
                    name: 'officeId',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                    },
                    description: 'Unique identifier of the office to be removed from favorites',
                }
            ],
            security: [
                {
                    bearerAuth: []
                }
            ],
            responses: {
                '200': {
                    description: 'Office successfully removed from favorites',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Office removed from favorites successfully' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized. User must be authenticated.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'Office not found or Office not found in favorites',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Office not found or Office not found in favorites' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal Server Error. An error occurred while attempting to remove the office from favorites.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Internal Server Error' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/offices/myfavoriteOffices': {
        get: {
            tags: ['Offices'],
            summary: 'Retrieve all favorite offices for the authenticated user',
            description: 'Returns a list of all offices that the authenticated user has marked as favorite.',
            operationId: 'getFavoriteOffices',
            security: [
                {
                    bearerAuth: []
                }
            ],
            responses: {
                '200': {
                    description: 'Favorite offices retrieved successfully or no favorite offices found',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Favorite offices retrieved successfully' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/Office'
                                        },
                                    },
                                    totalCount: { type: 'integer', example: 0 } // Adjust example based on actual data
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized. User must be authenticated.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'User not found',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'User not found' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal Server Error. An error occurred while retrieving favorite offices.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Internal Server Error' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "/offices/forAdmin": {
        get: {
            summary: "Get all offices for admin",
            tags: ["Offices"],
            description:
                "Endpoint to retrieve all office listings for admin with optional filtering, sorting, and field selection. Requires authentication.",
            parameters: [
                {
                    in: "query",
                    name: "recommended",
                    schema: {
                        type: "boolean",
                    },
                    description: "Filter for recommended offices.",
                },
                {
                    in: "query",
                    name: "title",
                    schema: {
                        type: "string",
                    },
                    description: "Filter offices by title with regex search.",
                },
                {
                    in: "query",
                    name: "location",
                    schema: {
                        type: "string",
                    },
                    description: "Filter offices by location with regex search.",
                },
                {
                    in: "query",
                    name: "page",
                    schema: {
                        type: "integer",
                        default: 1,
                    },
                    description: "Page number for pagination.",
                },
                {
                    in: "query",
                    name: "limit",
                    schema: {
                        type: "integer",
                        default: 10,
                    },
                    description: "Number of items per page for pagination.",
                },
                {
                    in: "query",
                    name: "sort",
                    schema: {
                        type: "string",
                    },
                    description: "Sort offices by specified field.",
                },
            ],
            responses: {
                200: {
                    description:
                        "A list of offices with optional filtering, sorting, and field selection.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "success" },
                                    msg: {
                                        type: "string",
                                        example: "Offices retrieved successfully.",
                                    },
                                    data: {
                                        type: "array",
                                        items: { $ref: "#/components/schemas/Office" },
                                    },
                                    totalCount: { type: "integer", example: 0 },
                                },
                            },
                        },
                    },
                },
                401: {
                    description:
                        "Unauthorized access, no or invalid authentication token provided.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "failure" },
                                    msg: {
                                        type: "string",
                                        example:
                                            "Unauthorized access, no or invalid authentication token provided.",
                                    },
                                    data: { type: "null", example: null },
                                    totalCount: { type: "integer", example: 0 },
                                },
                            },
                        },
                    },
                },
                500: {
                    description: "Internal server error or exception thrown.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "failure" },
                                    msg: {
                                        type: "string",
                                        example: "Internal server error or exception thrown.",
                                    },
                                    data: { type: "null", example: null },
                                    totalCount: { type: "integer", example: 0 },
                                },
                            },
                        },
                    },
                },
            },
            security: [
                {
                    bearerAuth: [],
                },
            ],
        },
    },
    "/offices/{id}/approveOrReject": {
        patch: {
            summary: "Approve or reject an office post",
            tags: ["Offices"],
            description:
                "Endpoint for an admin to approve or reject an office post by its ID. Requires authentication and admin role.",
            parameters: [
                {
                    in: "path",
                    name: "id",
                    required: true,
                    schema: {
                        type: "string",
                    },
                    description: "The unique identifier of the office post to approve or reject.",
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                status: {
                                    type: "string",
                                    enum: ["Approved", "Rejected"],
                                    example: "Approved",
                                },
                            },
                            required: ["status"],
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Office status updated successfully.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "success" },
                                    msg: { type: "string", example: "Office status updated successfully." },
                                    data: { $ref: "#/components/schemas/Office" },
                                },
                            },
                        },
                    },
                },
                400: {
                    description: "Invalid status or missing required fields.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "error" },
                                    msg: {
                                        type: "string",
                                        example: "Invalid status or missing required fields.",
                                    },
                                    data: { type: "null", example: null },
                                },
                            },
                        },
                    },
                },
                401: {
                    description:
                        "Unauthorized access, no or invalid authentication token provided.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "failure" },
                                    msg: {
                                        type: "string",
                                        example:
                                            "Unauthorized access, no or invalid authentication token provided.",
                                    },
                                    data: { type: "null", example: null },
                                },
                            },
                        },
                    },
                },
                404: {
                    description: "Office post not found.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "failure" },
                                    msg: { type: "string", example: "Office post not found." },
                                    data: { type: "null", example: null },
                                },
                            },
                        },
                    },
                },
                500: {
                    description: "Internal server error or exception thrown.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "failure" },
                                    msg: {
                                        type: "string",
                                        example: "Internal server error or exception thrown.",
                                    },
                                    data: { type: "null", example: null },
                                },
                            },
                        },
                    },
                },
            },
            security: [
                {
                    bearerAuth: [],
                },
            ],
        },
    },
    '/offices/approveAllOffices': {
        post: {
            summary: 'Approve all offices',
            tags: ['Offices'],
            description: 'Endpoint for an admin to approve all office posts. Requires authentication and admin role.',
            responses: {
                '200': {
                    description: 'All offices approved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'All offices approved successfully.' },
                                    data: { type: 'null', example: null }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized access, no or invalid authentication token provided.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'failure' },
                                    msg: {
                                        type: 'string',
                                        example: 'Unauthorized access, no or invalid authentication token provided.',
                                    },
                                    data: { type: 'null', example: null },
                                },
                            },
                        },
                    },
                },
                '500': {
                    description: 'Internal server error or exception thrown.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'failure' },
                                    msg: {
                                        type: 'string',
                                        example: 'Internal server error or exception thrown.',
                                    },
                                    data: { type: 'null', example: null },
                                },
                            },
                        },
                    },
                },
            },
            security: [
                {
                    bearerAuth: [],
                },
            ],
        },
    },
    '/offices/rejected': {
        get: {
            tags: ['Offices'],
            summary: 'Retrieve all rejected offices',
            description: 'Fetches a list of all rejected office listings. Requires user authentication.',
            operationId: 'getRejectedOffices',
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: 'page',
                    in: 'query',
                    description: 'Page number for pagination',
                    required: false,
                    schema: {
                        type: 'integer',
                        default: 1,
                    },
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Number of items per page',
                    required: false,
                    schema: {
                        type: 'integer',
                        default: 10,
                    },
                },
            ],
            responses: {
                '200': {
                    description: 'Rejected offices retrieved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Rejected offices retrieved successfully.' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/Office'
                                        },
                                    },
                                    totalCount: { type: 'integer', example: 100 },
                                    currentPage: { type: 'integer', example: 1 },
                                    totalPages: { type: 'integer', example: 10 },
                                    limit: { type: 'integer', example: 10 },
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized. User must be authenticated.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized. You need to log in to perform this action.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal Server Error. An error occurred while fetching the offices.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'An error occurred while fetching the offices.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 },
                                }
                            }
                        }
                    }
                },
            }
        }
    },
    '/offices/pending': {
        get: {
            tags: ['Offices'],
            summary: 'Retrieve all pending offices',
            description: 'Fetches a list of all pending office listings. Requires user authentication.',
            operationId: 'getPendingOffices',
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: 'page',
                    in: 'query',
                    description: 'Page number for pagination',
                    required: false,
                    schema: {
                        type: 'integer',
                        default: 1,
                    },
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Number of items per page',
                    required: false,
                    schema: {
                        type: 'integer',
                        default: 10,
                    },
                },

            ],
            responses: {
                '200': {
                    description: 'Pending offices retrieved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Pending offices retrieved successfully.' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/Office'
                                        },
                                    },
                                    totalCount: { type: 'integer', example: 100 },
                                    currentPage: { type: 'integer', example: 1 },
                                    totalPages: { type: 'integer', example: 10 },
                                    limit: { type: 'integer', example: 10 },
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized. User must be authenticated.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized. You need to log in to perform this action.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal Server Error. An error occurred while fetching the offices.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'An error occurred while fetching the offices.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 },
                                }
                            }
                        }
                    }
                },
            }
        }
    },
    '/offices/approved': {
        get: {
            tags: ['Offices'],
            summary: 'Retrieve all approved offices',
            description: 'Fetches a list of all approved office listings. Requires user authentication.',
            operationId: 'getApprovedOffices',
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: 'page',
                    in: 'query',
                    description: 'Page number for pagination',
                    required: false,
                    schema: {
                        type: 'integer',
                        default: 1,
                    },
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Number of items per page',
                    required: false,
                    schema: {
                        type: 'integer',
                        default: 10,
                    },
                }
            ],
            responses: {
                '200': {
                    description: 'Approved offices retrieved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Approved offices retrieved successfully.' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/Office'
                                        },
                                    },
                                    totalCount: { type: 'integer', example: 100 },
                                    currentPage: { type: 'integer', example: 1 },
                                    totalPages: { type: 'integer', example: 10 },
                                    limit: { type: 'integer', example: 10 },
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized. User must be authenticated.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized. You need to log in to perform this action.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal Server Error. An error occurred while fetching the offices.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'An error occurred while fetching the offices.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'integer', example: 0 },
                                }
                            }
                        }
                    }
                },
            }
        }
    }
};

module.exports = {
    OfficesEndpoint
};
