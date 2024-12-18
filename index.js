if(process.env.NODE_ENV !== "production")
    require('dotenv').config();


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
const helmet = require('helmet');

const secret = process.env.SECRET || "ThisIsASecret";
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/Locations';

mongoose.connect(dbUrl,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',() => {
});

app.engine('ejs',ejsMate);

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));
app.use(cookieParser(secret));

const sessionStore = mongoStore.create({
    mongoUrl : dbUrl
    // collection: 'Dev'
})

app.use(session({
    name: 'session',
    secret,
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

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const connectSrcUrls = [
    "https://api.maptiler.com/", 
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dnjrccb62/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",

            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/',(req,res) => {res.render('locations/home')});
app.use('/locations',locationRouter);
app.use('/users',userRouter);

app.all('*',(req,res,next) => {
    next(new CustomError("Page not found",404));
})

app.use((err,req,res,next) => {
    const statusCode = err.statusCode || 500;
    if(!err.message) err.message = "Something went wrong";
    res.status(statusCode).render('locations/error',{err});
})


app.listen(3000);