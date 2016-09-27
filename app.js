/* Copyright (C) Crown Production Gaming - All Rights Reserved
 * Project Name: Brackette
 * Written by Daniel Reguero <daniel.reguero@hotmail.com> and Steven Dolbey <steven.dolbey@gmail.com>, September 2016
 */
//Import our Modules
var express = require('express'),
    app = express(),
    passport = require("passport"),
    cookieParser = require('cookie-parser'),
    bodyParser = require("body-parser"),
    morgan = require("morgan"),
    flash = require("connect-flash"),
    session = require("express-session"),
    favicon = require("serve-favicon"),
    config = require('./config');
config.setup();

//'Custom' modules/variables.
var port = process.env.PORT || 3000;
var indexController = require("./controllers");
var apiController = require('./controllers/apiController');
require('./config/passport')(passport);

// Begin Middleware
app.use('/assets', express.static(__dirname + "/public"));
app.use('/static', express.static(__dirname + "/bower_components"));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(favicon(__dirname+'/public/img/logo-favicon.ico'));
app.set('view engine', 'ejs');

//Stuff for Passport.
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Call in our controllers/routes
apiController(app); //No passport for API, api just retrieves.
indexController(app, passport);

//Listen on port specified.
app.listen(port);
console.log("Website is running on http://" + process.env.HOST + ":" + port);