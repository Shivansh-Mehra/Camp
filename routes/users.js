const express = require('express');
const wrapAsyncHandler = require('../controllers/wrapAsyncHandler');
const {Router} = express;
const userRouter = Router();
const validateUser = require('../validationSchemas')[2];
const passport = require('passport');
const {storeReturnTo} = require('../middleware');
const userController = require('.././controllers/UserController');

userRouter.get('/register',(req,res) => {
    res.render('users/register');
})

userRouter.post('/register',validateUser,wrapAsyncHandler(userController.register));

userRouter.get('/login',(req,res) => {
    res.render('users/login');
})

userRouter.post('/login',storeReturnTo,passport.authenticate('local',{failureFlash : true , failureRedirect : '/users/login'}),wrapAsyncHandler(userController.login))

userRouter.get('/logout',userController.logout)

module.exports = userRouter;