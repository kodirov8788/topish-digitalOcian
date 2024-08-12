const galleryEndpoint = {
    tags: [
        {
            name: 'Projects',
            description: 'The Education managing API',
        },
    ],

    '/gallery': {
        post: {
            summary: 'Create or update a gallery post',
            tags: ['Gallery'],
            description: 'Allows JobSeeker users to either create a new gallery post with images or add images to an existing gallery post. This operation expects multipart/form-data containing the images.',
            requestBody: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            properties: {
                                gallery: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                        format: 'binary'
                                    },
                                    description: 'Array of images to be uploaded.'
                                }
                            },
                            required: ['gallery']
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Gallery post created or updated successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Gallery post updated successfully' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            _id: { type: 'string', example: '507f191e810c19729de860ea' },
                                            images: {
                                                type: 'array',
                                                items: { type: 'string' },
                                                example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
                                            },
                                            createdBy: { type: 'string', example: '507f191e810c19729de860eb' }
                                        }
                                    },
                                    totalCount: { type: 'number', example: 1 }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized access or action not allowed.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized or You are not allowed!' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 }
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'User not found or jobSeeker property missing.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'User not found or jobSeeker property missing' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal server error encountered during the process.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Something went wrong during the sign out process.' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 }
                                }
                            }
                        }
                    }
                }
            }
        },
        get: {
            summary: 'Retrieve all gallery posts created by the logged-in user',
            tags: ['Gallery'],
            description: 'Fetches all gallery posts from the database that are created by the currently authenticated JobSeeker user.',
            security: [
                {
                    bearerAuth: []  // Assuming you are using Bearer Token for authentication
                }
            ],
            responses: {
                '200': {
                    description: 'Gallery posts created by the user retrieved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Your gallery posts retrieved successfully' },
                                    data: {
                                        type: 'object',
                                        items: {
                                            $ref: '#/components/schemas/GalleryPost'
                                        }
                                    },
                                    totalCount: { type: 'number' }  // totalCount dynamically reflects the number of posts returned
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized access. User is not authenticated or not allowed to access this endpoint.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized or You are not allowed!' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal server error. An error occurred while fetching the user\'s gallery posts.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Internal Server Error' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 }
                                }
                            }
                        }
                    }
                }
            }
        },
        delete: {
            summary: 'Delete an image from a gallery post',
            tags: ['Gallery'],
            description: 'Allows a JobSeeker user to delete an image from their gallery post. The image URL must be specified.',
            parameters: [
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                imageUrl: {
                                    type: 'string',
                                    description: 'The URL of the image to be deleted.',
                                    example: 'https://example.com/path/to/image.jpg'
                                }
                            },
                            required: ['imageUrl']
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Image deleted successfully from the gallery post and AWS S3 bucket.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Image deleted successfully' },
                                    data: {
                                        type: 'object',
                                        example: { deletedImage: 'https://example.com/path/to/image.jpg' }
                                    },
                                    totalCount: { type: 'number', example: 1 }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized access. User is not authenticated.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 }
                                }
                            }
                        }
                    }
                },
                '403': {
                    description: 'Forbidden. User does not have permission to delete the image from this gallery.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'You do not have permission to delete images from this gallery' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 }
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'Gallery post not found.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Gallery not found' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal server error. Something went wrong during the image deletion process.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Something went wrong' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 }
                                }
                            }
                        }
                    }
                }
            }
        }

    },
    '/gallery/{id}': {
        get: {
            summary: 'Retrieve a specific gallery post by its ID',
            tags: ['Gallery'],
            description: 'Fetches a single gallery post from the database by its unique identifier. This endpoint requires user authentication.',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'The unique identifier of the gallery post to retrieve',
                    schema: {
                        type: 'string'
                    }
                }
            ],
            security: [
                {
                    bearerAuth: []  // Assuming you are using Bearer Token authentication
                }
            ],
            responses: {
                '200': {
                    description: 'Gallery post retrieved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Gallery post retrieved successfully' },
                                    data: {
                                        $ref: '#/components/schemas/GalleryPost'
                                    },
                                    totalCount: { type: 'number', example: 1 }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized access. The user is not authenticated.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 }
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'Gallery post not found. The specified ID does not match any existing gallery posts.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Gallery post not found' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal server error. An error occurred while attempting to retrieve the gallery post.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Internal Server Error' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 }
                                }
                            }
                        }
                    }
                }
            }
        },

    },
    '/gallery/allgalleries': {
        get: {
            "summary": "Retrieve all gallery posts created by the logged-in JobSeeker user",
            "tags": ["Gallery"],
            "description": "Fetches all gallery posts from the database that are created by the currently authenticated JobSeeker user, with support for pagination.",
            "security": [
                {
                    "bearerAuth": []
                }
            ],
            "parameters": [
                {
                    "name": "page",
                    "in": "query",
                    "required": false,
                    "description": "Page number of the gallery posts to retrieve",
                    "schema": {
                        "type": "integer",
                        "default": 1
                    }
                },
                {
                    "name": "limit",
                    "in": "query",
                    "required": false,
                    "description": "Number of gallery posts to retrieve per page",
                    "schema": {
                        "type": "integer",
                        "default": 10
                    }
                }
            ],
            "responses": {
                "200": {
                    "description": "Gallery posts retrieved successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Your gallery posts retrieved successfully" },
                                    "data": {
                                        "type": "array",
                                        "items": {
                                            "$ref": "#/components/schemas/GalleryPost"
                                        }
                                    },
                                    "totalCount": { "type": "integer", "example": 20 },
                                    "pagination": {
                                        "type": "object",
                                        "properties": {
                                            "currentPage": { "type": "integer", "example": 1 },
                                            "totalPages": { "type": "integer", "example": 2 },
                                            "limit": { "type": "integer", "example": 10 },
                                            "totalDocuments": { "type": "integer", "example": 20 }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "401": {
                    "description": "Unauthorized access. User is not authenticated.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Unauthorized" },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "500": {
                    "description": "Internal server error. An error occurred while fetching the user's gallery posts.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Internal Server Error" },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/gallery/getjobseeker/{id}': {

        get: {
            tags: ['Gallery'],
            summary: "Retrieve gallery posts created by a specific job seeker.",
            description: "This endpoint retrieves all gallery posts created by a specified job seeker, accessible only to users with an 'Employer' role.",
            operationId: "getJobSeekerGallery",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "ID of the job seeker to retrieve gallery posts for",
                    required: true,
                    schema: {
                        type: "string"
                    }
                }
            ],
            responses: {
                '200': {
                    description: 'Gallery posts created by the user retrieved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Your gallery posts retrieved successfully' },
                                    data: {
                                        type: 'object',
                                        items: {
                                            $ref: '#/components/schemas/GalleryPost'
                                        }
                                    },
                                    totalCount: { type: 'number' }  // totalCount dynamically reflects the number of posts returned
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized access. User is not authenticated or not allowed to access this endpoint.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized or You are not allowed!' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal server error. An error occurred while fetching the user\'s gallery posts.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Internal Server Error' },
                                    data: { type: 'null', example: null },
                                    totalCount: { type: 'number', example: 0 }
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
    galleryEndpoint
};

