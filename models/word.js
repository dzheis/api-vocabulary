// models/Word.js
const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
    english: String,
    russian: String,
    transcription: String

});

module.exports = mongoose.model('Word', wordSchema);
