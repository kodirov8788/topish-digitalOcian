const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true // Creates an index for efficient searching
    },
    content: {
        type: String,
        required: true,
    },
    sections: [{
        heading: {
            type: String,
            required: false
        },
        content: {
            type: String,
            required: false
        }
    }],
    keywords: [{
        type: String,
        required: false,
        index: true // Creates an index for searching by keywords
    }],
    references: [{
        type: String,
        required: false
    }],
    source: {
        type: String,
        required: true,
        enum: ['Database', 'Internet', 'Manual']
    },
    originalQuery: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Article', ArticleSchema);
