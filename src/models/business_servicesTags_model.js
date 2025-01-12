const mongoose = require("mongoose");

const localizedStringSchema = new mongoose.Schema(
    {
        translations: {
            type: Map,
            of: String,
            required: true,
        },
    },
    { _id: false } // Disable the `_id` field for embedded documents
);

const business_servicesTagsSchema = new mongoose.Schema({
    keyText: [{ type: localizedStringSchema, required: false }], // Array of localized strings for tags
    countryCode: { type: String, required: true }, // Country code for tagging
    languages: { type: [String], required: true }, // List of associated languages
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User model
    createdAt: { type: Date, default: Date.now }, // Auto-populate with current date/time
});

// Export the Mongoose model for the schema
module.exports = mongoose.model("Business_servicesTags", business_servicesTagsSchema);
