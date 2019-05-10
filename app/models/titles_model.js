let mongoose = require('mongoose');

let Schema = mongoose.Schema;

// declare article schema
let articleSchema = new Schema({
    revid: {
        type: Number,
        unique: true
    },
    parentid: Number,
    minor: String,
    user: String,
    timestamp: String,
    size: Number,
    sha1: String,
    parsedcomment: String,
    anon: String,
    title: String
});

exports.getCollection = function (title) {
    return mongoose.model('article', articleSchema, title);
};
