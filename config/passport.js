/*
 *	Passport.js serves as our authentication tool.
 */
var LocalStrategy = require('passport-local').Strategy;
var Users = require('../models/users').Users;
var nodemailer = require("nodemailer");
var sgTransport = require('nodemailer-sendgrid-transport');

module.exports = function(passport) {

    //used to serialize the user for the session, essentially this gets the users id and with it, creates a session for user.
    passport.serializeUser(function(user, done) {
        done(null, user.insertId || user[0].id);
    });

    //The information in that session based on what we retrieve via ID.
    passport.deserializeUser(function(id, done) {
        Users.getUserById(id, function(err, user) {
            done(err, user[0]);
        });
    });

    //middleware for our local register
    passport.use('local-register', new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
    }, function(req, email, password, done) {
        process.nextTick(function() {
            //See if email is taken.
            Users.getUserByEmail(email, function(err, user) {
                if (err) return done(null, false, req.flash('registerMessage', "A unknown error occured."));
                if (user[0]) {
                    return done(null, false, req.flash('registerMessage', "That E-mail is already taken."));
                }
                Users.registerUser({
                    "name": req.body.name,
                    "email": email,
                    "password": Users.generateHash(password)
                }, function(err, results) {
                    if (err) return done(null, false, req.flash('registerMessage', "A unknown error occured."));
                    //Add data to userInfo, it will be empty but we need this column to simply add data.
                    Users.insertUserInfo(results.insertId, function(err, res) {
                        if (err) return done(null, false, req.flash('registerMessage', "A unknown error occured."));
                    });

                    var options = {
                    auth: {
                        api_key: process.env.SENGRID_API
                        }
                    };
                    var smtpTransport = nodemailer.createTransport(sgTransport(options));
                    var mailOptions = {
                        to: email,
                        from: 'passwordreset@demo.com',
                        subject: 'Thank you for signing up with Brackette!',
                        text: "Thank you for registering for Brackette!"
                    };
                    smtpTransport.sendMail(mailOptions, function(err) {
                        if (err) return done(null, false, req.flash('registerMessage', "A unknown error occured while sending the confirmation E-mail"));
                    });

                    return done(null, results);
                });
            });
        });
    }));


    //Middle ware for login
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true //allow to pass entire request.
    }, function(req, email, password, done) {
        Users.getUserByEmail(email, function(err, user) {
            if (err) return done(err);
            if (!user[0]) {
                return done(null, false, req.flash('loginMessage', 'Wrong E-mail and/or Password'));
            }
            if (!Users.validPassword(password, user[0].password)) {
                return done(null, false, req.flash('loginMessage', 'Wrong E-mail and/or Password')); // create the loginMessage and save it to session as flashdata
            }
            return done(null, user);
        });
    }));

};