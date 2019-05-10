let express = require('express');
let router = express.Router();
let individualController = require('../controllers/individual_controller');

// router.get('/data', individualController.getChartsData);
router.post('/analytic', (req, res) => {
    let title = req.body.title;
    individualController.getTopFiveRegularUsers(title, (data) => {
        individualController.getChartsData((chartData)=>{
            res.json({
                error: data.error,
                success: data.success,
                articleTitle: data.articleTitle,
                revCount: data.revCount,
                topFiveRegularUsers: data.topFiveRegularUsers,
                chartOne: chartData[0][0],
                chartTwo: chartData[0][1],
                chartThree: chartData[1]
            });
        });
    });
});

module.exports = router;