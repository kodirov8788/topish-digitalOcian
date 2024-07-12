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

module.exports = { Professions }


