const Business_servicesTagsEndpoint = {
    tags: [
        {
            name: "BusinessServicesTags",
            description: "The Discover Tags managing API",
        },
    ],
    "/business-servicesTags/": {
        post: {
            summary: "Create a new tag",
            tags: ["BusinessServicesTags"],
            description:
                "Allows an authenticated user to create a new tag for discover items with multilingual support.",
            security: [
                {
                    bearerAuth: [],
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                keyText: {
                                    type: "object",
                                    description:
                                        "Tag translations in multiple languages, where keys are language codes.",
                                    additionalProperties: {
                                        type: "string",
                                        description:
                                            "Translation of the tag in the specified language.",
                                    },
                                },
                                countryCode: {
                                    type: "string",
                                    description: "The country code associated with the tag.",
                                },
                                languages: {
                                    type: "array",
                                    items: {
                                        type: "string",
                                    },
                                    description: "List of language codes used in the translations.",
                                },
                            },
                            required: ["keyText", "countryCode", "languages"],
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: "Tag created successfully.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "success" },
                                    msg: { type: "string", example: "Tag created successfully." },
                                    data: {
                                        type: "object",
                                        properties: {
                                            id: { type: "string" },
                                            keyText: {
                                                type: "object",
                                                additionalProperties: { type: "string" },
                                            },
                                            countryCode: { type: "string" },
                                            languages: {
                                                type: "array",
                                                items: { type: "string" },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                400: {
                    description: "Validation Error.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "error" },
                                    msg: { type: "string", example: "Validation error." },
                                },
                            },
                        },
                    },
                },
            },
        },
        get: {
            summary: "Retrieve all tags",
            tags: ["BusinessServicesTags"],
            description: "Fetches a list of all tags with optional pagination.",
            parameters: [
                {
                    name: "page",
                    in: "query",
                    required: false,
                    description: "Page number for pagination.",
                    schema: {
                        type: "integer",
                        default: 1,
                    },
                },
                {
                    name: "limit",
                    in: "query",
                    required: false,
                    description: "Number of items to return per page.",
                    schema: {
                        type: "integer",
                        default: 10,
                    },
                },
            ],
            responses: {
                200: {
                    description: "Tags fetched successfully.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "success" },
                                    msg: { type: "string", example: "Tags retrieved successfully." },
                                    data: {
                                        type: "object",
                                        properties: {
                                            tags: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        id: { type: "string" },
                                                        keyText: {
                                                            type: "object",
                                                            additionalProperties: { type: "string" },
                                                        },
                                                        countryCode: { type: "string" },
                                                        languages: {
                                                            type: "array",
                                                            items: { type: "string" },
                                                        },
                                                    },
                                                },
                                            },
                                            totalCount: { type: "integer", example: 20 },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                500: {
                    description: "Internal Server Error.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "error" },
                                    msg: { type: "string", example: "Something went wrong." },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    "/business-servicesTags/{id}": {
        get: {
            summary: "Retrieve a specific tag",
            tags: ["BusinessServicesTags"],
            description: "Fetches a tag by its ID.",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID of the tag to retrieve.",
                    schema: {
                        type: "string",
                    },
                },
            ],
            responses: {
                200: {
                    description: "Tag retrieved successfully.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "success" },
                                    msg: { type: "string", example: "Tag retrieved successfully." },
                                    data: {
                                        type: "object",
                                        properties: {
                                            id: { type: "string" },
                                            keyText: {
                                                type: "object",
                                                additionalProperties: { type: "string" },
                                            },
                                            countryCode: { type: "string" },
                                            languages: {
                                                type: "array",
                                                items: { type: "string" },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                404: {
                    description: "Tag not found.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "error" },
                                    msg: { type: "string", example: "Tag not found." },
                                },
                            },
                        },
                    },
                },
            },
        },
        put: {
            summary: "Update a tag",
            tags: ["BusinessServicesTags"],
            description: "Allows updating a tag's details.",
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID of the tag to update.",
                    schema: { type: "string" },
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                keyText: {
                                    type: "object",
                                    description:
                                        "Updated tag translations in multiple languages, where keys are language codes.",
                                    additionalProperties: { type: "string" },
                                },
                                countryCode: { type: "string" },
                                languages: {
                                    type: "array",
                                    items: { type: "string" },
                                    description: "Updated list of language codes.",
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Tag updated successfully.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "success" },
                                    msg: { type: "string", example: "Tag updated successfully." },
                                    data: {
                                        type: "object",
                                        properties: {
                                            id: { type: "string" },
                                            keyText: {
                                                type: "object",
                                                additionalProperties: { type: "string" },
                                            },
                                            countryCode: { type: "string" },
                                            languages: {
                                                type: "array",
                                                items: { type: "string" },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                400: {
                    description: "Validation Error.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "error" },
                                    msg: { type: "string", example: "Validation error." },
                                },
                            },
                        },
                    },
                },
            },
        },
        delete: {
            summary: "Delete a tag",
            tags: ["BusinessServicesTags"],
            description: "Deletes a tag by its ID.",
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID of the tag to delete.",
                    schema: { type: "string" },
                },
            ],
            responses: {
                200: {
                    description: "Tag deleted successfully.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "success" },
                                    msg: { type: "string", example: "Tag deleted successfully." },
                                },
                            },
                        },
                    },
                },
                404: {
                    description: "Tag not found.",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    result: { type: "string", example: "error" },
                                    msg: { type: "string", example: "Tag not found." },
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
    Business_servicesTagsEndpoint,
};
