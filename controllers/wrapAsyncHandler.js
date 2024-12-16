const CustomError = require('./CustomError');

const wrapAsyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(err => {
            console.log(err.message);
            if (err instanceof CustomError) {
                next(err);
            } else {
                next(err); //review wtf
            }
        });
    };
}

module.exports = wrapAsyncHandler;