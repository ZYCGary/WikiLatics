let mongoose = require('mongoose');

let Schema = mongoose.Schema;

// declare a collection
let rankSchema = new Schema({
    title: {
        type: String,
        unique: true
    },
    revCount: Number,
    userCount: Number,
    history: Number
});

module.exports = mongoose.model('ranks', rankSchema);