let Title = require('../models/titles_model'),
    Article = require('../models/articles_model'),
    Rank = require('../models/ranks_model');
let getBarChartData = require('./getBarChartData'),
    getPieChartData = require('./getPieChartData');
let initController = require('./init_controller');
let fs = require('fs'),
    request = require('request');

let tamp = JSON.parse(fs.readFileSync('./public/consts/adminsAndBots.json', 'utf-8')),
    adminsAndBots = tamp.admin.concat(tamp.bot);

let title,
    topFiveRegularUsers,
    editorsGroup,
    chartTitle;
let error,
    success,
    articleTitle,
    revCount;


/** get the latest timestamp of revision in database */
let getLatestTimestamp = (title, callback) => {
    Title.getCollection(title)
        .find({})
        .sort({'timestamp': -1})
        .limit(1)
        .exec((err, data) => {
            if (err) {
                throw err;
            }
            callback(data);
        })
};


/** check whether the data need to be updated */
let checkExpire = (latestTimestamp) => {
    latestTimestamp = latestTimestamp.replace('T', ' ').replace('Z', ':000');
    latestTimestamp = new Date(latestTimestamp.replace(/-/g, '/')).getTime();
    let nowTimeStamp = new Date().getTime();
    if ((nowTimeStamp - latestTimestamp) / 1000 > 24 * 60 * 60) {
        return 1;
    }
    return 0;
};


/** update collection */
let updateCollection = (atitle, title, latestTimestamp, callback) => {
    // build request header
    let wikiEndPoint = 'https://en.wikipedia.org/w/api.php',
        parameters = [
            "action=query",
            "format=json",
            "prop=revisions",
            "titles=" + atitle,
            "rvstart=" + latestTimestamp,
            "rvdir=newer",
            "rvlimit=max",
            "rvprop=timestamp|userid|user|ids"];
    let url = wikiEndPoint + "?" + parameters.join("&");
    let options = {
        url: url,
        Accept: 'application/json', 'Accept-Charset': 'utf-8'
    };

    // send request
    request(options, (err, res, data) => {
        if (err) {
            throw err;
        }
        let json = JSON.parse(data),
            pages = json.query.pages,
            revisions = pages[Object.keys(pages)[0]].revisions;
        revisions = revisions.slice(1, revisions.length);

        // update collection of this article
        Title.getCollection(title).create(revisions, () => {
            // update 'articles' collection
            Article.create(revisions, () => {
                // update 'ranks' collection
                initController.updateRank(atitle, adminsAndBots);
            });

            callback(revisions.length);
        });
    });
};


/** this function is used for sorting according to different properties. */
let compare = function (prop) {
    return function (obj1, obj2) {
        let val1 = obj1[prop].length;
        let val2 = obj2[prop].length;
        if (val1 < val2) {
            return 1;
        } else if (val1 > val2) {
            return -1;
        } else {
            return 0;
        }
    }
};


/** count the number of revisions */
let getRevCount = (title, callback)=>{
    Title.getCollection(title).count({}, (err, data)=>{
        if (err){
            throw err;
        }
        callback(data);
    })
};

/** group regular users (not anon user, admin nor bots) */
let getTopFiveRegularUsers = function (title) {
    return new Promise(function (resolve, reject) {
        Title.getCollection(title).aggregate([
            {$match: {anon: undefined}},
            {$group: {_id: '$user', revs: {$push: '$$ROOT'}}},
            // {$sort: {revs: -1}}
        ]).exec((err, data) => {
            if (err) {
                throw err
            }

            // console.log(data, adminsAndBots)
            // filter regular users
            let regulars = [];
            data.forEach((rec) => {
                let user = rec._id,
                    flag = 0;
                adminsAndBots.forEach((editor) => {
                    if (editor === user) {
                        flag = 1;
                    }
                });

                if (flag === 0) {
                    regulars.push(rec);
                }
            });

            // get top 5 regular editors
            regulars.sort(compare('revs'));
            let topFiveRegularUsers;
            if (regulars.length !== 0) {
                topFiveRegularUsers = regulars.length >= 5 ? regulars.slice(0, 5) : regulars;
                // fix @regulars: change key @_id to @editor
                topFiveRegularUsers = topFiveRegularUsers.map((item)=>{
                    return {
                        editor: item._id,
                        revs: item.revs
                    }
                });
                resolve(topFiveRegularUsers);
            } else {
                reject('Cannot find any regular user.');
            }
        });
    });
};


/** get top five regular users */
exports.getTopFiveRegularUsers = (atitle, callback) => {
    if (!atitle) {
        return;
    }

    // remove '.' at the tail
    if (atitle[atitle.length - 1] === '.') {
        title = title.slice(0, atitle.length - 1);
    } else {
        title = atitle;
    }

    // get article title
    Title.getCollection(title).findOne({}, (err, data) => {
        if (err) {
            throw err;
        }
        if (!data) {
            error = 'Cannot find this article!';
            articleTitle = undefined;
            topFiveRegularUsers = undefined;
            callback({error: error});
            return;
        }
        articleTitle = atitle;

        // get the latest timestamp of revision in database
        getLatestTimestamp(title, (data) => {
            let latestTimestamp = data[0].timestamp;

            let updateInd = checkExpire(latestTimestamp);

            // update collection
            if (updateInd === 1) {
                updateCollection(articleTitle, title, latestTimestamp, (updatedDataLength) => {
                    success = 'Data has been up-to-date: ' + updatedDataLength + ' revisions have updated!';
                    // get revCount
                    getRevCount(title, (count) => {
                        revCount = count;
                        // get top 5 regular editors
                        getTopFiveRegularUsers(title)
                            .then(function (data) {
                                topFiveRegularUsers = data;
                                callback({
                                    success: success,
                                    articleTitle: articleTitle,
                                    revCount: revCount,
                                    topFiveRegularUsers: topFiveRegularUsers
                                });
                            })
                            .catch(function (data) {
                                error = data;
                                topFiveRegularUsers = undefined;
                                callback({
                                    error: error,
                                    articleTitle: articleTitle,
                                    revCount: revCount,
                                    topFiveRegularUsers: topFiveRegularUsers
                                });
                            });
                    });
                });
            } else {
                success = 'Data is up-to-date, there is no need to update data.'
                getRevCount(title, (count) => {
                    revCount = count;
                    // get top 5 regular editors
                    getTopFiveRegularUsers(title)
                        .then(function (data) {
                            topFiveRegularUsers = data;
                            callback({
                                success: success,
                                articleTitle: articleTitle,
                                revCount: revCount,
                                topFiveRegularUsers: topFiveRegularUsers
                            });
                        })
                        .catch(function (data) {
                            error = data;
                            topFiveRegularUsers = undefined;
                            callback({
                                error: error,
                                articleTitle: articleTitle,
                                revCount: revCount,
                                topFiveRegularUsers: topFiveRegularUsers
                            });
                        });
                })

            }
        })
    });


};


/** this function is used to generate an Object to build chart 1
 *  Chart 1: A bar chart of revision number distributed by year and by user type for this article.
 */
let getChartsDataGroupByUserType = function () {
    return new Promise(function (resolve) {
        // category data by user types
        Title.getCollection(title).find({}, function (err, data) {
            if (err) {
                throw err;
            }
            if (data === 0) {
                resolve(undefined);
            } else {
                let anons = {editor: 'anon', revs: []},
                    admins = {editor: 'admin', revs: []},
                    bots = {editor: 'bot', revs: []},
                    regulars = {editor: 'regular', revs: []};

                data.forEach(function (record) {
                    if (record.anon === '') {
                        anons.revs.push(record);
                    } else if (tamp.admin.indexOf(record.user) >= 0) {
                        admins.revs.push(record);
                    } else if (tamp.bot.indexOf(record.user) >= 0) {
                        bots.revs.push(record);
                    } else {
                        regulars.revs.push(record);
                    }
                });

                editorsGroup = [anons, admins, bots, regulars];

                // get data for drawing Chart-1
                chartTitle = 'Revision Number Distributed By Year And By User Type';
                getBarChartData(editorsGroup, chartTitle, function (barChartData) {
                    // get data for drawing the pie chart
                    chartTitle = 'Revision Number Distribution Based On User Type';
                    getPieChartData(editorsGroup, chartTitle, function (pieChartData) {
                        resolve([barChartData, pieChartData]);
                    });
                });
            }
        });
    });
};


/** this function is used to generate an Object to build chart 3
 *  Chart 3: A bar chart of revision number distributed by year made by one or a few of the top 5 users for this article.
 */
let getChartDataOfTopFiveRegulars = function (topFiveRegularUsers) {
    return new Promise(function (resolve) {
        if (topFiveRegularUsers) {
            chartTitle = 'Revision Number Distributed By Year Made By Top 5 Users';
            getBarChartData(topFiveRegularUsers, chartTitle, function (data) {
                resolve(data);
            });
        } else {
            resolve(undefined);
        }

    });
};


exports.getChartsData = function (callback) {
    Promise.all([getChartsDataGroupByUserType(), getChartDataOfTopFiveRegulars(topFiveRegularUsers)])
        .then(function (data) {
            callback(data);
        });
};


