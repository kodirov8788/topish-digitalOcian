const {
    createDiscover,
    getAllDiscovers,
    getDiscoverById,
    updateDiscover,
    deleteDiscover,
    searchDiscovers,
} = require("../controllers/discoverCTRL");
const authMiddleware = require("../middleware/auth-middleware");
const router = require("express").Router();
const { uploadFiles } = require("../utils/imageUploads/discoverImageUpload");

// Retrieve all discover entries with optional pagination
router.get("/", getAllDiscovers);

// Search for discover entries based on query, tags, or location
router.get("/search", searchDiscovers);

// Create a new discover entry (requires authentication and file uploads)
router.post("/", authMiddleware, uploadFiles, createDiscover);

// Retrieve a single discover entry by its ID
router.get("/:id", getDiscoverById);

// Update a discover entry by its ID (requires authentication and file uploads)
router.put("/:id", authMiddleware, uploadFiles, updateDiscover);

// Delete a discover entry by its ID (requires authentication)
router.delete("/:id", authMiddleware, deleteDiscover);

module.exports = router;
