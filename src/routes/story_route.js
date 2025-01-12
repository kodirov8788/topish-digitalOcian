// routes/storyRoutes.js

const express = require("express");
const router = express.Router();
const storyController = require("../controllers/StoryCTRL");
const authMiddleware = require("../middleware/auth-middleware");
const { uploadStoryMedia } = require("../utils/imageUploads/storyUpload");

// Create a new story
router.post("/", authMiddleware, uploadStoryMedia, storyController.createStory);

// Get all stories
router.get("/", authMiddleware, storyController.getAllStories);
router.get(
  "/getAllReactions",
  authMiddleware,
  storyController.getAllStoriesWithReactions
);
// Get a single story by ID
router.get("/:storyId", authMiddleware, storyController.getStoryById);
// Get stories by user ID
router.get("/user/:userId", authMiddleware, storyController.getStoriesByUserId);
// Add a comment to a story
router.post("/:storyId/comments", authMiddleware, storyController.addComment);
// Add a reaction to a story
router.post("/:storyId/reactions", authMiddleware, storyController.addReaction);
// Update a story
router.patch("/:storyId", authMiddleware, storyController.updateStory);
// Delete a story
router.delete("/:storyId", authMiddleware, storyController.deleteStory);

module.exports = router;
