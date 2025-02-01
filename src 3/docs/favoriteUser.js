// src/docs/favoriteUser.js 
const FavoriteUser = {
    tags: [
        {
            name: 'FavoriteUser',
            description: 'The FavoriteUser managing API',
        },
    ],

    '/users/favorites/{favoriteId}': {
        post: {
            summary: 'Add a user to favorites',
            tags: ['FavoriteUser'],
            description: 'Endpoint to add a user to the current authenticated user\'s favorites. Requires authentication.',
            parameters: [
                {
                    in: 'path',
                    name: 'favoriteId',
                    required: true,
                    schema: {
                        type: 'string',
                    },
                    description: 'The unique identifier of the user to be added to favorites.',
                },
            ],
            responses: {
                "200": {
                    "description": "User successfully added to favorites.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "User successfully added to favorites." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "400": {
                    "description": "User already in favorites or other client error.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "User already in favorites." },
                                    "data": { "type": "null", "example": null },
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
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "404": {
                    "description": "User not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "User not found." },
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
                                    "msg": { "type": "string", "example": "An error occurred while adding the user to favorites." },
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
    '/users/getAllMyFavorites': {
        get: {
            summary: 'Get all favorite users',
            tags: ['FavoriteUser'],
            description: 'Endpoint to retrieve all users from the current authenticated user\'s favorites. Requires authentication.',
            parameters: [
            ],
            responses: {
                "200": {
                    "description": "Favorite users successfully retrieved.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "Favorite users successfully retrieved." },
                                    "data": {
                                        "type": "array",
                                        "items": {
                                            "$ref": "#/components/schemas/UserResponse"
                                        }
                                    },
                                    "totalCount": {
                                        "type": "integer",
                                        "example": 0 // Adjust based on actual data or consider omitting if not applicable
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
                                    "msg": { "type": "string", "example": "Unauthorized! Missing user ID." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "404": {
                    "description": "No favorite users found or user not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "Your favorites list is empty or user not found." },
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
                                    "msg": { "type": "string", "example": "An error occurred while retrieving favorite users." },
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

    // '/users/getMyFavorites/{id}': {
    //     get: {
    //         summary: 'Get favorite users of the current user',
    //         tags: ['FavoriteUser'],
    //         description: 'Endpoint to retrieve the favorite users of the current authenticated user. Requires authentication.',
    //         parameters: [
    //             {
    //                 in: 'path',
    //                 name: 'id',
    //                 required: true,
    //                 schema: {
    //                     type: 'string',
    //                 },
    //                 description: 'The unique identifier of the current user.',
    //             }
    //         ],
    //         responses: {
    //             "200": {
    //                 "description": "A list of favorite users or a message if the list is empty.",
    //                 "content": {
    //                     "application/json": {
    //                         "schema": {
    //                             "type": "object",
    //                             "properties": {
    //                                 "result": { "type": "string", "example": "success" },
    //                                 "msg": { "type": "string", "example": "Favorite users retrieved successfully." },
    //                                 "data": {
    //                                     "type": "array",
    //                                     "items": {
    //                                         "$ref": "#/components/schemas/UserResponse"
    //                                     }
    //                                 },
    //                                 "totalCount": {
    //                                     "type": "integer",
    //                                     "example": 0 // Use actual count of favorite users or omit if not applicable.
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 }
    //             },
    //             "400": {
    //                 "description": "The favorite users basket is empty.",
    //                 "content": {
    //                     "application/json": {
    //                         "schema": {
    //                             "type": "object",
    //                             "properties": {
    //                                 "result": { "type": "string", "example": "error" },
    //                                 "msg": { "type": "string", "example": "Your favorite users basket is empty." },
    //                                 "data": { "type": "null", "example": null },
    //                                 "totalCount": { "type": "integer", "example": 0 }
    //                             }
    //                         }
    //                     }
    //                 }
    //             },
    //             "401": {
    //                 "description": "Unauthorized access, no or invalid authentication token provided.",
    //                 "content": {
    //                     "application/json": {
    //                         "schema": {
    //                             "type": "object",
    //                             "properties": {
    //                                 "result": { "type": "string", "example": "failure" },
    //                                 "msg": { "type": "string", "example": "Unauthorized access, no or invalid authentication token provided." },
    //                                 "data": { "type": "null", "example": null },
    //                                 "totalCount": { "type": "integer", "example": 0 }
    //                             }
    //                         }
    //                     }
    //                 }
    //             },
    //             "500": {
    //                 "description": "Internal server error or exception thrown.",
    //                 "content": {
    //                     "application/json": {
    //                         "schema": {
    //                             "type": "object",
    //                             "properties": {
    //                                 "result": { "type": "string", "example": "failure" },
    //                                 "msg": { "type": "string", "example": "Server error encountered." },
    //                                 "data": { "type": "null", "example": null },
    //                                 "totalCount": { "type": "integer", "example": 0 }
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // },
    '/users/removeFromFavorite/{favoriteId}': {
        delete: {
            summary: 'Remove a user from favorites',
            tags: ['FavoriteUser'],
            description: 'Endpoint to remove a user from the current authenticated user\'s favorites. Requires authentication.',
            parameters: [
                {
                    in: 'path',
                    name: 'favoriteId',
                    required: true,
                    schema: {
                        type: 'string',
                    },
                    description: 'The unique identifier of the user to be removed from favorites.',
                }
            ],
            responses: {
                "200": {
                    "description": "User successfully removed from favorites.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "success" },
                                    "msg": { "type": "string", "example": "User removed from favorites successfully." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "400": {
                    "description": "User not found in favorites or other client error.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "error" },
                                    "msg": { "type": "string", "example": "User not found in favorites." },
                                    "data": { "type": "null", "example": null },
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
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                },
                "404": {
                    "description": "User not found.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "result": { "type": "string", "example": "failure" },
                                    "msg": { "type": "string", "example": "User not found." },
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
                                    "msg": { "type": "string", "example": "Internal server error or exception thrown." },
                                    "data": { "type": "null", "example": null },
                                    "totalCount": { "type": "integer", "example": 0 }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

module.exports = {
    FavoriteUser
};


