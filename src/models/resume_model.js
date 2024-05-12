const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resumeSchema = new Schema({
    summary: {
        type: String,
        default: null
    },
    industry: { type: Array, default: [] },
    contact: {
        email: { type: String, default: null },
        phone: { type: String, default: null },
    },
    workExperience: { type: Array, default: [] },
    education: { type: Array, default: [] },
    projects: { type: Array, default: [] },
    certificates: { type: Array, default: [] },
    awards: { type: Array, default: [] },
    languages: { type: Array, default: [] },
    cv: {
        type: Object,
        items: {
            path: { type: String, default: null },
            filename: { type: String, default: null },
            size: { type: Number, default: null },
            key: { type: String, default: null }
        },
        default: {
            path: null,
            filename: null,
            size: null,
            key: null
        }
    },

});

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume


