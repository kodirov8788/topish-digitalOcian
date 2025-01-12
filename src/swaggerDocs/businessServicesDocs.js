const BusinessServicesEndpoint = {
    tags: [
        {
            name: "BusinessServices",
            description: "The Business Services managing API",
        },
    ],
    "/business-services/": {
        post: {
            summary: "Create a new business service",
            tags: ["BusinessServices"],
            description:
                "Allows an authenticated user to create a new business service for a specific company with title, subtitle, tags, and optional price and duration.",
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
                                company_id: {
                                    type: "string",
                                    description: "The ID of the company for which the service is being created.",
                                },
                                tagIds: {
                                    type: "array",
                                    items: { type: "string" },
                                    description: "Array of tag IDs referencing BusinessServiceTags.",
                                },
                                title: {
                                    type: "string",
                                    description: "Title of the business service.",
                                },
                                subTitle: {
                                    type: "string",
                                    description: "Subtitle of the business service.",
                                },
                                description: {
                                    type: "string",
                                    description: "Detailed description of the business service.",
                                },
                                price: {
                                    type: "number",
                                    description: "Optional price of the service.",
                                    default: 0,
                                },
                                duration: {
                                    type: "string",
                                    description: "Optional duration of the service (e.g., '2 hours').",
                                    default: "",
                                },
                                status: {
                                    type: "string",
                                    description: "Status of the service (active/inactive).",
                                    enum: ["active", "inactive"],
                                    default: "active",
                                },
                            },
                            required: ["company_id", "title", "description", "tagIds"],
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: "Business service created successfully.",
                },
                400: {
                    description: "Invalid request payload or validation error.",
                },
                401: {
                    description: "Unauthorized - User not logged in.",
                },
            },
        },
        get: {
            summary: "Retrieve all business services (global list)",
            tags: ["BusinessServices"],
            description: "Fetches a global list of all business services with optional pagination and sorting.",
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
                {
                    name: "sort",
                    in: "query",
                    required: false,
                    description: "Sort order for items. Default is '-createdAt'.",
                    schema: {
                        type: "string",
                        example: "-createdAt",
                    },
                },
            ],
            responses: {
                200: {
                    description: "List of business services retrieved successfully.",
                },
                500: {
                    description: "Internal Server Error.",
                },
            },
        },
    },
    "/business-services/search": {
        get: {
            summary: "Search for business services by tag",
            tags: ["BusinessServices"],
            description: "Searches for business services by a tag.",
            parameters: [
                {
                    name: "tag",
                    in: "query",
                    required: true,
                    description: "Tag to search for.",
                    schema: {
                        type: "string",
                    },
                },
            ],
            responses: {
                200: {
                    description: "Search results fetched successfully.",
                },
                400: {
                    description: "Invalid search parameters.",
                },
                404: {
                    description: "No matching results found.",
                },
            },
        },
    },
    "/business-services/{company_id}": {
        get: {
            summary: "Retrieve all business services for a company",
            tags: ["BusinessServices"],
            description: "Fetches a list of all business services for a specific company.",
            parameters: [
                {
                    name: "company_id",
                    in: "path",
                    required: true,
                    description: "ID of the company whose services are to be retrieved.",
                    schema: {
                        type: "string",
                    },
                },
            ],
            responses: {
                200: {
                    description: "List of business services retrieved successfully.",
                },
                404: {
                    description: "No business services found for this company.",
                },
            },
        },
    },
    "/business-services/service/{id}": {
        get: {
            summary: "Retrieve a specific business service by ID",
            tags: ["BusinessServices"],
            description: "Fetches a single business service using its ID.",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID of the business service to retrieve.",
                    schema: {
                        type: "string",
                    },
                },
            ],
            responses: {
                200: {
                    description: "Business service retrieved successfully.",
                },
                404: {
                    description: "Business service not found.",
                },
            },
        },
        put: {
            summary: "Update a business service",
            tags: ["BusinessServices"],
            description: "Updates a specific business service by its ID.",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID of the business service to update.",
                    schema: {
                        type: "string",
                    },
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                subTitle: { type: "string" },
                                description: { type: "string" },
                                price: { type: "number" },
                                duration: { type: "string" },
                                status: {
                                    type: "string",
                                    enum: ["active", "inactive"],
                                },
                                tagIds: {
                                    type: "array",
                                    items: { type: "string" },
                                },
                            },
                            required: ["title", "description"],
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Business service updated successfully.",
                },
            },
        },
        delete: {
            summary: "Delete a business service",
            tags: ["BusinessServices"],
            description: "Deletes a specific business service by its ID.",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID of the business service to delete.",
                    schema: {
                        type: "string",
                    },
                },
            ],
            responses: {
                200: {
                    description: "Business service deleted successfully.",
                },
            },
        },
    },
};

module.exports = {
    BusinessServicesEndpoint,
};
