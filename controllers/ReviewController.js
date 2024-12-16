const Location = require('.././models/Locations');
const Review = require('.././models/Reviews');

module.exports.postReview = async(req,res) =>  {
    const {id} = req.params;
    const location = await Location.findById(id);
    const newReview = new Review(req.body);
    location.reviews.push(newReview);
    newReview.author = req.user._id;
    await newReview.save();
    await location.save();
    req.flash('success','successfully created the review!');
    res.redirect('/locations/' + id);
}

module.exports.showReviews = async(req,res) => {
    const {id} = req.params;
    const location = await Location.findById(id).populate({path:'reviews',populate: {path: "author"}}).populate('author');
    const reviews = location.reviews;
    res.render('locations/reviewsIndex',{location,reviews});
}

module.exports.deleteReview = async(req,res) => {  
    const {id,reviewId} = req.params;
    await Location.findByIdAndUpdate(id,{$pull : {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','successfully deleted the review!');
    res.redirect('/locations/' + id + '/reviewsIndex');
}