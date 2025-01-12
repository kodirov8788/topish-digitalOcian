const AdminEndpoint = {
    tags: [
        {
            name: 'Admin',
            description: 'The Auth managing API',
        },
    ],
    '/admin/getUsersForAdmin': {
        get: {
            summary: 'Retrieve Users List',
            tags: ['Admin'],
            description: 'Fetches a paginated list of users. Accessible only to users with an admin role.',
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    in: 'query',
                    name: 'page',
                    required: false,
                    schema: {
                        type: 'integer',
                        default: 1
                    },
                    description: 'Page number of the users list'
                },
                {
                    in: 'query',
                    name: 'limit',
                    required: false,
                    schema: {
                        type: 'integer',
                        default: 10
                    },
                    description: 'Number of users per page'
                }
            ],
            responses: {
                200: {
                    description: 'Successful retrieval of users list with pagination.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'success'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'Users retrieved successfully'
                                    },
                                    data: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/Users'
                                        }
                                    },
                                    totalCount: {
                                        type: 'integer'
                                    },
                                    pagination: {
                                        type: 'object',
                                        properties: {
                                            currentPage: {
                                                type: 'integer'
                                            },
                                            totalPages: {
                                                type: 'integer'
                                            },
                                            limit: {
                                                type: 'integer'
                                            },
                                            totalDocuments: {
                                                type: 'integer'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: 'Unauthorized - User not logged in.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'Unauthorized access'
                                    }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: 'Forbidden - User is not an admin.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'User is not authorized to perform this action'
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'No users found - The requested page has no users.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'No users found'
                                    }
                                }
                            }
                        }
                    }
                },
                500: {
                    description: 'Internal Server Error - Error fetching users.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'An error occurred while fetching the users'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/admin/getJobSeekersForAdmin': {
        get: {
            summary: 'Retrieve Job Seekers List',
            tags: ['Admin'],
            description: 'Fetches a paginated list of job seekers. This endpoint can only be accessed by users with an admin role.',
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    in: 'query',
                    name: 'page',
                    required: false,
                    schema: {
                        type: 'integer',
                        default: 1
                    },
                    description: 'Page number of the job seekers list'
                },
                {
                    in: 'query',
                    name: 'limit',
                    required: false,
                    schema: {
                        type: 'integer',
                        default: 10
                    },
                    description: 'Number of job seekers per page'
                }
            ],
            responses: {
                200: {
                    description: 'Successful retrieval of job seekers list with pagination. Returns job seekers data and pagination details.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'success'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'Job seekers retrieved successfully'
                                    },
                                    data: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/JobSeeker'
                                        }
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        description: 'Total number of job seekers that match the query, ignoring pagination.'
                                    },
                                    pagination: {
                                        type: 'object',
                                        properties: {
                                            currentPage: {
                                                type: 'integer'
                                            },
                                            totalPages: {
                                                type: 'integer'
                                            },
                                            limit: {
                                                type: 'integer'
                                            },
                                            totalDocuments: {
                                                type: 'integer'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: 'Unauthorized - User not logged in.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'Unauthorized access'
                                    }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: 'Forbidden - User is not an admin.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'User is not authorized to perform this action'
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'No job seekers found - The requested page has no job seekers.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'No job seekers found'
                                    }
                                }
                            }
                        }
                    }
                },
                500: {
                    description: 'Internal Server Error - Error fetching job seekers.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'An error occurred while fetching the job seekers'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/admin/getEmployersForAdmin': {
        get: {
            summary: 'Retrieve Employers List',
            tags: ['Admin'],
            description: 'Fetches a paginated list of employer profiles. Only accessible to users with an admin role.',
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    in: 'query',
                    name: 'page',
                    required: false,
                    schema: {
                        type: 'integer',
                        default: 1
                    },
                    description: 'Page number of the employers list'
                },
                {
                    in: 'query',
                    name: 'limit',
                    required: false,
                    schema: {
                        type: 'integer',
                        default: 10
                    },
                    description: 'Number of employers per page'
                }
            ],
            responses: {
                200: {
                    description: 'Successful retrieval of employer profiles with pagination. Returns employer data and pagination details.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'success'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'Employers retrieved successfully'
                                    },
                                    data: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/Employer'
                                        }
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        description: 'Total number of employers that match the query, ignoring pagination.'
                                    },
                                    pagination: {
                                        type: 'object',
                                        properties: {
                                            currentPage: {
                                                type: 'integer'
                                            },
                                            totalPages: {
                                                type: 'integer'
                                            },
                                            limit: {
                                                type: 'integer'
                                            },
                                            totalDocuments: {
                                                type: 'integer'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: 'Unauthorized - User not logged in.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'Unauthorized access'
                                    }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: 'Forbidden - User is not an admin.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'User is not authorized to perform this action'
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'No employers found - The requested page has no employers.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'No employers found'
                                    }
                                }
                            }
                        }
                    }
                },
                500: {
                    description: 'Internal Server Error - Error fetching employers.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'Something went wrong'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/admin/getJobsForAdmin': {
        get: {
            summary: 'Retrieve Job Listings',
            tags: ['Admin'],
            description: 'Fetches a paginated list of job listings based on various filter criteria. Accessible only to users with an admin role.',
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    in: 'query',
                    name: 'education',
                    required: false,
                    schema: {
                        type: 'string'
                    },
                    description: 'Filter jobs by education level required.'
                },
                {
                    in: 'query',
                    name: 'experience',
                    required: false,
                    schema: {
                        type: 'string'
                    },
                    description: 'Filter jobs by experience required.'
                },
                {
                    in: 'query',
                    name: 'workingtype',
                    required: false,
                    schema: {
                        type: 'string'
                    },
                    description: 'Filter jobs by working type (e.g., full-time, part-time).'
                },
                {
                    in: 'query',
                    name: 'recommended',
                    required: false,
                    schema: {
                        type: 'boolean'
                    },
                    description: 'Filter to include only recommended jobs.'
                },
                {
                    in: 'query',
                    name: 'salary',
                    required: false,
                    schema: {
                        type: 'string'
                    },
                    description: 'Filter jobs by salary range.'
                },
                {
                    in: 'query',
                    name: 'jobTitle',
                    required: false,
                    schema: {
                        type: 'string'
                    },
                    description: 'Filter jobs by title.'
                },
                {
                    in: 'query',
                    name: 'sort',
                    required: false,
                    schema: {
                        type: 'string'
                    },
                    description: 'Sort order for the results (e.g., "-createdAt").'
                },
                {
                    in: 'query',
                    name: 'recentjob',
                    required: false,
                    schema: {
                        type: 'boolean'
                    },
                    description: 'Filter to include only jobs posted within the last week.'
                },
                {
                    in: 'query',
                    name: 'numericFilters',
                    required: false,
                    schema: {
                        type: 'string'
                    },
                    description: 'Filter jobs by numeric values (e.g., "yearsExperience>2,salary<=50000").'
                },
                {
                    in: 'query',
                    name: 'jobType',
                    required: false,
                    schema: {
                        type: 'string'
                    },
                    description: 'Filter jobs by type (e.g., "Contract,Permanent").'
                },
                {
                    in: 'query',
                    name: 'page',
                    schema: {
                        type: 'integer',
                        default: 1
                    },
                    description: 'Page number of the job listings'
                },
                {
                    in: 'query',
                    name: 'limit',
                    schema: {
                        type: 'integer',
                        default: 10
                    },
                    description: 'Number of job listings per page'
                }
            ],
            responses: {
                200: {
                    description: 'Successful retrieval of job listings with pagination. Returns job data and pagination details.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'success'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'Jobs retrieved successfully'
                                    },
                                    data: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/Jobs'
                                        }
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        description: 'Total number of jobs that match the query, ignoring pagination.'
                                    },
                                    pagination: {
                                        type: 'object',
                                        properties: {
                                            currentPage: {
                                                type: 'integer'
                                            },
                                            totalPages: {
                                                type: 'integer'
                                            },
                                            limit: {
                                                type: 'integer'
                                            },
                                            totalDocuments: {
                                                type: 'integer'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: 'Unauthorized - User not logged in.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'Unauthorized access'
                                    }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: 'Forbidden - User is not an admin.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'User is not authorized to perform this action'
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'No jobs found - The requested page has no jobs.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'No jobs found'
                                    }
                                }
                            }
                        }
                    }
                },
                500: {
                    description: 'Internal Server Error - Error fetching jobs.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'Something went wrong'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/admin/getOfficesForAdmin': {
        get: {
            summary: 'Retrieve Office Listings',
            tags: ['Admin'],
            description: 'Fetches a paginated list of office listings based on filter criteria such as title and location. Only accessible to users with an admin role.',
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    in: 'query',
                    name: 'recommended',
                    schema: {
                        type: 'boolean'
                    },
                    description: 'Filter offices to show only recommended ones.',
                    required: false
                },
                {
                    in: 'query',
                    name: 'title',
                    schema: {
                        type: 'string'
                    },
                    description: 'Search offices by title using a case-insensitive regex match.',
                    required: false
                },
                {
                    in: 'query',
                    name: 'location',
                    schema: {
                        type: 'string'
                    },
                    description: 'Search offices by location using a case-insensitive regex match.',
                    required: false
                },
                {
                    in: 'query',
                    name: 'page',
                    schema: {
                        type: 'integer',
                        default: 1
                    },
                    description: 'Page number of the office listings'
                },
                {
                    in: 'query',
                    name: 'limit',
                    schema: {
                        type: 'integer',
                        default: 10
                    },
                    description: 'Number of office listings per page'
                },
                {
                    in: 'query',
                    name: 'sort',
                    schema: {
                        type: 'string'
                    },
                    description: 'Sort order for the results, specified as comma-separated fields with optional - for descending order (e.g., "-created_at,location").',
                    required: false
                }
            ],
            responses: {
                200: {
                    description: 'Successful retrieval of office listings with pagination. Returns office data and pagination details.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'success'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'Offices retrieved successfully'
                                    },
                                    data: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/Office'
                                        }
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        description: 'Total number of offices that match the query, ignoring pagination.'
                                    },
                                    pagination: {
                                        type: 'object',
                                        properties: {
                                            currentPage: {
                                                type: 'integer'
                                            },
                                            totalPages: {
                                                type: 'integer'
                                            },
                                            limit: {
                                                type: 'integer'
                                            },
                                            totalDocuments: {
                                                type: 'integer'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: 'Bad Request - Error in query parameters such as an empty title.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'Title cannot be empty'
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: 'Unauthorized - User not logged in.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'Unauthorized access'
                                    }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: 'Forbidden - User is not an admin.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'User is not authorized to perform this action'
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'No offices found - The requested page has no offices.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'No offices found'
                                    }
                                }
                            }
                        }
                    }
                },
                500: {
                    description: 'Internal Server Error - Error fetching offices.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'Internal Server Error'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/admin/getQuickjobsForAdmin': {
        get: {
            summary: 'Retrieve Quick Job Listings',
            tags: ['Admin'],
            description: 'Fetches a paginated list of quick job listings based on filter criteria such as title and location. Only accessible to users with an admin role.',
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    in: 'query',
                    name: 'recommended',
                    schema: {
                        type: 'boolean'
                    },
                    description: 'Filter quick jobs to show only recommended ones.',
                    required: false
                },
                {
                    in: 'query',
                    name: 'title',
                    schema: {
                        type: 'string'
                    },
                    description: 'Search quick jobs by title using a case-insensitive regex match.',
                    required: false
                },
                {
                    in: 'query',
                    name: 'location',
                    schema: {
                        type: 'string'
                    },
                    description: 'Search quick jobs by location using a case-insensitive regex match.',
                    required: false
                },
                {
                    in: 'query',
                    name: 'page',
                    schema: {
                        type: 'integer',
                        default: 1
                    },
                    description: 'Page number of the quick job listings'
                },
                {
                    in: 'query',
                    name: 'limit',
                    schema: {
                        type: 'integer',
                        default: 10
                    },
                    description: 'Number of quick job listings per page'
                },
                {
                    in: 'query',
                    name: 'sort',
                    schema: {
                        type: 'string'
                    },
                    description: 'Sort order for the results, specified as comma-separated fields with optional - for descending order (e.g., "-createdAt,location").',
                    required: false
                }
            ],
            responses: {
                200: {
                    description: 'Successful retrieval of quick job listings with pagination. Returns quick job data and pagination details.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'success'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'Quick jobs retrieved successfully'
                                    },
                                    data: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/Quickjob'
                                        }
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        description: 'Total number of quick jobs that match the query, ignoring pagination.'
                                    },
                                    pagination: {
                                        type: 'object',
                                        properties: {
                                            currentPage: {
                                                type: 'integer'
                                            },
                                            totalPages: {
                                                type: 'integer'
                                            },
                                            limit: {
                                                type: 'integer'
                                            },
                                            totalDocuments: {
                                                type: 'integer'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: 'Bad Request - Error in query parameters such as an empty title.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'Title cannot be empty'
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: 'Unauthorized - User not logged in.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'Unauthorized access'
                                    }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: 'Forbidden - User is not an admin.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'User is not authorized to perform this action'
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'No quick jobs found - The requested page has no quick jobs.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'No quick jobs found'
                                    }
                                }
                            }
                        }
                    }
                },
                500: {
                    description: 'Internal Server Error - Error fetching quick jobs.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        enum: ['success', 'error'],
                                        default: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        default: 'Internal Server Error'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/admin/blockUser/{id}': {
        post: {
            summary: 'Block a User',
            tags: ['Admin'],
            description: 'Blocks a specific user by their ID. Only accessible by users with an admin role.',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string'
                    },
                    description: 'The unique identifier of the user to block'
                }
            ],
            security: [
                {
                    bearerAuth: []
                }
            ],
            requestBody: {
                description: 'No request body required.'
            },
            responses: {
                '200': {
                    description: 'User successfully blocked or was already blocked',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        example: 'success'
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'User successfully blocked or was already blocked.'
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id: {
                                                type: 'string'
                                            },
                                            blocked: {
                                                type: 'boolean',
                                                example: true
                                            }
                                        }
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 1
                                    }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized - User is not logged in',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        example: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'Unauthorized'
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {}
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    }
                                }
                            }
                        }
                    }
                },
                '403': {
                    description: 'Forbidden - User is not an admin',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        example: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'You are not authorized to perform this action.'
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {}
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    }
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
                                    result: {
                                        type: 'string',
                                        example: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'User not found'
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {}
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal Server Error',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        example: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'Internal Server Error'
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {}
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/admin/unBlockUser/{id}': {
        post: {
            summary: 'Unblock a User',
            tags: ['Admin'],
            description: 'Unblocks a specific user by their ID. Only accessible by users with an admin role.',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string'
                    },
                    description: 'The unique identifier of the user to unblock'
                }
            ],
            security: [
                {
                    bearerAuth: []
                }
            ],
            requestBody: {
                description: 'No request body required.'
            },
            responses: {
                '200': {
                    description: 'User successfully unblocked or was already unblocked',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        example: 'success'
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'User successfully unblocked or was already unblocked.'
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id: {
                                                type: 'string'
                                            },
                                            blocked: {
                                                type: 'boolean',
                                                example: false
                                            }
                                        }
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 1
                                    }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized - User is not logged in',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        example: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'Unauthorized'
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {}
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    }
                                }
                            }
                        }
                    }
                },
                '403': {
                    description: 'Forbidden - User is not an admin',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        example: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'You are not authorized to perform this action.'
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {}
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    }
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
                                    result: {
                                        type: 'string',
                                        example: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'User not found'
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {}
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal Server Error',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        example: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'Internal Server Error'
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {}
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/admin/notification': {
        post: {
            summary: 'Send News to All Users',
            tags: ['Admin'],
            description: 'Sends a notification message to all users. Only accessible by users with admin privileges.',
            parameters: [],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['title', 'message'],
                            properties: {
                                title: {
                                    type: 'string',
                                    example: 'New Feature Release'
                                },
                                message: {
                                    type: 'string',
                                    example: 'We are excited to announce a new feature...'
                                }
                            }
                        }
                    }
                },
                description: 'The title and message body of the news to send to all users.'
            },
            security: [
                {
                    bearerAuth: []
                }
            ],
            responses: {
                '200': {
                    description: 'News sent successfully or no users to notify',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        example: 'success'
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'News sent successfully or no users found.'
                                    },
                                    data: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                user: {
                                                    type: 'string'
                                                },
                                                title: {
                                                    type: 'string'
                                                },
                                                message: {
                                                    type: 'string'
                                                },
                                                read: {
                                                    type: 'boolean',
                                                    example: false
                                                }
                                            }
                                        }
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0 // or the total count of users notified
                                    }
                                }
                            }
                        }
                    }
                },
                '400': {
                    description: 'Bad Request - Title and message are required',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        example: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'Title and message are required'
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {}
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized - User is not logged in',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        example: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'Unauthorized'
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {}
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    }
                                }
                            }
                        }
                    }
                },
                '403': {
                    description: 'Forbidden - User is not an admin',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        example: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'You are not authorized to perform this action.'
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {}
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal Server Error',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        example: 'error'
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'Internal Server Error'
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {}
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

};

module.exports = { AdminEndpoint };

