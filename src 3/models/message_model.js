// src/models/message_model.js
const mongoose = require("mongoose");

// Define the schema for reply messages
const replyToSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  text: { type: String, default: "" },
  senderId: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    avatar: { type: String, default: "" },
    fullName: { type: String, default: "" },
  },
  recipientId: {
    type: mongoose.Schema.Types.Mixed,
    ref: "Users",
    default: null,
  },
  deleted: { type: Boolean, default: false },
  fileUrls: { type: Array, default: [] },
}, { _id: false }); // Setting _id to false to avoid creating an extra _id field

// Define the main message schema
const messageSchema = new mongoose.Schema({
  text: { type: String, default: "" },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  recipientId: {
    type: mongoose.Schema.Types.Mixed, // Allows for both ObjectId and other data types
    ref: "Users", // This ref is used only when the type is ObjectId
    default: null,
  },
  deleted: { type: Boolean, default: false },
  seen: { type: Boolean, default: false }, // 'seen' field
  chatRoom: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom" },
  timestamp: { type: Date, default: Date.now },
  fileUrls: { type: Array, default: [] },
  replyTo: { type: replyToSchema, default: null }, // Use the replyToSchema
});

module.exports = mongoose.model("Message", messageSchema);
