const baseJoi = require('joi');
const sanitizeHTML = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value,helpers) {
                const clean = sanitizeHTML(value,{
                    allowedTags: [],
                    allowedAttributes: {}
                });
                if(clean !== value) return helpers.error('string.escapeHTML',{value});
                return clean;
            }
        }
    }
})
const Joi = baseJoi.extend(extension);

const CustomError = require('./controllers/CustomError');
const validateLocation = (req,res,next) => {
    const newSchema = Joi.object({
        name : Joi.string().required().escapeHTML(),
        description : Joi.string().required().escapeHTML(),
        image : Joi.array().items(Joi.object({
            url: Joi.string().required(),
            filename: Joi.string().required()
        })).max(3),
        price : Joi.number().min(0).required(),
        location : Joi.string().required().escapeHTML()
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
        text : Joi.string().required().escapeHTML(),
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
        email : Joi.string().email().required().escapeHTML(),
        username : Joi.string().required().escapeHTML(),
        password : Joi.string().required().escapeHTML()
    });
    const {error} = newUser.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        next(new CustomError(msg,400));
    } else next();
}

module.exports = [validateLocation,validateReview,validateUser];