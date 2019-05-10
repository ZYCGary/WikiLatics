let Article = require('../models/articles_model');

let error,
    resultWithContribution,
    resultWithTimestamp;

/** this function is used to group an array by a specific key. */
let groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};


module.exports = function (author, callback) {
    // let author = req.body.author;

    if (!author) {
        return;
    } else {
        let reg = new RegExp(author, 'i');

        // find articles' details with revCount
        Article.aggregate([
            {
                $match: {user: reg}
            },
            {
                $group: {
                    _id: {
                        title: '$title',
                        user: '$user'
                    },
                    revCount: {
                        $sum: 1
                    }
                }
            }
        ]).exec((err, result) => {
            if (err) {
                throw err;
            } else if (result.length === 0) {
                error = 'Cannot find any reversion edited by an author whose name contains \"' + author + '\".';
                resultWithContribution = undefined;
                resultWithTimestamp = undefined;
                callback({
                    error: error,
                });
            } else {
                resultWithContribution = result;

                // get article details with timestamp
                Article.find({user: reg}, (err, result2) => {
                    resultWithTimestamp = result2;
                    callback({
                        resultWithContribution: resultWithContribution,
                        resultWithTimestamp: resultWithTimestamp
                    });
                });
            }

        });
    }
};
