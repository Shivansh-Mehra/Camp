const Joi = require('joi');
const CustomError = require('./controllers/CustomError');
const validateLocation = (req,res,next) => {
    const newSchema = Joi.object({
        name : Joi.string().required(),
        description : Joi.string().required(),
        image : Joi.array().items(Joi.object({
            url: Joi.string().required(),
            filename: Joi.string().required()
        })).max(3),
        price : Joi.number().min(0).required(),
        location : Joi.string().required()
        })
    const {error} = newSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        next(new CustomError(msg,400));
    }else {
        next();
    }
}

const validateReview = (req,res,next) => {
    const newReview = Joi.object({
        text : Joi.string().required(),
        rating : Joi.number().required().min(0).max(5)
    })
    const {error} = newReview.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        next(new CustomError(msg,400));
    }
    else next();
}

const validateUser = (req,res,next) => {
    const newUser = Joi.object({
        email : Joi.string().email().required(),
        username : Joi.string().required(),
        password : Joi.string().required()
    });
    const {error} = newUser.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        next(new CustomError(msg,400));
    } else next();
}

module.exports = [validateLocation,validateReview,validateUser];