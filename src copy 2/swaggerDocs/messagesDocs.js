const MessagesEndpoint = {
    tags: [
        {
            name: 'Messages',
            description: 'The messages managing API',
        },
    ],
    '/messages/sendMessage': {
        post: {
            summary: 'Send a message',
            tags: ['Messages'],
            description: 'Sends a message from one user to another, optionally including files.',
            requestBody: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            properties: {
                                text: {
                                    type: 'string',
                                    description: 'Text content of the message.',
                                },
                                recipientId: {
                                    type: 'string',
                                    description: 'ID of the recipient user.',
                                },
                                messageFiles: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                        format: 'binary',
                                    },
                                    description: 'Array of files to attach to the message.',
                                },
                            },
                            required: ['text', 'recipientId'],
                        },
                    },
                },
            },
            responses: {
                '201': {
                    description: 'Message sent successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Message sent successfully' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            message: {
                                                type: 'object',
                                                properties: {
                                                    text: { type: 'string', example: 'Hello, World!' },
                                                    senderId: { type: 'string', example: 'sender123' },
                                                    recipientId: { type: 'string', example: 'recipient456' },
                                                    chatRoom: { type: 'string', example: 'chatRoom789' },
                                                    fileUrls: {
                                                        type: 'array',
                                                        items: { type: 'string' },
                                                        example: ['https://example.com/file1.jpg', 'https://example.com/file2.jpg'],
                                                    },
                                                },
                                            },
                                        },
                                        example: {
                                            message: {
                                                text: 'Hello, World!',
                                                senderId: 'sender123',
                                                recipientId: 'recipient456',
                                                chatRoom: 'chatRoom789',
                                                fileUrls: ['https://example.com/file1.jpg', 'https://example.com/file2.jpg'],
                                            },
                                        },
                                    },
                                    totalCount: { type: 'integer', example: 1 },
                                },
                            },
                        },
                    },
                },
                "401": {
                    "description": "Unauthorized access, no or invalid authentication token provided.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Unauthorized access, no or invalid authentication token provided." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "404": {
                    "description": "Chat room not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Chat room not found." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "500": {
                    "description": "Internal server error or exception thrown.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Something went wrong." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                }
            },
        },
    },
    '/messages/{chatRoomId}': {
        get: {
            summary: 'Get a chat room by ID',
            tags: ['Messages'],
            description: 'Endpoint for retrieving a chat room by ID along with its message history. Requires authentication.',
            parameters: [
                {
                    in: 'path',
                    name: 'chatRoomId',
                    required: true,
                    schema: {
                        type: 'string',
                    },
                    description: 'The unique identifier of the chat room.',
                }
            ],
            responses: {
                "200": {
                    "description": "Chat room and message history retrieved successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Chat room and message history retrieved successfully." },
                                    "data": {
                                        "chatRoom": {
                                            "$ref": "#/components/schemas/ChatRoom"
                                        },
                                        "messageHistory": {
                                            "type": "array",
                                            "items": {
                                                "$ref": "#/components/schemas/Message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "401": {
                    "description": "Unauthorized access, no or invalid authentication token provided.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Unauthorized access, no or invalid authentication token provided." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "404": {
                    "description": "Chat room not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Chat room not found." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "500": {
                    "description": "Internal server error or exception thrown.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Something went wrong." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                }
            }
        },

        delete: {
            summary: 'Delete a chat room',
            tags: ['Messages'],
            description: 'Endpoint for deleting a chat room by ID. Requires authentication. Also marks all messages within the chat room as deleted.',
            parameters: [
                {
                    in: 'path',
                    name: 'chatRoomId',
                    required: true,
                    schema: {
                        type: 'string',
                    },
                    description: 'The unique identifier of the chat room to be deleted.',
                }
            ],
            responses: {
                "200": {
                    "description": "Chat room deleted successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Chat room deleted successfully." },
                                    "data": { "type": "null" },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "401": {
                    "description": "Unauthorized access, no or invalid authentication token provided.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Unauthorized access, no or invalid authentication token provided." },
                                    "data": { "type": "null" },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "404": {
                    "description": "Chat room not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Chat room not found." },
                                    "data": { "type": "null" },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "500": {
                    "description": "Internal server error or exception thrown.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Something went wrong." },
                                    "data": { "type": "null" },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/messages/allmessages': {
        get: {
            summary: 'Get a chat room by ID',
            tags: ['Messages'],
            description: 'Endpoint for retrieving a chat room by ID along with its message history. Requires authentication.',
            responses: {
                "200": {
                    "description": "Chat room and message history retrieved successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Chat room and message history retrieved successfully." },
                                    "data": {
                                        "chatRoom": {
                                            "$ref": "#/components/schemas/ChatRoom"
                                        },
                                        "messageHistory": {
                                            "type": "array",
                                            "items": {
                                                "$ref": "#/components/schemas/Message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "401": {
                    "description": "Unauthorized access, no or invalid authentication token provided.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Unauthorized access, no or invalid authentication token provided." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "404": {
                    "description": "Chat room not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Chat room not found." },
                                    "data": { "type": "null" },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "500": {
                    "description": "Internal server error or exception thrown.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Something went wrong." },
                                    "data": { "type": "null" },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                }
            }
        },

    },
    '/messages/allmessagesTest': {
        get: {
            summary: 'Get a chat room by ID',
            tags: ['Messages'],
            description: 'Endpoint for retrieving a chat room by ID along with its message history. Requires authentication.',
            responses: {
                "200": {
                    "description": "Chat room and message history retrieved successfully.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Chat room and message history retrieved successfully." },
                                    "data": {
                                        "chatRoom": {
                                            "$ref": "#/components/schemas/ChatRoom"
                                        },
                                        "messageHistory": {
                                            "type": "array",
                                            "items": {
                                                "$ref": "#/components/schemas/Message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "401": {
                    "description": "Unauthorized access, no or invalid authentication token provided.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Unauthorized access, no or invalid authentication token provided." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "404": {
                    "description": "Chat room not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Chat room not found." },
                                    "data": { "type": "null" },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "500": {
                    "description": "Internal server error or exception thrown.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Something went wrong." },
                                    "data": { "type": "null" },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                }
            }
        },

    },
    '/messages/message/{messageId}': {
        delete: {
            tags: ['Messages'],
            summary: 'Deletes a specific message by its ID',
            description: 'Allows users to delete a message if they are the sender. Admins and moderators could be given permission as well.',
            parameters: [
                {
                    in: 'path',
                    name: 'messageId',
                    required: true,
                    schema: {
                        type: 'string'
                    },
                    description: 'The unique identifier of the message to be deleted'
                },
            ],
            responses: {
                '200': {
                    description: 'Message deleted successfully',
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
                                        example: 'Message deleted successfully'
                                    },
                                    data: {
                                        type: 'null',
                                        example: null
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    },
                                    pagination: {
                                        type: 'null',
                                        example: null
                                    }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized access',
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
                                        type: 'null',
                                        example: null
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    },
                                    pagination: {
                                        type: 'null',
                                        example: null
                                    }
                                }
                            }
                        }
                    }
                },
                '403': {
                    description: 'Forbidden - User not authorized to delete this message',
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
                                        example: 'You are not authorized to delete this message'
                                    },
                                    data: {
                                        type: 'null',
                                        example: null
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    },
                                    pagination: {
                                        type: 'null',
                                        example: null
                                    }
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'Message not found',
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
                                        example: 'Message not found'
                                    },
                                    data: {
                                        type: 'null',
                                        example: null
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    },
                                    pagination: {
                                        type: 'null',
                                        example: null
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
                                        type: 'null',
                                        example: null
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    },
                                    pagination: {
                                        type: 'null',
                                        example: null
                                    }
                                }
                            }
                        }
                    }
                }
            },
            security: [
                {
                    BearerAuth: []
                }
            ]
        },
        patch: {
            summary: 'Update a message',
            description: 'Updates the text of an existing message.',
            tags: ['Messages'],
            parameters: [
                {
                    name: 'messageId',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                    },
                    description: 'The ID of the message to update',
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                newText: {
                                    type: 'string',
                                    description: 'The new text for the message.',
                                },
                            },
                            required: ['newText'],
                        },
                    },
                },
            },
            responses: {
                '200': {
                    description: 'Message updated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Message updated successfully' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            message: {
                                                type: 'object',
                                                // Example of message object properties, adjust as needed
                                                properties: {
                                                    messageId: { type: 'string', example: '12345' },
                                                    newText: { type: 'string', example: 'Updated message text' },
                                                },
                                            },
                                        },
                                        example: { messageId: '12345', newText: 'Updated message text' },
                                    },
                                    totalCount: { type: 'integer', example: 1 },
                                },
                            },
                        },
                    },
                },
                '401': {
                    description: 'Unauthorized access',
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
                                        type: 'null',
                                        example: null
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    },
                                    pagination: {
                                        type: 'null',
                                        example: null
                                    }
                                }
                            }
                        }
                    }
                },
                '403': {
                    description: 'Forbidden - User not authorized to delete this message',
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
                                        example: 'You are not authorized to delete this message'
                                    },
                                    data: {
                                        type: 'null',
                                        example: null
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    },
                                    pagination: {
                                        type: 'null',
                                        example: null
                                    }
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'Message not found',
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
                                        example: 'Message not found'
                                    },
                                    data: {
                                        type: 'null',
                                        example: null
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    },
                                    pagination: {
                                        type: 'null',
                                        example: null
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
                                        type: 'null',
                                        example: null
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    },
                                    pagination: {
                                        type: 'null',
                                        example: null
                                    }
                                }
                            }
                        }
                    }
                }
            },
        },
    },
    '/messages/deleteFiles/{messageId}': {
        delete: {
            summary: 'Delete files associated with a message',
            description: 'Deletes multiple files associated with a message by message ID and file keys',
            tags: ['Messages'],
            parameters: [{
                name: 'messageId',
                in: 'path',
                required: true,
                description: 'The ID of the message whose files are to be deleted',
                schema: {
                    type: 'string',
                },
            }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                fileKeys: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                    },
                                    description: 'An array of file keys to be deleted',
                                },
                            },
                        },
                    },
                },
            },
            '200': {
                description: 'Message deleted successfully',
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
                                    example: 'Message deleted successfully'
                                },
                                data: {
                                    type: 'null',
                                    example: null
                                },
                                totalCount: {
                                    type: 'integer',
                                    example: 0
                                },
                                pagination: {
                                    type: 'null',
                                    example: null
                                }
                            }
                        }
                    }
                }
            },
            '401': {
                description: 'Unauthorized access',
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
                                    type: 'null',
                                    example: null
                                },
                                totalCount: {
                                    type: 'integer',
                                    example: 0
                                },
                                pagination: {
                                    type: 'null',
                                    example: null
                                }
                            }
                        }
                    }
                }
            },
            '403': {
                description: 'Forbidden - User not authorized to delete this message',
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
                                    example: 'You are not authorized to delete this message'
                                },
                                data: {
                                    type: 'null',
                                    example: null
                                },
                                totalCount: {
                                    type: 'integer',
                                    example: 0
                                },
                                pagination: {
                                    type: 'null',
                                    example: null
                                }
                            }
                        }
                    }
                }
            },
            '404': {
                description: 'Message not found',
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
                                    example: 'Message not found'
                                },
                                data: {
                                    type: 'null',
                                    example: null
                                },
                                totalCount: {
                                    type: 'integer',
                                    example: 0
                                },
                                pagination: {
                                    type: 'null',
                                    example: null
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
                                    type: 'null',
                                    example: null
                                },
                                totalCount: {
                                    type: 'integer',
                                    example: 0
                                },
                                pagination: {
                                    type: 'null',
                                    example: null
                                }
                            }
                        }
                    }
                }
            }
        },



    },

    '/messages/typing/{chatRoomId}': {
        get: {
            summary: 'Update a typing status for a message',
            description: 'Updates the text of an existing message.',
            tags: ['Messages'],
            parameters: [
                {
                    in: 'path',
                    name: 'chatRoomId',
                    required: true,
                    schema: {
                        type: 'string',
                    },
                    description: 'The unique identifier of the chat room.',
                }
            ],
            responses: {
                '200': {
                    description: 'Message updated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    result: { type: 'string', example: 'success' },
                                    msg: { type: 'string', example: 'Message updated successfully' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            message: {
                                                type: 'object',
                                                // Example of message object properties, adjust as needed
                                                properties: {
                                                    messageId: { type: 'string', example: '12345' },
                                                    newText: { type: 'string', example: 'Updated message text' },
                                                },
                                            },
                                        },
                                        example: { messageId: '12345', newText: 'Updated message text' },
                                    },
                                    totalCount: { type: 'integer', example: 1 },
                                },
                            },
                        },
                    },
                },
                '401': {
                    description: 'Unauthorized access',
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
                                        type: 'null',
                                        example: null
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    },
                                    pagination: {
                                        type: 'null',
                                        example: null
                                    }
                                }
                            }
                        }
                    }
                },
                '403': {
                    description: 'Forbidden - User not authorized to delete this message',
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
                                        example: 'You are not authorized to delete this message'
                                    },
                                    data: {
                                        type: 'null',
                                        example: null
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    },
                                    pagination: {
                                        type: 'null',
                                        example: null
                                    }
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'Message not found',
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
                                        example: 'Message not found'
                                    },
                                    data: {
                                        type: 'null',
                                        example: null
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    },
                                    pagination: {
                                        type: 'null',
                                        example: null
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
                                        type: 'null',
                                        example: null
                                    },
                                    totalCount: {
                                        type: 'integer',
                                        example: 0
                                    },
                                    pagination: {
                                        type: 'null',
                                        example: null
                                    }
                                }
                            }
                        }
                    }
                }
            },
        },
    },
}

module.exports = {
    MessagesEndpoint
}




