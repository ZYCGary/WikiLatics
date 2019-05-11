let Title = require('../models/titles_model'),
    Rank = require('../models/ranks_model'),
    Editor = require('../models/editors_model');
let fs = require('fs');
let titleList = [],
    adminsAndBots = [];

/** initiate article title list */
exports.initTitleList = function (req, res, next) {
    console.log('Initiating the list of article titles...');

    let list = fs.readdirSync('./public/dataset/revisions');
    list.forEach(function (fileName) {
        titleList.push(fileName.slice(0, fileName.length - 5));
    });

    console.log('The list of article titles have been initiated!\n');
    next();
};


/** integrate all article collection into one JSON file,
 *  this JSON file is used to initiate 'articles' collection in database. */
exports.initArticles = function (req, res, next) {
    let articles = [];

    console.log('Creating articles.JSON...');
    // console.log(titleList)

    (function iterator1(i) {
        if (i === titleList.length) {
            // transform array into json string
            let json = '[';
            articles.forEach(function (article) {
                json += JSON.stringify(article) + ',';
            });
            json = json.slice(0, json.length - 1) + ']';

            // write json string into file
            fs.writeFile('./public/consts/articles.json', json, function (err) {
                if (err) {
                    throw err;
                }
                console.log("article.json has been created!\n");
                next();
            });
        } else {
            let title = titleList[i];

            // remove '.' at the tail
            if (title[title.length - 1] === '.') {
                title = title.slice(0, title.length - 1);
            }

            // connect to collection named @title
            Title.getCollection(title).find({}, function (err, data) {
                if (err) {
                    throw err;
                }

                // add documents into @articles array
                data.forEach(function (item) {
                    let article = {
                        revid: item.revid,
                        user: item.user,
                        timestamp: item.timestamp,
                        anon: item.anon,
                        title: item.title
                    };
                    // console.log(article)
                    articles.push(article);
                });
                console.log('Iteration ' + i, articles.length);

                iterator1(i + 1);
            });
        }
    })(0);
};


/** get admin editor list */
let getAdminList = function (list) {
    return new Promise(function (resolve) {
        Editor('admins').find({}, function (err, data) {
            if (err) {
                throw err;
            }

            data.forEach(function (item) {
                list.admin.push(item.name);
            });

            resolve(list);
        });
    });
};


/** get bot editor list */
let getBotList = function (list) {
    return new Promise(function (resolve) {
        Editor('bots').find({}, function (err, data) {
            if (err) {
                throw err;
            }

            data.forEach(function (item) {
                list.bot.push(item.name);
            });

            resolve(list);
        });
    });
};

/** initiate users list that contains admins and bots */
exports.initUsers = function (req, res, next) {
    console.log("Creating adminAndBots.json...");

    let list = {
        admin: [],
        bot: []
    };

    Promise.all([getAdminList(list), getBotList(list)])
        .then(function (result) {
            let json = JSON.stringify(result[0]);
            fs.writeFile('./public/consts/adminsAndBots.json', json, function (err) {
                if (err) {
                    throw err;
                }
                console.log("adminAndBots.json has been created!\n");
                next();
            });
        });
};


/** initiate article title list
exports.initTitleList = function (req, res, next) {
    console.log('Initiating the list of article titles...');

    let list = fs.readdirSync('./public/dataset/revisions');
    list.forEach(function (fileName) {
        // console.log(fileName)
        titleList.push(fileName.slice(0, fileName.length - 5));
    });

    console.log('The list of article titles have been initiated!\n');
    next();
};*/


/** get count of reversion */
let getRevCount = function (title, rank) {
    return new Promise(function (resolve) {
        Title.getCollection(title).count(function (err, revCount) {
            if (err) {
                throw err;
            }
            rank.revCount = revCount;
            resolve(rank);
        })
    });
};


/** get count of users */
let getUserCount = function (title, rank, userList) {
    return new Promise(function (resolve) {
        Title.getCollection(title).aggregate([
            {
                $match: {
                    anon: undefined
                }
            },
            {
                $project: {
                    user: 1
                }
            },
            {
                $group: {
                    _id: "$user"
                }
            }
        ]).exec(function (err, turnover) {
            if (err) {
                throw err;
            }
            rank.userCount = turnover.length;
            turnover.forEach((user) => {
                for (let editor of userList) {
                    if (editor === user._id) {
                        rank.userCount--;
                    }
                }
                /*if (adminsAndBots.admin.indexOf(user._id) >= 0 || adminsAndBots.bot.indexOf(user._id) >= 0) {
                    rank.userCount--;
                    console.log(user._id);
                }*/
            });

            resolve(rank);
        })
    });
};


/** get oldest timestamp */
let getOldest = function (title) {
    console.log(title)
    return new Promise(function (resolve) {
        Title.getCollection(title).findOne().sort('timestamp').exec(function (err, post) {
            let oldest = post.timestamp.substring(0, 4);
            resolve(oldest);
        })
    });
};


/** get latest timestamp, then get history */
let getHistory = function (title, rank, oldest) {
    return new Promise(function (resolve) {
        Title.getCollection(title).findOne().sort('-timestamp').exec(function (err, post) {
            let latest = post.timestamp.substring(0, 4);
            rank.history = latest - oldest;
            resolve(rank);
        });
    });
};


/** add Object @rank into @ranks collection */
let addIntoRanks = function (title, rank) {
    return new Promise(function () {
        Rank.update(
            { title: rank.title },
            { revCount: rank.revCount, userCount: rank.userCount, history: rank.history },
            { upsert: true },
            (err) => {
                if (err) {
                    throw err;
                }
            });
    });
};


/** update rank of a specific article */
let updateRank = (title, userList) => {
    let rank = {};
    rank.title = title;

    // remove '.' at the tail
    if (title[title.length - 1] === '.') {
        title = title.slice(0, title.length - 1);
    }

    getRevCount(title, rank)
        .then(function (rank) {
            return getUserCount(title, rank, userList);
        })
        .then(function () {
            return getOldest(title);
        })
        .then(function (oldest) {
            return getHistory(title, rank, oldest);
        }).then(function (rank) {
            addIntoRanks(title, rank);
        });
};

exports.updateRank = (title, userList) => {
    updateRank(title, userList);
};


/** get reversion count, user count and history of each article, then export them into a JSON file.
 *  this function is used to refresh ranks collection in database. */
exports.initRanks = function (req, res, next) {
    console.log('Initiating collection \"ranks\"...');

    let tamp = JSON.parse(fs.readFileSync('./public/consts/adminsAndBots.json', 'utf-8'));
    adminsAndBots = tamp.admin.concat(tamp.bot);

    titleList.forEach(function (title) {
        updateRank(title, adminsAndBots);
    });

    console.log('Collection \"ranks\" has been initiated!\n');

    next();
};


