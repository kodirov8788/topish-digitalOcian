// src/models/tournament_model.js
const mongoose = require("mongoose");

const ParticipantSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        playerId: { type: String, required: true },
        specialCode: { type: String, required: true },
    },
    { _id: false } // Prevent Mongoose from creating an _id for each participant
);

const TournamentSchema = new mongoose.Schema(
    {
        tournament_id: { type: String, unique: true, required: true },
        tournament_name: { type: String, required: true },
        date_range: { type: String, required: true },
        location: { type: String, required: true },
        prize_pool: { type: String, default: "0" },
        organizer: { type: String, required: true },
        game: { type: String, default: "" },
        platform: { type: String, default: "" },
        description: { type: String },
        image: { type: String },
        type: { type: String, required: true },
        participants: { type: [ParticipantSchema], default: [] },
        status: {
            type: String,
            enum: ["open", "closed", "expired", "coming"],
            default: "open",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Tournament", TournamentSchema);
