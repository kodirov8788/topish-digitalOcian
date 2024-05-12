const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
    fullName: { type: String, default: "" },
    gender: {
        type: String,
        required: false,
        default: "Choose",
        enum: {
            values: ["Male", "Female", "Choose"],
        },
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    location: {
        type: String,
        default: "",
        required: false,
    },
    savedOffices: {
        type: [{ type: Schema.Types.ObjectId, ref: "Office" }],
        default: [],
    },
    active: { type: Boolean, default: true },
});
module.exports = { ServiceSchema };