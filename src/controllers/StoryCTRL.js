// src/controllers/StoryCTRL.js
const Story = require("../models/story_model");
// const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");
const { deleteStoryMedia } = require("../utils/imageUploads/storyUpload");
class StoryCTRL {
  // CREATE A NEW STORY
  async createStory(req, res) {
    console.log("createStory");
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { content } = req.body;
      const media = req.files || []; // Use uploaded media URLs

      // Validate required fields
      if (!content && media.length === 0) {
        return handleResponse(
          res,
          400,
          "error",
          "Content or media is required",
          null,
          0
        );
      }

      // Create a new story
      const newStory = new Story({
        userId: req.user.id,
        content,
        media, // Array of media URLs
      });

      await newStory.save();

      return handleResponse(
        res,
        201,
        "success",
        "Story created successfully",
        newStory,
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Error creating story: " + error.message,
        null,
        0
      );
    }
  }
  // GET ALL STORIES
  async getAllStories(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const stories = await Story.find({ userId: req.user.id })
        .populate("userId", "username fullName avatar")
        .sort({ createdAt: -1 });

      if (stories.length === 0) {
        return handleResponse(res, 404, "info", "No stories found", [], 0);
      }

      return handleResponse(
        res,
        200,
        "success",
        "Stories retrieved successfully",
        stories,
        stories.length
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Error retrieving stories: " + error.message,
        null,
        0
      );
    }
  }
  // GET A SINGLE STORY BY ID
  async getStoryById(req, res) {
    try {
      const { storyId } = req.params;

      const story = await Story.findById(storyId).populate(
        "userId",
        "username fullName avatar"
      );
      if (!story) {
        return handleResponse(res, 404, "error", "Story not found", null, 0);
      }

      // Count total reactions and likes
      const totalReactions = story.reactions.length;
      const totalLikes = story.reactions.filter(
        (reaction) => reaction.emoji === "👍"
      ).length;

      return handleResponse(
        res,
        200,
        "success",
        "Story retrieved successfully",
        { story, totalReactions, totalLikes },
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Error retrieving story: " + error.message,
        null,
        0
      );
    }
  }
  // ADD A COMMENT TO A STORY
  async addComment(req, res) {
    try {
      const { storyId } = req.params;
      const { comment } = req.body;

      if (!req.user || !comment) {
        return handleResponse(
          res,
          400,
          "error",
          "User authentication and comment are required",
          null,
          0
        );
      }

      const story = await Story.findById(storyId);
      if (!story) {
        return handleResponse(res, 404, "error", "Story not found", null, 0);
      }

      story.comments.push({ userId: req.user.id, comment });
      await story.save();

      return handleResponse(
        res,
        200,
        "success",
        "Comment added successfully",
        story,
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Error adding comment: " + error.message,
        null,
        0
      );
    }
  }
  // ADD A REACTION TO A STORY
  async addReaction(req, res) {
    try {
      const { storyId } = req.params;
      const { emoji } = req.body;

      if (!req.user || !emoji) {
        return handleResponse(
          res,
          400,
          "error",
          "User authentication and emoji are required",
          null,
          0
        );
      }

      const story = await Story.findById(storyId);
      if (!story) {
        return handleResponse(res, 404, "error", "Story not found", null, 0);
      }

      // Add the reaction
      story.reactions.push({ userId: req.user.id, emoji });

      // Save the story with the new reaction
      await story.save();

      // Count total reactions and likes (for example: using 👍 as like)
      const totalReactions = story.reactions.length;
      const totalLikes = story.reactions.filter(
        (reaction) => reaction.emoji === "👍"
      ).length;

      return handleResponse(
        res,
        200,
        "success",
        "Reaction added successfully",
        { story, totalReactions, totalLikes },
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Error adding reaction: " + error.message,
        null,
        0
      );
    }
  }
  // DELETE A STORY
  async deleteStory(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { storyId } = req.params;

      const story = await Story.findById(storyId);
      if (!story) {
        return handleResponse(res, 404, "error", "Story not found", null, 0);
      }

      // Ensure the user deleting the story is the owner
      if (story.userId.toString() !== req.user.id) {
        return handleResponse(
          res,
          403,
          "error",
          "You are not allowed to delete this story",
          null,
          0
        );
      }

      // Delete story media files
      if (story.media.length > 0) {
        await deleteStoryMedia(story.media);
      }

      await story.deleteOne({ _id: storyId });

      return handleResponse(
        res,
        200,
        "success",
        "Story deleted successfully",
        story,
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Error deleting story: " + error.message,
        null,
        0
      );
    }
  }
  // UPDATE A STORY
  async updateStory(req, res) {
    try {
      const { storyId } = req.params;
      console.log("storyId: ", storyId);
      console.log("req.body: ", req.body);
      const { content, media } = req.body;
      console.log("content: ", content);
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const story = await Story.findById(storyId);
      if (!story) {
        return handleResponse(res, 404, "error", "Story not found", null, 0);
      }

      // Ensure the user updating the story is the owner
      if (story.userId.toString() !== req.user.id) {
        return handleResponse(
          res,
          403,
          "error",
          "You are not allowed to update this story",
          null,
          0
        );
      }

      // Update story content and media
      if (content) story.content = content;
      if (media && Array.isArray(media)) story.media = media;

      await story.save();

      return handleResponse(
        res,
        200,
        "success",
        "Story updated successfully",
        story,
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Error updating story: " + error.message,
        null,
        0
      );
    }
  }
  // GET ALL STORIES WITH REACTIONS
  async getAllStoriesWithReactions(req, res) {
    try {
      // Find all stories and populate the user and reactions
      const stories = await Story.find()
        .populate("userId", "username fullName avatar")
        .sort({ createdAt: -1 });

      if (stories.length === 0) {
        return handleResponse(res, 404, "info", "No stories found", [], 0);
      }

      // Loop through each story and calculate reactions
      const storiesWithReactions = stories.map((story) => {
        const totalReactions = story.reactions.length;
        const totalLikes = story.reactions.filter(
          (reaction) => reaction.emoji === "👍"
        ).length;

        return {
          story: story, // Story details
          totalReactions, // Total reactions count
          totalLikes, // Total likes count
          reactions: story.reactions, // List of reactions for the story
        };
      });

      return handleResponse(
        res,
        200,
        "success",
        "Stories with reactions retrieved successfully",
        storiesWithReactions,
        storiesWithReactions.length
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Error retrieving stories with reactions: " + error.message,
        null,
        0
      );
    }
  }
  async getStoriesByUserId(req, res) {
    try {
      const { userId } = req.params;

      // Find stories by userId
      const stories = await Story.find({ userId: userId })
        .populate("userId", "username fullName avatar")
        .sort({ createdAt: -1 });

      if (stories.length === 0) {
        return handleResponse(res, 404, "info", "No stories found for this user", [], 0);
      }

      return handleResponse(
        res,
        200,
        "success",
        "Stories retrieved successfully",
        stories,
        stories.length
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Error retrieving stories: " + error.message,
        null,
        0
      );
    }
  }
}

module.exports = new StoryCTRL();
