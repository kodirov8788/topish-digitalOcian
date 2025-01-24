// src/models/discoverTags_model.js
const mongoose = require("mongoose");


const discoverTagsSchema = new mongoose.Schema({
    keyText: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User model
    createdAt: { type: Date, default: Date.now }, // Auto-populate with current date/time
});

// Export the Mongoose model for the schema
module.exports = mongoose.model("DiscoverTag", discoverTagsSchema);
