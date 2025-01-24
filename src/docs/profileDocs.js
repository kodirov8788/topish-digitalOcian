// src/docs/profileDocs.js
const ProfileEndpoint = {
    tags: [
        {
            name: 'ProfileAccess',
            description: 'The Profile managing API',
        },
    ],
    '/privacy/jobseekers/profile-access-requests': {
        post: {
            summary: 'Send a profile access request',
            tags: ['ProfileAccess'],
            description: 'Endpoint for sending a profile access request to a specific job seeker. Requires authentication.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['requesterId'],
                            properties: {
                                requesterId: {
                                    type: 'string',
                                    format: 'uuid',
                                    description: 'The unique identifier of the user sending the request.',
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Profile access request sent or updated successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Profile access request sent successfully' },
                                    data: { type: 'object', example: {} },
                                    totalCount: { type: 'integer', example: 0 },
                                }
                            }
                        }
                    }
                },
                '400': {
                    description: 'Bad request. Possible issues: Missing target/requester ID, IDs are the same, etc.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Requester and target user cannot be the same' },
                                    data: { type: 'object', example: {} },
                                    totalCount: { type: 'integer', example: 0 },
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
                                    msg: { type: 'string', example: 'Unauthorized!' },
                                    data: { type: 'object', example: {} },
                                    totalCount: { type: 'integer', example: 0 },
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
                                    msg: { type: 'string', example: 'An error occurred while sending the profile access request.' },
                                    data: { type: 'object', example: {} },
                                    totalCount: { type: 'integer', example: 0 },
                                }
                            }
                        }
                    }
                }
            }
        },
        get: {
            summary: 'Get profile access requests',
            tags: ['ProfileAccess'],
            description: 'Endpoint to retrieve all profile access requests sent to a specific job seeker. Requires authentication.',
            responses: {
                '200': {
                    description: 'Profile access requests retrieved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        example: 'success',
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'Profile access requests retrieved successfully',
                                    },
                                    data: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/ProfileAccessRequest'
                                        },
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 1,
                                    },
                                },
                            },
                        },
                    },
                },
                '401': {
                    description: 'Unauthorized access, no or invalid authentication token provided.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        example: 'error',
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'Unauthorized!',
                                    },
                                    data: {
                                        type: 'object',
                                        example: {},
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0,
                                    },
                                },
                            },
                        },
                    },
                },
                '404': {
                    description: 'No profile access requests found or job seeker not found.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        example: 'error',
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'No requests received or job seeker not found.',
                                    },
                                    data: {
                                        type: 'object',
                                        example: {},
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0,
                                    },
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
                                    result: {
                                        type: 'string',
                                        example: 'error',
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'Something went wrong',
                                    },
                                    data: {
                                        type: 'object',
                                        example: {},
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    '/privacy/jobseekers/profile-visibility': {
        put: {
            summary: 'Update profile visibility',
            tags: ['ProfileAccess'],
            description: 'Endpoint to update the visibility of a job seeker\'s profile. Requires authentication.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                visibility: {
                                    type: 'string',
                                    description: 'The new visibility setting for the profile. Should be either "public" or "private".',
                                    enum: ['public', 'private']
                                }
                            },
                            required: ['visibility']
                        }
                    }
                }
            },
            security: [
                {
                    bearerAuth: []
                }
            ],
            responses: {
                '200': {
                    description: 'Profile visibility updated successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        example: 'success',
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'Profile visibility updated successfully',
                                    },
                                    data: {
                                        type: 'object',
                                        example: {}
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
                    description: 'Unauthorized access, no or invalid authentication token provided.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        example: 'error',
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'Unauthorized!',
                                    },
                                    data: {
                                        type: 'object',
                                        example: {},
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0,
                                    },
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
                                    result: {
                                        type: 'string',
                                        example: 'error',
                                    },
                                    msg: {
                                        type: 'string',
                                        example: 'Something went wrong',
                                    },
                                    data: {
                                        type: 'object',
                                        example: {},
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0,
                                    },
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/privacy/jobseekers/accept-profile-access-request/{requestId}': {
        post: {
            summary: 'Decline profile access request',
            tags: ['ProfileAccess'],
            description: 'Endpoint for a job seeker to decline a profile access request. Requires authentication.',
            parameters: [{
                in: 'path',
                name: 'requestId',
                required: true,
                schema: { type: 'string' },
                description: 'The unique identifier of the profile access request to decline.',
            }],
            responses: {
                '200': {
                    description: 'Profile access request accepted successfully. Request accepted and users are now friends.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Request accepted and users are now friends' },
                                    data: { type: 'object', example: {} },
                                    totalCount: { type: 'integer', example: 0 },
                                }
                            }
                        }
                    }
                },
                '400': {
                    description: 'Request has already been processed or is not in a pending state.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Request has already been processed' },
                                    data: { type: 'object', example: {} },
                                    totalCount: { type: 'integer', example: 0 },
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
                                    msg: { type: 'string', example: 'Unauthorized!' },
                                    data: { type: 'object', example: {} },
                                    totalCount: { type: 'integer', example: 0 },
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'Profile access request not found or one or both users not found.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Request not found or one or both users not found' },
                                    data: { type: 'object', example: {} },
                                    totalCount: { type: 'integer', example: 0 },
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
                                    msg: { type: 'string', example: 'Something went wrong: ' },
                                    data: { type: 'object', example: {} },
                                    totalCount: { type: 'integer', example: 0 },
                                }
                            }
                        }
                    }
                }
            }
        },
    },
    '/privacy/jobseekers/decline-profile-access-request/{requestId}': {
        post: {
            summary: 'Decline profile access request',
            tags: ['ProfileAccess'],
            description: 'Endpoint for a job seeker to decline a profile access request. Requires authentication.',
            parameters: [
                {
                    in: 'path',
                    name: 'requestId',
                    required: true,
                    schema: {
                        type: 'string',
                    },
                    description: 'The unique identifier of the profile access request to decline.',
                }
            ],
            responses: {
                '200': {
                    description: 'Profile access request declined successfully. Request declined and users are no longer friends.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Request declined and users are no longer friends' },
                                    data: { type: 'object', example: {} },
                                    totalCount: { type: 'integer', example: 0 },
                                }
                            }
                        }
                    }
                },
                '400': {
                    description: 'Request has already been processed or is not in a pending state.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Request has already been processed' },
                                    data: { type: 'object', example: {} },
                                    totalCount: { type: 'integer', example: 0 },
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
                                    msg: { type: 'string', example: 'Unauthorized!' },
                                    data: { type: 'object', example: {} },
                                    totalCount: { type: 'integer', example: 0 },
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'Profile access request not found or one or both users not found.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Request not found or one or both users not found' },
                                    data: { type: 'object', example: {} },
                                    totalCount: { type: 'integer', example: 0 },
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
                                    msg: { type: 'string', example: 'Something went wrong: ' },
                                    data: { type: 'object', example: {} },
                                    totalCount: { type: 'integer', example: 0 },
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/privacy/jobseekers/reverse-acceptance-profile-access-request/{requestId}': {
        post: {
            summary: 'Reverse acceptance of profile access request',
            tags: ['ProfileAccess'],
            description: 'Endpoint for a job seeker to reverse the acceptance of a profile access request, removing the users from each other\'s friends list. Requires authentication.',
            parameters: [
                {
                    in: 'path',
                    name: 'requestId',
                    required: true,
                    schema: {
                        type: 'string',
                    },
                    description: 'The unique identifier of the profile access request to reverse the acceptance of.',
                },
            ],
            responses: {
                '200': {
                    description: 'Profile access request acceptance reversed successfully. Friendship reversed and request status set to declined.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Friendship reversed and request status set to declined' },
                                    data: { type: 'object', example: {} },
                                    totalCount: { type: 'integer', example: 0 },
                                }
                            }
                        }
                    }
                },
                '400': {
                    description: 'Request has already been processed or is not in an accepted state.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Request is not in an accepted state' },
                                    data: { type: 'object', example: {} },
                                    totalCount: { type: 'integer', example: 0 },
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
                                    msg: { type: 'string', example: 'Unauthorized!' },
                                    data: { type: 'object', example: {} },
                                    totalCount: { type: 'integer', example: 0 },
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'Profile access request not found or one or both users not found.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Request not found or one or both users not found' },
                                    data: { type: 'object', example: {} },
                                    totalCount: { type: 'integer', example: 0 },
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
                                    msg: { type: 'string', example: 'Something went wrong: ' },
                                    data: { type: 'object', example: {} },
                                    totalCount: { type: 'integer', example: 0 },
                                }
                            }
                        }
                    }
                }
            }
        },
    },
}

module.exports = {
    ProfileEndpoint
};








