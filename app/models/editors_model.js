let mongoose = require('mongoose');

let Schema = mongoose.Schema;

// declare a collection
let editorSchema = new Schema({
    name: String
});

module.exports = function (name) {
    return mongoose.model('editor', editorSchema, name);
};