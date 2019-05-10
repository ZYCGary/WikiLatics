let mongoose = require('mongoose');

let Schema = mongoose.Schema;

// declare a collection
let userSchema = new Schema({
    firstName: String,
    lastName: String,
    username: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String
    }
});

module.exports = mongoose.model('users', userSchema);