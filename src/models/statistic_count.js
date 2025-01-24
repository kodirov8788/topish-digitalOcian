// src/models/statistic_count.js
const mongoose = require("mongoose");

const statisticSchema = new mongoose.Schema(
    {
        count: {
            type: Number,
            required: true,
            default: 0
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
);


const Company = mongoose.model("Statistics", statisticSchema);

module.exports = Company;
