/**
 * Copyright (C) Crown Production Gaming - All Rights Reserved
 * Project Name: Brackette
 * Written by Daniel Reguero <daniel.reguero@hotmail.com> and Steven Dolbey <steven.dolbey@gmail.com>, September 2016
 */

/**
 * Import our Modules
 */
require('dotenv').config();
var express = require('express');
var app = express();
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var flash = require('connect-flash');
var session = require('express-session');
var favicon = require('serve-favicon');
var middlewares = require('./lib/middlewares');
var paths = require('./lib/paths');
global.logger = require('./lib/logger');

global.logger.info('========Starting Brackette========');

/**
 * Setup local variables.
 */
require('./lib/passport')(passport);
var port = process.env.PORT || 3000;
var api = require('./routes/api');
var index = require('./routes/index');
var userRegistration = require('./routes/user-registration');
var tournaments = require('./routes/tournaments');

/**
 * Begin Middleware
 */
app.use('/assets', express.static(paths.assets)); // assets will be blank but for now keep it here
app.use('/lib', express.static(paths.lib));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(favicon(paths.fav));
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
userRegistration(app, passport);
tournaments(app);

/**
 * Listen on port specified.
 */
app.listen(port);
global.logger.info('Website is running on http://' + process.env.HOST + ':' + port);
