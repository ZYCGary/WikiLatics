let User = require('../models/users_model');

module.exports = function (req, res) {
    // get POST info
    let postData = {
        username: req.body.username,
        password: req.body.password
    };

    // find user in database
    User.findOne({username: postData.username, password: postData.password}, function (err, data) {
        if (err){
            throw err;
        }
        if (data){
            req.session.user = postData.username;
            req.flash('success', 'Welcome! '+req.session.user+'.');
            res.redirect('/');
        } else {
            req.flash('error', 'The username does match with the password. Verify that you have enter the correct information.');
            res.redirect('/login')
        }
    })
};