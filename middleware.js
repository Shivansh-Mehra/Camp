const wrapAsyncHandler = require('./controllers/wrapAsyncHandler');
const Location = require('./models/Locations');
const Reviews = require('./models/Reviews');

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error','you must be signed in');
        return res.redirect('/users/login');
    }
    console.log(req.user.username);
    next();
}

module.exports.storeReturnTo = (req,res,next) => {
    if(req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.isAuthor = wrapAsyncHandler(async (req,res,next) => {
    const {id} = req.params;
    const loc = await Location.findById(id);
    if(!loc.author.equals(req.user._id)) {
        req.flash('error','no permission');
        res.redirect('/');
    }
    next();
});

module.exports.isReviewAuthor = wrapAsyncHandler(async (req,res,next) => {
    const {id,reviewId} = req.params;
    const loc = await Location.findById(id);
    const review = await Reviews.findById(reviewId);
    if(!review.author.equals(req.user._id)) {
        req.flash('error','you are not the author of this review.');
        res.redirect('/locations/id');
    }
    next();
})