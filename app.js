/**
 * Copyright (C) Crown Production Gaming - All Rights Reserved
 * Project Name: Brackette
 * Written by Daniel Reguero <daniel.reguero@hotmail.com> and Steven Dolbey <steven.dolbey@gmail.com>, September 2016
 */

/**
 * Import our Modules
 */
require('dotenv').config();
var express = require('express'),
    app = express(),
    passport = require("passport"),
    cookieParser = require('cookie-parser'),
    bodyParser = require("body-parser"),
    morgan = require("morgan"),
    flash = require("connect-flash"),
    session = require("express-session"),
    favicon = require("serve-favicon");
    middlewares = require("./lib/middlewares");

/**
 * Setup local variables.
 */
require("./lib/passport")(passport);
var port = process.env.PORT || 3000;
var api = require('./routes/api');
var index = require("./routes/index");
var user_registration = require("./routes/user-registration");

/**
 * Begin Middleware
 */
app.use('/assets', express.static(__dirname + "/public")); //public will be blank but for now keep it here
app.use('/lib', express.static(__dirname + "/bower_components"));
app.use('/static', express.static(__dirname + "/dist"));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(favicon(__dirname+'/public/img/logo-favicon.ico'));
app.set('view engine', 'ejs');

/**
 * More middlewares, mainly for passport.
 */
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(middlewares.setLocals);
/**
 * Pass in app and/or passport object to our routes.
 */
api(app);
index(app);
user_registration(app, passport);
// indexController(app, passport);
// tournamentsController(app);

/**
 * 404 
 */
app.get('/', function(req, res){
  res.send('hello world');
});

/**
 * Listen on port specified.
 */
app.listen(port);
console.log("Website is running on http://" + process.env.HOST + ":" + port);