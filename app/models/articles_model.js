let mongoose = require('mongoose');

let Schema = mongoose.Schema;

// declare article schema
let articleSchema = new Schema({
    revid: Number,
    user: String,
    timestamp: String,
    anon: String,
    title: String
});

/** get search result of articles’ names along with number of revisions made by particular author  */
articleSchema.statics.getRevCountByAuthor = (authorReg, callback) => {
    return this
        .aggregate([
            {
                $match: {user: authorReg}
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
        ]).exec(callback)
};

module.exports = mongoose.model('articles', articleSchema);


