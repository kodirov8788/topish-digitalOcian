// src/models/discover_model.js
const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
    {
        country: { type: String, required: true }, // Country name or code
        img: { type: String, required: false }, // URL of the location image
    },
    { _id: false }
);

const discoverSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Title in one language
    description: { type: String, required: true }, // Description in one language
    tags: [
        { type: mongoose.Schema.Types.ObjectId, ref: "DiscoverTag", required: false },
    ], // Reference to DiscoverTag
    img: { type: String, required: true }, // Main image URL
    location: { type: locationSchema, required: false }, // Location details (country and optional image)
    countryCode: { type: String, required: true }, // Country code
    language: { type: String, required: true }, // Language code for the title and description
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User
    createdAt: { type: Date, default: Date.now }, // Timestamp for creation
});

module.exports = mongoose.model("Discover", discoverSchema);
