const CustomError = require('./CustomError');

const wrapAsyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(err => {
            // console.log(err.message);
            next(err);
        });
    };
}

module.exports = wrapAsyncHandler;