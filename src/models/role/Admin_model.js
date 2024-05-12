const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
    fullName: { type: String, default: "" },
    isVerified: {
        type: Boolean,
        default: false,
    },

    active: { type: Boolean, default: true },
});
module.exports = { AdminSchema };