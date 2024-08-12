const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Profession = new Schema({
    profession: {
        type: Array,
        required: false
    },
    language: {
        type: String,
        required: true
    }
});

const Professions = mongoose.model('Profession', Profession);


const promptCode = new Schema({
    code: {
        type: String,
        required: true
    }
});

const PromptCode = mongoose.model('PromptCode', promptCode);
module.exports = { Professions, PromptCode }


