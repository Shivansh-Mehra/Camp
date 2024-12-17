const express = require('express');
const app = express();
const path = require('node:path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const locationRouter = require('./routes/locations');
const userRouter = require('./routes/users');
const ejsMate = require('ejs-mate');
const CustomError = require('./controllers/CustomError');
const flash = require('connect-flash');
const mongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local');
const userModel = require('./models/User');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();


mongoose.connect('mongodb://127.0.0.1:27017/Locations',{
    useNewUrlParser : true,
    useUnifiedTopology : true,
    useCreateIndex : true
});

const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',() => {
    console.log("Connected to the Database...");
});

app.engine('ejs',ejsMate);

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));
app.use(cookieParser('TKGOP'));
// app.use(bsCustomFileInput.init());

const sessionStore = new mongoStore({
    mongoUrl : 'mongodb://127.0.0.1:27017/Locations',
    collection : 'Dev'
})

app.use(session({
    secret : 'TKGOP',
    resave : false,
    saveUninitialized : true,
    store : sessionStore,
    cookie : {
        maxAge : 1000*60*60*24
    }
}));

//passport auth
app.use(passport.initialize());
app.use(passport.session()); //have to use after using session()
passport.use(new localStrategy(userModel.authenticate()));

passport.serializeUser(userModel.serializeUser()); //serialize -> how a user is stored in the session
passport.deserializeUser(userModel.deserializeUser());

app.use(flash());

//security
app.use(mongoSanitize({
    replaceWith: '_',
    allowDots: true,
    onSanitize: ({req,key}) => {
         console.warn("[DryRun] ERROR");
    }
}));

app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/',(req,res) => {
    console.log(req.session);
    res.cookie('testing','yes we are testing',{secret : 'TKGOP'});
    res.render('locations/home');
})

app.get('/fake',async (req,res) => {
    const user = new userModel({email : "hello123@gmail.com",username : "WOOOOOO"});
    const newUser = await userModel.register(user,"BASHAR"); //encrypting algo is pbkdf2 instead of bcrypt because its platform independent
    res.json(newUser);
})

app.use('/locations',locationRouter);
app.use('/users',userRouter);

app.all('*',(req,res,next) => {
    next(new CustomError("Page not found",404));
})

app.use((err,req,res,next) => {
    const statusCode = err.statusCode || 500;
    console.log(err.message);
    if(!err.message) err.message = "Something went wrong";
    res.status(statusCode).render('locations/error',{err});
})


app.listen(3000);