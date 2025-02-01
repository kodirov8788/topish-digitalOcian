// src/models/friendship_model.js
const mongoose = require('mongoose');

// Friendship Schema Example
const friendshipSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // User who sent the friend request
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who received the friend request
    status: { type: String, enum: ['pending', 'accepted', 'blocked'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },  // Time when the friend request was accepted
});


module.exports = mongoose.model('Friendship', friendshipSchema);