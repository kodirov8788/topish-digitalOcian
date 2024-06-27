const mongoose = require("mongoose");

const TournamentSchema = new mongoose.Schema(
    {
        tournament_id: { type: String, unique: true, required: true },
        tournament_name: { type: String, required: true },
        date_range: { type: String, required: true },
        location: { type: String, required: true },
        prize_pool: { type: String, required: false, default: "0" },
        organizer: { type: String, required: true },
        game: { type: String, required: false, default: "" },
        platform: { type: String, required: false, default: "" },
        player_id: { type: String, required: false, default: "" },
        special_code: { type: String, required: false, default: "" },
        description: { type: String, required: false },
        image: { type: String, required: false },
        type: { type: String, required: true },
        participants: { type: [String], required: false, default: [] },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Tournament", TournamentSchema);
