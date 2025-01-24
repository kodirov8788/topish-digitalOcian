// src/models/story_model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define a schema for the comments
const commentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Define a schema for the emoji reactions
const reactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  emoji: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

// Define a schema for multimedia content (images or videos)
const mediaSchema = new Schema({
  url: { type: String, required: true }, // URL or path to the media file
  name: { type: String, required: false }, // Optional: name of the file
  type: {
    type: String,
    enum: ["image", "video"], // Specify the type of media
    required: true,
  },
  format: { type: String, required: false }, // Optional: file format, e.g., 'jpg', 'mp4'
  size: { type: Number, required: false }, // Optional: size of the file in bytes
  duration: { type: Number, required: false }, // Optional: duration for videos in seconds
  createdAt: { type: Date, default: Date.now },
});

// Define a schema for stories
const storySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  content: { type: String, required: false }, // Optional: text content of the story
  createdAt: { type: Date, default: Date.now },
  comments: [commentSchema], // Comments on the story
  reactions: [reactionSchema], // Emoji reactions on the story
  media: [mediaSchema], // Multimedia content associated with the story
});

// Create and export the Story model
const Story = mongoose.model("Story", storySchema);
module.exports = Story;
