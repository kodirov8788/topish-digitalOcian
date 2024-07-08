const telegramEndpoint = {
    tags: [
        {
            name: 'Telegram',
            description: 'The Telegram managing API',
        },
    ],
    '/telegram': {
        post: {
            summary: 'Add a new Telegram channel',
            tags: ['Telegram'],
            description: 'Adds a new Telegram channel. Requires user authentication.',
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
                                    example: 'My Channel',
                                },
                                id: {
                                    type: 'string',
                                    description: 'ID of the channel',
                                    example: '@mychannel',
                                },
                                link: {
                                    type: 'string',
                                    format: 'url',
                                    description: 'Link to the channel',
                                    example: 'https://t.me/mychannel',
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
                "201": {
                    "description": "New Telegram channel added successfully.",
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
                                        "example": "Telegram channel added successfully."
                                    },
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
    '/telegram/{channelId}': {
        delete: {
            summary: 'Delete a specific Telegram channel',
            tags: ['Telegram'],
            description: 'Deletes a specific Telegram channel by ID. Requires user authentication.',
            parameters: [
                {
                    name: 'channelId',
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
                    name: 'channelId',
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
};

module.exports = {
    telegramEndpoint,
};
