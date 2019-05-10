let express = require('express');
let router = express.Router();
let authorController = require('../controllers/author_controller');


router.post('/analytic', function (req, res) {
    let author = req.body.author;

    authorController(author, (data) => {
        res.json(data)
    })
});

module.exports = router;
