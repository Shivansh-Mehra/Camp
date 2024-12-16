const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    text : String,
    rating : Number,
    author : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }
})

const reviewModel = mongoose.model('Reviews',reviewSchema);
module.exports = reviewModel;