// src/docs/bannerDocs.js
const BannerEndpoint = {
    tags: [
        {
            name: 'Banner',
            description: 'The Banner managing API',
        },
    ],
    '/banner': {
        post: {
            summary: 'Create or Update Banner',
            tags: ['Banner'],
            description: 'Allows admin users to create a new banner or update an existing banner with new images. Requires admin role.',
            requestBody: {
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            properties: {
                                banner: {
                                    type: 'string',
                                    format: 'binary',
                                    description: 'banner to upload.',
                                },
                                // 'banner': {
                                //     type: 'array',
                                //     items: {
                                //         type: 'string',
                                //         format: 'binary',
                                //         description: 'Array of banner images to upload.'
                                //     },
                                //     description: 'Banner images files.'
                                // }
                            }
                        },
                        encoding: {
                            bannerImages: {
                                contentType: 'image/jpeg, image/png'
                            }
                        }
                    }
                },
                required: true
            },
            responses: {
                '200': {
                    description: 'Banner created or updated successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Banner updated successfully' },
                                    data: {
                                        $ref: '#/components/schemas/Banner'
                                    },
                                    count: { type: 'integer', example: 1 }
                                }
                            }
                        }
                    }
                },
                '400': {
                    description: 'Bad request, such as an upload error.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Upload Error: [Error Message]' },
                                    count: { type: 'integer', example: 0 },
                                    data: { type: 'null', example: null }

                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized access, either no authentication token or not an admin.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized or You are not allowed!' },
                                    data: { type: 'null', example: null },
                                    count: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal server error.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Server Error: Something went wrong' },
                                    data: { type: 'null', example: null },
                                    count: { type: 'integer', example: 0 }
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
        },
        delete: {
            summary: 'Delete a Banner Image',
            tags: ['Banner'],
            description: 'Allows admin users to delete an image from the banner. Requires admin role.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                imageUrl: {
                                    type: 'string',
                                    format: 'uri',
                                    description: 'The URL of the image to be deleted.'
                                }
                            },
                            required: ['imageUrl']
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Image deleted successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Image deleted successfully' },
                                    count: { type: 'integer', example: 1 },
                                    data: { type: 'null', example: null }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized access, either due to missing authentication or insufficient privileges.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized or You are not allowed!' },
                                    count: { type: 'integer', example: 0 },
                                    data: { type: 'null', example: null }
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'Banner not found or no image with the specified URL exists.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Banner not found' },
                                    count: { type: 'integer', example: 0 },
                                    data: { type: 'null', example: null }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal server error, something went wrong during the process.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Something went wrong' },
                                    count: { type: 'integer', example: 0 },
                                    data: { type: 'null', example: null }
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

        },
        get: {
            summary: 'Get All Banner Images',
            tags: ['Banner'],
            description: 'Retrieves all banners. Requires authentication.',
            responses: {
                '200': {
                    description: 'Gallery posts retrieved successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Gallery posts retrieved successfully' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/Banner'
                                        }
                                    },
                                    count: { type: 'integer', example: 1 }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized access, no authentication token provided.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Unauthorized' },
                                    count: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'No banner found.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'No banner found' },
                                    count: { type: 'integer', example: 0 }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal server error.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'error' },
                                    msg: { type: 'string', example: 'Internal Server Error' },
                                    count: { type: 'integer', example: 0 }
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
    "/banner/moveimage": {
        "post": {
            "summary": "Move Banner Image Position",
            "tags": ["Banner"],
            "description": "Moves a banner image from one position to another within the banner images array. Requires admin privileges.",
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "oldIndex": {
                                    "type": "integer",
                                    "example": 0,
                                    "description": "The current index of the banner image to be moved."
                                },
                                "newIndex": {
                                    "type": "integer",
                                    "example": 1,
                                    "description": "The new index where the banner image should be moved to."
                                }
                            },
                            "required": ["oldIndex", "newIndex"]
                        }
                    }
                }
            },
            "responses": {
                "200": {
                    "description": "Banner updated successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Banner updated successfully" },
                                    "data": {
                                        "$ref": "#/components/schemas/Banner"
                                    },
                                    "count": { "type": "integer", "example": 1 }
                                }
                            }
                        }
                    }
                },
                "401": {
                    "description": "Unauthorized access, no authentication token provided or not an admin.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Unauthorized or not allowed" },
                                    "count": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "400": {
                    "description": "Invalid index provided.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Invalid index" },
                                    "count": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "404": {
                    "description": "Banner not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Banner not found" },
                                    "count": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "500": {
                    "description": "Internal server error encountered while processing the request.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Internal Server Error" },
                                    "count": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                }
            },
            "security": [
                {
                    "bearerAuth": []
                }
            ]
        }
    }

}

module.exports = {
    BannerEndpoint
};





