let express = require('express');
let router = express.Router();
let overallController = require('../controllers/overall_controller');

router.get('/chartdata', overallController.getChartsData);

router.post('/revrank', function (req, res, next) {
    overallController.getranks(req, (data) => {
        res.json(data);
    });
});

module.exports = router;