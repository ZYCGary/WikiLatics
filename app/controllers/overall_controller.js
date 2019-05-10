let Article = require('../models/articles_model');
let Rank = require('../models/ranks_model');
let getBarChartData = require('./getBarChartData');
let getPieChartData = require('./getPieChartData');
let fs = require('fs');
let adminsAndBots = JSON.parse(fs.readFileSync('./public/consts/adminsAndBots.json', 'utf-8'));

// cache charts data
let barData,
    pieData;


/** this function is used for sorting according to different properties. */
let compare = function (prop) {
    return function (obj1, obj2) {
        let val1 = obj1[prop];
        let val2 = obj2[prop];
        if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
            val1 = Number(val1);
            val2 = Number(val2);
        }
        if (val1 < val2) {
            return -1;
        } else if (val1 > val2) {
            return 1;
        } else {
            return 0;
        }
    }
};


/** get ranks by different prototypes (number of revisions, number of regular user, history) */
exports.getranks = function (req, callback) {
    Rank.find({}, function (err, data) {
        if (err) {
            throw err;
        }
        let rankResult = {
            rank: req.body.rank,
            rankByUser: {maxUser: [], minUser: []},
            rankByRev: {maxRev: [], minRev: []},
            rankByHist: {maxHist: [], minHist: []}
        };


        // get rank by users
        let sortReult = data.sort(compare('userCount'));
        rankResult.rankByUser.minUser = sortReult.slice(0, 1);
        rankResult.rankByUser.maxUser = sortReult.reverse().slice(0, 1);

        // get rank by history
        sortReult = data.sort(compare('history'));
        rankResult.rankByHist.minHist = sortReult.slice(0, 3);
        rankResult.rankByHist.maxHist = sortReult.reverse().slice(0, 3);

        // get rank by revision
        sortReult = data.sort(compare('revCount'));
        if (rankResult.rank) {
            rankResult.rankByRev.minRev = sortReult.slice(0, rankResult.rank);
            rankResult.rankByRev.maxRev = sortReult.reverse().slice(0, rankResult.rank);
            // req.session.rank = rank;
        } else {
            rankResult.rank = 3;
            rankResult.rankByRev.minRev = sortReult.slice(0, 3);
            rankResult.rankByRev.maxRev = sortReult.reverse().slice(0, 3);
        }

        // console.log(rankResult);
        callback(rankResult);
    });
};


/** get data for charts drawing */
let getTwoChartsData = function () {
    let chartTitle;
    return new Promise(function (resolve) {
        Article.find({}, function (err, data) {
            if (err) {
                throw err;
            }
            let anons = {editor: 'anon', revs: []},
                admins = {editor: 'admin', revs: []},
                bots = {editor: 'bot', revs: []},
                regulars = {editor: 'regular', revs: []};
            // console.log(data);
            data.forEach(function (record) {
                if (record.anon === '') {
                    anons.revs.push(record);
                } else if (adminsAndBots.admin.indexOf(record.user) >= 0) {
                    admins.revs.push(record);
                } else if (adminsAndBots.bot.indexOf(record.user) >= 0) {
                    bots.revs.push(record);
                } else {
                    regulars.revs.push(record);
                }
            });

            let editorsGroup = [anons, admins, bots, regulars];
            // get data for drawing Chart-1
            chartTitle = 'Revision Number Distributed By Year And By User Type';
            getBarChartData(editorsGroup, chartTitle, function (barChartData) {
                // get data for drawing the pie chart
                chartTitle = 'Revision Number Distribution Based On User Type';
                getPieChartData(editorsGroup, chartTitle, function (pieChartData) {
                    barData = barChartData;
                    pieData = pieChartData;
                    resolve([barChartData, pieChartData]);
                });
            });
        });
    });
};


/** return data for charts drawing */
exports.getChartsData = function (req, res) {
    if (barData && pieData) {
        res.json([barData, pieData]);
    } else {
        getTwoChartsData()
            .then(function (data) {
                res.json(data);
            });
    }
};
