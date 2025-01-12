const telegramEndpoint = {
    tags: [
        {
            name: 'Telegram',
            description: 'The Telegram managing API',
        },
    ],
    '/telegram': {
        get: {
            summary: 'Retrieve Telegram channels',
            tags: ['Telegram'],
            description: 'Fetches the Telegram channels for the authenticated user. Requires user authentication.',
            responses: {
                "200": {
                    "description": "Telegram channels retrieved successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": {
                                        "type": "string",
                                        "example": "success"
                                    },
                                    "msg": {
                                        "type": "string",
                                        "example": "Telegram channels retrieved successfully."
                                    },
                                    "data": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "name": { "type": "string" },
                                                "id": { "type": "string" },
                                                "link": { "type": "string", "format": "url" },
                                                "available": { "type": "boolean" },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                "401": {
                    "description": "Unauthorized. User is not authenticated.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Unauthorized. User is not authenticated." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
                "500": {
                    "description": "Internal server error.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Internal server error." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    '/telegram/{id}': {
        delete: {
            summary: 'Delete a specific Telegram channel',
            tags: ['Telegram'],
            description: 'Deletes a specific Telegram channel by ID. Requires user authentication.',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'The ID of the channel to be deleted',
                    schema: {
                        type: 'string',
                    },
                },
            ],
            responses: {
                "200": {
                    "description": "Telegram channel deleted successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Telegram channel deleted successfully." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
                "401": {
                    "description": "Unauthorized. User is not authenticated.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Unauthorized. User is not authenticated." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
                "404": {
                    "description": "Channel not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Channel not found." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
                "500": {
                    "description": "Internal server error.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Internal server error." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
            },
        },
        patch: {
            summary: 'Update a specific Telegram channel',
            tags: ['Telegram'],
            description: 'Updates a specific Telegram channel by ID. Requires user authentication.',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'The ID of the channel to be updated',
                    schema: {
                        type: 'string',
                    },
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
                                    description: 'Name of the channel',
                                    example: 'Updated Channel Name',
                                },
                                link: {
                                    type: 'string',
                                    format: 'url',
                                    description: 'Link to the channel',
                                    example: 'https://t.me/updatedchannel',
                                },
                                available: {
                                    type: 'boolean',
                                    description: 'Availability status of the channel',
                                    example: true,
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                "200": {
                    "description": "Telegram channel updated successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Telegram channel updated successfully." },
                                    "data": {
                                        "type": "object",
                                        "properties": {
                                            "name": { "type": "string" },
                                            "id": { "type": "string" },
                                            "link": { "type": "string", "format": "url" },
                                            "available": { "type": "boolean" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                "400": {
                    "description": "Bad Request. Validation error.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "\"name\" is not allowed to be empty" },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
                "401": {
                    "description": "Unauthorized. User is not authenticated.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Unauthorized. User is not authenticated." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
                "404": {
                    "description": "Channel not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Channel not found." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
                "500": {
                    "description": "Internal server error.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Internal server error." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    // "/telegram/leave-channel": {
    //     post: {
    //         summary: 'Leave a specific Telegram channel',
    //         tags: ['Telegram'],
    //         description: 'Leaves a specific Telegram channel by ID. Requires user authentication.',
    //         requestBody: {
    //             required: true,
    //             content: {
    //                 'application/json': {
    //                     schema: {
    //                         type: 'object',
    //                         properties: {
    //                             chatId: {
    //                                 type: 'string',
    //                                 description: 'The ID of the channel to leave',
    //                                 example: '1234567890',
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //         responses: {
    //             "200": {
    //                 "description": "Left the Telegram channel successfully.",
    //                 "content": {
    //                     "application/json": {
    //                         "schema": {
    //                             "type": "object",
    //                             "properties": {
    //                                 "result": { "type": "string", "example": "success" },
    //                                 "msg": { "type": "string", "example": "Left the Telegram channel successfully." },
    //                                 "data": { "type": "object", "example": {} },
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //             "400": {
    //                 "description": "Bad Request. Validation error.",
    //                 "content": {
    //                     "application/json": {
    //                         "schema": {
    //                             "type": "object",
    //                             "properties": {
    //                                 "result": { "type": "string", "example": "error" },
    //                                 "msg": { "type": "string", "example": "\"chatId\" is not allowed to be empty" },
    //                                 "data": { "type": "object", "example": {} },
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //             "500": {
    //                 "description": "Internal server error.",
    //                 "content": {
    //                     "application/json": {
    //                         "schema": {
    //                             "type": "object",
    //                             "properties": {
    //                                 "result": { "type": "string", "example": "error" },
    //                                 "msg": { "type": "string", "example": "Internal server error." },
    //                                 "data": { "type": "object", "example": {} },
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //     },
    // },
    // "/telegram/save-channel": {
    //     post: {
    //         summary: 'Save a Telegram channel',
    //         tags: ['Telegram'],
    //         description: 'Saves a Telegram channel. Requires user authentication.',
    //         requestBody: {
    //             required: true,
    //             content: {
    //                 'application/json': {
    //                     schema: {
    //                         type: 'object',
    //                         properties: {
    //                             chatId: {
    //                                 type: 'string',
    //                                 description: 'The ID of the channel to save',
    //                                 example: '1234567890',
    //                             },
    //                             chatTitle: {
    //                                 type: 'string',
    //                                 description: 'Title of the channel to save',
    //                                 example: 'My Channel',
    //                             },
    //                             addedById: {
    //                                 type: 'string',
    //                                 description: 'ID of the user who added the channel',
    //                                 example: '67890',
    //                             },
    //                             addedByUsername: {
    //                                 type: 'string',
    //                                 description: 'Username of the user who added the channel',
    //                                 example: 'myusername',
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //         responses: {
    //             "200": {
    //                 "description": "Channel saved successfully.",
    //                 "content": {
    //                     "application/json": {
    //                         "schema": {
    //                             "type": "object",
    //                             "properties": {
    //                                 "result": { "type": "string", "example": "success" },
    //                                 "msg": { "type": "string", "example": "Channel saved successfully." },
    //                                 "data": { "type": "object", "example": {} },
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //             "400": {
    //                 "description": "Bad Request. Channel already exists.",
    //                 "content": {
    //                     "application/json": {
    //                         "schema": {
    //                             "type": "object",
    //                             "properties": {
    //                                 "result": { "type": "string", "example": "error" },
    //                                 "msg": { "type": "string", "example": "Channel already exists." },
    //                                 "data": { "type": "object", "example": {} },
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //             "500": {
    //                 "description": "Internal server error.",
    //                 "content": {
    //                     "application/json": {
    //                         "schema": {
    //                             "type": "object",
    //                             "properties": {
    //                                 "result": { "type": "string", "example": "error" },
    //                                 "msg": { "type": "string", "example": "Internal server error." },
    //                                 "data": { "type": "object", "example": {} },
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //     },
    // },
    // "/telegram/remove-channel": {
    //     post: {
    //         summary: 'Remove a Telegram channel',
    //         tags: ['Telegram'],
    //         description: 'Removes a Telegram channel. Requires user authentication.',
    //         requestBody: {
    //             required: true,
    //             content: {
    //                 'application/json': {
    //                     schema: {
    //                         type: 'object',
    //                         properties: {
    //                             chatId: {
    //                                 type: 'string',
    //                                 description: 'The ID of the channel to remove',
    //                                 example: '1234567890',
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //         responses: {
    //             "200": {
    //                 "description": "Channel removed successfully.",
    //                 "content": {
    //                     "application/json": {
    //                         "schema": {
    //                             "type": "object",
    //                             "properties": {
    //                                 "result": { "type": "string", "example": "success" },
    //                                 "msg": { "type": "string", "example": "Channel removed successfully." },
    //                                 "data": { "type": "object", "example": {} },
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //             "400": {
    //                 "description": "Bad Request. Channel not found.",
    //                 "content": {
    //                     "application/json": {
    //                         "schema": {
    //                             "type": "object",
    //                             "properties": {
    //                                 "result": { "type": "string", "example": "error" },
    //                                 "msg": { "type": "string", "example": "Channel not found." },
    //                                 "data": { "type": "object", "example": {} },
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //             "500": {
    //                 "description": "Internal server error.",
    //                 "content": {
    //                     "application/json": {
    //                         "schema": {
    //                             "type": "object",
    //                             "properties": {
    //                                 "result": { "type": "string", "example": "error" },
    //                                 "msg": { "type": "string", "example": "Internal server error." },
    //                                 "data": { "type": "object", "example": {} },
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //     },
    // },
    // "/telegram/add-telegram-id": {
    //     post: {
    //         summary: 'Add a Telegram ID',
    //         tags: ['Telegram'],
    //         description: 'Adds a Telegram ID. Requires user authentication.',
    //         requestBody: {
    //             required: true,
    //             content: {
    //                 'application/json': {
    //                     schema: {
    //                         type: 'object',
    //                         properties: {
    //                             phoneNumber: {
    //                                 type: 'string',
    //                                 description: 'Phone number of the user',
    //                                 example: '+1234567890',
    //                             },
    //                             telegramId: {
    //                                 type: 'string',
    //                                 description: 'Telegram ID to add',
    //                                 example: '987654321',
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //         responses: {
    //             "200": {
    //                 "description": "Telegram ID added successfully.",
    //                 "content": {
    //                     "application/json": {
    //                         "schema": {
    //                             "type": "object",
    //                             "properties": {
    //                                 "result": { "type": "string", "example": "success" },
    //                                 "msg": { "type": "string", "example": "Telegram ID added successfully." },
    //                                 "data": { "type": "object", "example": {} },
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //             "400": {
    //                 "description": "Bad Request. Telegram ID does not match.",
    //                 "content": {
    //                     "application/json": {
    //                         "schema": {
    //                             "type": "object",
    //                             "properties": {
    //                                 "result": { "type": "string", "example": "error" },
    //                                 "msg": { "type": "string", "example": "Telegram ID does not match." },
    //                                 "data": { "type": "object", "example": {} },
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //             "404": {
    //                 "description": "User not found.",
    //                 "content": {
    //                     "application/json": {
    //                         "schema": {
    //                             "type": "object",
    //                             "properties": {
    //                                 "result": { "type": "string", "example": "error" },
    //                                 "msg": { "type": "string", "example": "User not found." },
    //                                 "data": { "type": "object", "example": {} },
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //             "500": {
    //                 "description": "Internal server error.",
    //                 "content": {
    //                     "application/json": {
    //                         "schema": {
    //                             "type": "object",
    //                             "properties": {
    //                                 "result": { "type": "string", "example": "error" },
    //                                 "msg": { "type": "string", "example": "Internal server error." },
    //                                 "data": { "type": "object", "example": {} },
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //     },
    // },
    "/telegram/add-update-data": {
        post: {
            summary: 'Add or Update Telegram Data',
            tags: ['Telegram'],
            description: 'Adds or updates Telegram data for the authenticated user. Requires user authentication.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                postNumber: {
                                    type: 'string',
                                    description: 'Post number',
                                    example: '1234',
                                },
                                contactNumber: {
                                    type: 'string',
                                    description: 'Contact number',
                                    example: '+1234567890',
                                },
                                companyName: {
                                    type: 'string',
                                    description: 'Company name',
                                    example: 'My Company',
                                },
                                additionalInfo: {
                                    type: 'string',
                                    description: 'Additional information',
                                    example: 'Some additional info',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                "200": {
                    "description": "Telegram data added/updated successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Telegram data added/updated successfully." },
                                    "data": {
                                        "type": "object",
                                        "properties": {
                                            "postNumber": { "type": "string" },
                                            "contactNumber": { "type": "string" },
                                            "companyName": { "type": "string" },
                                            "additionalInfo": { "type": "string" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                "400": {
                    "description": "Bad Request. Validation error.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Validation error." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
                "401": {
                    "description": "Unauthorized. User is not authenticated.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Unauthorized. User is not authenticated." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
                "500": {
                    "description": "Internal server error.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Internal server error." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    "/telegram/delete-telegram-data": {
        post: {
            summary: 'Delete Telegram Data',
            tags: ['Telegram'],
            description: 'Deletes Telegram data for the authenticated user. Requires user authentication.',
            responses: {
                "200": {
                    "description": "Telegram data deleted successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Telegram data deleted successfully." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
                "401": {
                    "description": "Unauthorized. User is not authenticated.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Unauthorized. User is not authenticated." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
                "500": {
                    "description": "Internal server error.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Internal server error." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    "/telegram/remove-telegram-id": {
        post: {
            summary: 'Remove Telegram ID',
            tags: ['Telegram'],
            description: 'Removes the Telegram ID for the authenticated user. Requires user authentication.',
            responses: {
                "200": {
                    "description": "Telegram ID removed successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Telegram ID removed successfully." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
                "401": {
                    "description": "Unauthorized. User is not authenticated.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Unauthorized. User is not authenticated." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
                "500": {
                    "description": "Internal server error.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Internal server error." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    "/telegram/upload-post-images": {
        post: {
            summary: 'Upload Telegram post images',
            tags: ['Telegram'],
            description: 'Uploads images for Telegram posts. Requires user authentication.',
            requestBody: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            properties: {
                                postImages: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                        format: 'binary',
                                    },
                                    description: 'Array of images to upload',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                "200": {
                    "description": "Images uploaded successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Images uploaded successfully." },
                                    "data": {
                                        "type": "array",
                                        "items": {
                                            "type": "string",
                                            "example": "https://example.com/image.jpg",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                "400": {
                    "description": "Bad Request. Invalid file type or other validation error.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Invalid file type. Only specified formats are allowed." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
                "401": {
                    "description": "Unauthorized. User is not authenticated.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Unauthorized. User is not authenticated." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
                "500": {
                    "description": "Internal server error.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Internal server error." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    // "/telegram/delete-post-images": {
    //     post: {
    //         summary: 'Delete Telegram post images',
    //         tags: ['Telegram'],
    //         description: 'Deletes specified images from Telegram posts. Requires user authentication.',
    //         requestBody: {
    //             required: true,
    //             content: {
    //                 'application/json': {
    //                     schema: {
    //                         type: 'object',
    //                         properties: {
    //                             imageUrls: {
    //                                 type: 'array',
    //                                 items: {
    //                                     type: 'string',
    //                                     description: 'Array of image URLs to delete',
    //                                     example: 'https://example.com/image.jpg',
    //                                 },
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //         responses: {
    //             "200": {
    //                 "description": "Images deleted successfully.",
    //                 "content": {
    //                     "application/json": {
    //                         "schema": {
    //                             "type": "object",
    //                             "properties": {
    //                                 "result": { "type": "string", "example": "success" },
    //                                 "msg": { "type": "string", "example": "Images deleted successfully." },
    //                                 "data": { "type": "object", "example": {} },
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //             "400": {
    //                 "description": "Bad Request. Invalid image URLs provided.",
    //                 "content": {
    //                     "application/json": {
    //                         "schema": {
    //                             "type": "object",
    //                             "properties": {
    //                                 "result": { "type": "string", "example": "error" },
    //                                 "msg": { "type": "string", "example": "Invalid image URLs provided." },
    //                                 "data": { "type": "object", "example": {} },
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //             "401": {
    //                 "description": "Unauthorized. User is not authenticated.",
    //                 "content": {
    //                     "application/json": {
    //                         "schema": {
    //                             "type": "object",
    //                             "properties": {
    //                                 "result": { "type": "string", "example": "error" },
    //                                 "msg": { "type": "string", "example": "Unauthorized. User is not authenticated." },
    //                                 "data": { "type": "object", "example": {} },
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //             "500": {
    //                 "description": "Internal server error.",
    //                 "content": {
    //                     "application/json": {
    //                         "schema": {
    //                             "type": "object",
    //                             "properties": {
    //                                 "result": { "type": "string", "example": "error" },
    //                                 "msg": { "type": "string", "example": "Internal server error." },
    //                                 "data": { "type": "object", "example": {} },
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //     },
    // },
    "/telegram/delete-single-telegram-image": {
        post: {
            summary: 'Delete a single Telegram post image',
            tags: ['Telegram'],
            description: 'Deletes a single specified image from Telegram posts. Requires user authentication.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                imageUrl: {
                                    type: 'string',
                                    description: 'URL of the image to delete',
                                    example: 'https://example.com/image.jpg',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                "200": {
                    "description": "Image deleted successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Image deleted successfully." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
                "400": {
                    "description": "Bad Request. Invalid image URL provided.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Invalid image URL provided." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
                "401": {
                    "description": "Unauthorized. User is not authenticated.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Unauthorized. User is not authenticated." },
                                    "data": { "type": "object", "example": {} },
                                },
                            },
                        },
                    },
                },
                "500": {
                    "description": "Internal server error.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "Internal server error." },
                                    "data": { "type": "object", "example": {} },
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
    telegramEndpoint,
};
