let express = require('express');
let router = express.Router();
let signUpController = require('../controllers/signup_controller');
let loginController = require('../controllers/login_controller');

/* GET routers. */
router.get('/', function (req, res) {
    res.render('home_view', {
        title: 'WikiLatic',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()});
});

router.get('/log_in', function (req, res) {
    res.render('login_view', {
        title: 'Login',
        success: req.flash('success').toString(),
        error: req.flash('error').toString()});
});

router.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success', 'You have logged out.');
    res.redirect('/');
});

router.get('/sign_up', function (req, res) {
    res.render('sign_up_view', {
        title: 'Sign Up',
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});

/* POST routers. */
router.post('/log_in', loginController);

router.post('/sign_up', signUpController);

module.exports = router;


