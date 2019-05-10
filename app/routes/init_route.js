let express = require('express');
let router = express.Router();
let initController = require('../controllers/init_controller');

router.use(initController.initTitleList);
router.use(initController.initArticles);
router.use(initController.initUsers);
router.use(initController.initRanks);


router.get('/', function (req, res) {
    res.render('home_view');
});

module.exports = router;