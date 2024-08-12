const mongoose = require("mongoose");
// const notifications = users.map(user => {
//     return {
//         user: user._id,
//         title,
//         message,
//         read: false
//     }; 
// });
const Public_notification = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Public_notification", Public_notification);