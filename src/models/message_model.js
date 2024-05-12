const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  text: { type: String, default: "" },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  recipientId: {
    type: mongoose.Schema.Types.Mixed, // Allows for both ObjectId and other data types
    ref: "Users", // This ref is used only when the type is ObjectId
    default: null,
  },
  deleted: { type: Boolean, default: false },
  seen: { type: Boolean, default: false }, // Add a 'seen' field
  chatRoom: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom" },
  timestamp: { type: Date, default: Date.now },
  fileUrls: { type: Array, default: [] },
});

module.exports = mongoose.model("Message", messageSchema);
