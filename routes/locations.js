if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const {Router} = express;
const locationRouter = Router();
const wrapAsyncHandler = require('../controllers/wrapAsyncHandler');
const CustomError = require('../controllers/CustomError');
const validateLocation = require('../validationSchemas')[0];
const validateReview = require('../validationSchemas')[1];
const {isLoggedIn, isReviewAuthor} = require('../middleware');
const {isAuthor} = require('../middleware');
const locationController = require('../controllers/LocationsController');
const reviewsController = require('../controllers/ReviewController');
const {storage} = require('../cloudinary');
const multer = require('multer');
const upload = multer({storage});

locationRouter.get('/',wrapAsyncHandler(locationController.index));
locationRouter.post('/',wrapAsyncHandler(locationController.index));

locationRouter.route('/new')
            .get(isLoggedIn,locationController.newLocationForm)
            .post(isLoggedIn,upload.array('image'),validateLocation,wrapAsyncHandler(locationController.createNewLocation))

locationRouter.route('/edit/:id')
            .get(isLoggedIn,isAuthor,wrapAsyncHandler(locationController.editForm))
            .patch(isLoggedIn,isAuthor,upload.array('image'),validateLocation,wrapAsyncHandler(locationController.editLocation))

locationRouter.delete('/delete/:id',isLoggedIn,isAuthor,wrapAsyncHandler(locationController.deleteLocation));

locationRouter.get('/:id',isLoggedIn,wrapAsyncHandler(locationController.displayLocation));

locationRouter.post('/:id/reviews',isLoggedIn,validateReview,wrapAsyncHandler(reviewsController.postReview));

locationRouter.get('/:id/reviewsIndex',isLoggedIn,wrapAsyncHandler(reviewsController.showReviews));

locationRouter.delete('/:id/:reviewId/delete',isLoggedIn,isReviewAuthor,wrapAsyncHandler(reviewsController.deleteReview));

locationRouter.route('/edit/:id/deleteImages')
            .get(isLoggedIn,isAuthor,wrapAsyncHandler(locationController.deleteImages))
            .delete(isLoggedIn,isAuthor,wrapAsyncHandler(locationController.deleteSelectedImages));

locationRouter.all('*',(req,res,next) => {
    next(new CustomError("Page not found",404));
})

locationRouter.use((err,req,res,next) => {
    const statusCode = err.statusCode || 500;
    console.log(err.message);
    if(!err.message) err.message = "Something went wrong";
    res.status(statusCode).render('locations/error',{err});
})

module.exports = locationRouter;