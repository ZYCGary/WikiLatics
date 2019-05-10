let express = require('express');
let router = express.Router();
let overallController = require('../controllers/overall_controller');
let authMiddleware = require('../middlewares/authoritation_middleware');
let fs = require('fs');

let titleList = [];
let list = fs.readdirSync('./public/dataset/revisions');
list.forEach(function (fileName) {
    titleList.push(fileName.slice(0, fileName.length - 5));
});
// console.log(titleList);

router.use(authMiddleware);


/* GET analytic page. */
router.get('/', function (req, res) {
    overallController.getranks(req, (data)=>{
        res.render('analytic_view', {
            title: 'Wiki Analytics',
            user: req.session.user,
            rank: data.rank,
            maxRev: data.rankByRev.maxRev,
            minRev: data.rankByRev.minRev,
            maxUser: data.rankByUser.maxUser,
            minUser: data.rankByUser.minUser,
            maxHist: data.rankByHist.maxHist,
            minHist: data.rankByHist.minHist,
            titleList: titleList
        });
    });
});

module.exports = router;