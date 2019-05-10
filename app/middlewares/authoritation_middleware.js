module.exports = function (req, res, next) {
    if (req.session.user){
        next();
    } else{
        req.flash('error', 'Please login at first.');
        res.redirect('/log_in');
    }
};