const {
    createTag,
    getAllTags,
    getTagById,
    updateTag,
    deleteTag,
    searchTags,
} = require("../controllers/businessServicesTagsCTRL");
const authMiddleware = require("../middleware/auth-middleware");
const router = require("express").Router();

// Get all tags
router.route("/").get(getAllTags);

// Search for tags
router.route("/search").get(searchTags);

// Create a new tag
router.route("/").post(authMiddleware, createTag);

// Get a single tag by ID
router.route("/:id").get(getTagById);

// Update a tag by ID
router.route("/:id").put(authMiddleware, updateTag);

// Delete a tag by ID
router.route("/:id").delete(authMiddleware, deleteTag);

module.exports = router;
