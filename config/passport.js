/*
 *	Passport.js serves as our authentication tool.
 */
//TODO: Send email when user registered via facebook. (Make email into funtion and just call it ?)
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var Users = require('../models/users').Users;
var nodemailer = require("nodemailer");
var sgTransport = require('nodemailer-sendgrid-transport');

module.exports = function(passport) {

    //used to serialize the user for the session, essentially this gets the users id and with it, creates a session for user.
    passport.serializeUser(function(user, done) {
        done(null, user.insertId || user.id || user.facebook_id);
    });

    //The information in that session based on what we retrieve via ID.
    passport.deserializeUser(function(id, done) {
        Users.getUserBy('id', id, function(err, user) {
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
            Users.getUserBy('email', email, function(err, user) {
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
                    // smtpTransport.sendMail(mailOptions, function(err) {
                    //     if (err) return done(null, false, req.flash('registerMessage', "A unknown error occured while sending the confirmation E-mail"));
                    // });

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
        Users.getUserBy('email', email, function(err, user) {
            if (err) return done(err);
            if (!user[0]) {
                return done(null, false, req.flash('loginMessage', 'Wrong E-mail and/or Password'));
            }
            if(user[0].password){
                //We have a password
                if (!Users.validPassword(password, user[0].password)) {
                    return done(null, false, req.flash('loginMessage', 'Wrong E-mail and/or Password')); // create the loginMessage and save it to session as flashdata
                }else{
                    return done(null, user[0]);
                }
            }else if((user[0].password === null) && user[0].facebook_token){
                //No password but has a facebook token, so just throw error that this account 'already exists' by showing wrong password.
                return done(null, false, req.flash('loginMessage', 'Wrong E-mail and/or Password'));
            }else{
                //No password AND no token...
                return done(null, false, req.flash('loginMessage', 'rong E-mail and/or Password'));
            }

        });
    }));

    //Middleware for Facebook.
    passport.use(new FacebookStrategy({
        clientID: process.env.CLIENTID,
        clientSecret  : process.env.CLIENTSECRET,
        callbackURL   : 'http://'+process.env.HOST+':'+process.env.PORT+'/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'name', 'email'], // get profile image ? add to UserInfo table ?
        passReqToCallback: true
    }, function(req, token, refreshToken, profile, done){
        process.nextTick(function(){
            if(!req.user){
                Users.getUserBy('facebookId', profile.id, function(err, user){
                    if(err) return done(err);
                    if(user[0]){
                        return done(null, user[0]); //user found, return that user.
                    }else{
                        Users.registerFacebookUser({
                            facebookId: profile.id,
                            name: profile.name.givenName + " " + profile.name.familyName,
                            token: token,
                            email: profile.emails[0].value
                        }, function (err, res) {
                            Users.insertUserInfo(res.insertId, function(err, res) {
                                if (err) return done(null, false, req.flash('registerMessage', "A unknown error occured."));
                            });
                            if(err) throw err;
                            return done(null, res);
                        });
                    }
                });
            }else{
                //user already exists and is already logged in, we simply link their accounts together.
                var user = req.user;
                user.id = req.user.userId;
                user.email = profile.emails[0].value;
                user.facebook_token = token;
                user.facebook_id = parseInt(profile.id);
                Users.updateUser('fb', user, function(err, res){
                    if(err) throw err;
                    return done(null, user);
                });
            }
        });
    
    }))


    //Middleware for Google+
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLECLIENTID,
        clientSecret: process.env.GOOGLECLIENTSECRET,
        callbackURL: 'http://localhost:'+process.env.PORT+'/auth/google/callback',
        passReqToCallback: true

    }, function(req, token, refreshToken, profile, done){
        process.nextTick(function(){
            if(!req.user){
            Users.getUserBy('googleId', profile.id, function(err, user){
                if(err) return done(err);
                    if(user[0]){
                        return done(null, user[0]);
                    }else{
                        Users.registerGoogleUser({
                            googleId: profile.id,
                            token: token,
                            name: profile.displayName,
                            email: profile.emails[0].value
                        }, function(err, res){
                            Users.insertUserInfo(res.insertId, function(err, res) {
                                if (err) return done(null, false, req.flash('registerMessage', "A unknown error occured."));
                            });
                            if(err) throw err;
                            return done(null, res);
                        });
                    }
                });
            }else{
                var user = req.user;
                user.id = req.user.userId;
                user.email = profile.emails[0].value;
                user.google_token = token;
                user.google_id = parseInt(profile.id);
                //maybe do some check and see if email is already defined or something ? We don't want to replace email if different.
                Users.updateUser('google', user, function(err, res){
                    if(err) throw err;
                    return done(null, user);
                });
            }
        })
    }));


};