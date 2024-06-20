const mongoose = require("mongoose");

const TournamentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        location: { type: String, required: true },
        date: { type: Date, required: true },
        participants: { type: [String], required: false, default: [] },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Tournament", TournamentSchema);
