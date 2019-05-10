let User = require('../models/users_model');

module.exports = function (req, res) {
    // get POST info
    let postData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    };

    // check registered
    User.findOne({$or: [{'username': postData.username}, {'email': postData.email}]}, function (err, data) {
        if (data) {
            req.flash('error', 'The username/email have already been taken.');
            res.redirect('/sign_up');
        } else {
            // save postData
            User.create(postData, function (err) {
                if (err) {
                    throw err;
                }
                req.session.user = postData.username;
                req.flash('success', 'Welcome! ' + req.session.user + '.');
                res.redirect('/');
            });
        }
    })
};
