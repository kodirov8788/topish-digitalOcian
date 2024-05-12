const statisticsEndpoint = {
    tags: [
        {
            name: 'Statistics',
            description: 'The Education managing API',
        },
    ],

    '/statistics/jobseekers': {
        get: {
            summary: 'Get Job Seeker Count Information',
            tags: ['Statistics'],
            description: 'Retrieves count of job seekers, including total count, count for the current month, rate of change compared to the previous month, and count for a selected day.',
            parameters: [
                {
                    in: 'query',
                    name: 'date',
                    schema: {
                        type: 'string',
                        format: 'date',
                        description: 'Optional. The date for which to retrieve the job seeker count. Defaults to today\'s date if not provided.'
                    },
                    required: false
                }
            ],
            responses: {
                '200': {
                    description: 'Job seekers count information retrieved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Job seekers count information retrieved successfully' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            totalJobSeekerCount: { type: 'integer', example: 1500 },
                                            thisMonthCount: { type: 'integer', example: 300 },
                                            rateStatus: { type: 'string', enum: ['up', 'down', 'steady'], example: 'up' },
                                            thisPeriodPercentage: { type: 'string', example: '5%' },
                                            selectedDayCount: { type: 'integer', example: 10 }
                                        }
                                    },
                                    totalCount: { "type": "number", "example": 1 }
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
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized' },
                                    data: { "type": "null", "example": null },
                                    totalCount: { "type": "number", "example": 0 }
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
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Internal Server Error' },
                                    data: { "type": "null", "example": null },
                                    totalCount: { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                }
            },
            security: [
                {
                    bearerAuth: []
                }
            ]
        }
    },
    '/statistics/employers': {
        get: {
            summary: 'Get Employer Count Information',
            tags: ['Statistics'],
            description: 'Retrieves count of employers, including total count, count for the current month, rate of change compared to the previous month, and count for a selected day.',
            parameters: [
                {
                    in: 'query',
                    name: 'date',
                    schema: {
                        type: 'string',
                        format: 'date',
                        description: 'Optional. The date for which to retrieve the employer count. Defaults to today\'s date if not provided.'
                    },
                    required: false
                }
            ],
            responses: {
                '200': {
                    description: 'Employer count information retrieved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Employer count information retrieved successfully' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            totalEmployerCount: { type: 'integer', example: 500 },
                                            thisMonthCount: { type: 'integer', example: 50 },
                                            rateStatus: { type: 'string', enum: ['up', 'down', 'steady'], example: 'up' },
                                            thisPeriodPercentage: { type: 'string', example: '10%' },
                                            selectedDayCount: { type: 'integer', example: 5 }
                                        }
                                    },
                                    totalCount: { "type": "number", "example": 1 }
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
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized' },
                                    data: { "type": "null", "example": null },
                                    totalCount: { "type": "number", "example": 0 }
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
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Internal Server Error' },
                                    data: { "type": "null", "example": null },
                                    totalCount: { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                }
            },
            security: [
                {
                    bearerAuth: []
                }
            ]
        }
    },
    '/statistics/jobs': {
        get: {
            summary: 'Get Jobs Count Information',
            tags: ['Statistics'],
            description: 'Retrieves various job counts, including total job count, count for the current month, and count for a selected day.',
            parameters: [
                {
                    in: 'query',
                    name: 'date',
                    schema: {
                        type: 'string',
                        format: 'date',
                        description: 'Optional. The date for which to retrieve job counts. Defaults to today\'s date if not provided.'
                    },
                    required: false
                }
            ],
            responses: {
                '200': {
                    description: 'Job counts information retrieved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Job counts information retrieved successfully' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            totalJobsCount: { type: 'integer', example: 1000 },
                                            thisMonthCount: { type: 'integer', example: 100 },
                                            rateStatus: { type: 'string', enum: ['up', 'down', 'steady'], example: 'steady' },
                                            thisPeriodPercentage: { type: 'string', example: '5%' },
                                            selectedDayCount: { type: 'integer', example: 5 }
                                        }
                                    },
                                    totalCount: { "type": "number", "example": 1 }
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
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized' },
                                    data: { "type": "null", "example": null },
                                    totalCount: { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal server error or exception thrown.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Internal server error or exception thrown' },
                                    data: { "type": "null", "example": null },
                                    totalCount: { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                }
            },
            security: [
                {
                    bearerAuth: []
                }
            ]
        }
    },
    '/statistics/applicants': {
        get: {
            summary: 'Get Applicants Count Information',
            tags: ['Statistics'],
            description: 'Retrieves various applicants counts, including total applicants count, count for the current month, and count for a selected day.',
            parameters: [
                {
                    in: 'query',
                    name: 'date',
                    schema: {
                        type: 'string',
                        format: 'date',
                        description: 'Optional. The date for which to retrieve applicants counts. Defaults to today\'s date if not provided.'
                    },
                    required: false
                }
            ],
            responses: {
                '200': {
                    description: 'Applicants counts information retrieved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Applicants counts information retrieved successfully' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            totalJobsCount: { type: 'integer', example: 500 },
                                            thisMonthCount: { type: 'integer', example: 50 },
                                            rateStatus: { type: 'string', enum: ['up', 'down', 'steady'], example: 'steady' },
                                            thisPeriodPercentage: { type: 'string', example: '10%' },
                                            selectedDayCount: { type: 'integer', example: 5 }
                                        }
                                    },
                                    totalCount: { "type": "number", "example": 1 }
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
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized' },
                                    data: { "type": "null", "example": null },
                                    totalCount: { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal server error or exception thrown.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Internal server error or exception thrown' },
                                    data: { "type": "null", "example": null },
                                    totalCount: { "type": "number", "example": 0 }
                                }
                            }
                        }
                    }
                }
            },
            security: [
                {
                    bearerAuth: []
                }
            ]
        }
    }
}


module.exports = {
    statisticsEndpoint
};