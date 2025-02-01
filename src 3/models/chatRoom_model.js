// src/models/chatRoom_model.js
const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
  createdAt: { type: Date, default: Date.now },
  isForAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
