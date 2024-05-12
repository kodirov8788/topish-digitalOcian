const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Profession = new Schema({
    profession: {
        type: Array,
        required: false
    },
});

const Professions = mongoose.model('Profession', Profession);

module.exports = { Professions }


