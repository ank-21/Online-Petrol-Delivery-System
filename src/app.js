const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const cookieSession = require('cookie-session');
const keys = require('../config/keys');


//configuring passport
require('../config/passport')(passport);

const app = express();

mongoose.connect('mongodb://localhost:27017/ResourceHub',{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=> console.log("MongoDB connected"))
  .catch(err => console.log(err));



const indexRouter = require('./routes/index');
const userRouter = require('./routes/users');

//EJS

// app.use(expressLayouts);
app.set('view engine', 'ejs');

//body parser

app.use(express.urlencoded({ extended: true }));

//Express Session Middleware

//If you have your node.js behind a proxy and are using secure: true, you need to set "trust proxy" in express:

//app.set('trust proxy', 1) // trust first proxy

app.use(cookieSession({
    maxAge: 24*60*60*1000,
    keys: [keys.session.cookieKey]
}));

app.use(session({
  secret: 'resourcehub',
  resave: false,
  saveUninitialized: true,
}));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash

app.use(flash());

//global vars for flash
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');

    next();
})

//for static page
const publicDirectoryPath = path.join(__dirname,'../public');
app.use(express.static(publicDirectoryPath));

//for Routes
app.use('/',indexRouter);
app.use('/users',userRouter);




const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("server started on PORT :", PORT);    
})