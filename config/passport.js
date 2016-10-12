/*
 *	Passport.js serves as our authentication tool.
 */
//TODO: Send email when user registered via facebook. (Make email into funtion and just call it ?)
//TODO: What happens if users links both facebook and google account with different emails ? Throw error ? Override email ? Display warning ? 
//TODO: What happens if they disconnect facebook and have no email ? How should this be handled ?
//TODO: Allow users to reconnect after disconnecting.
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var Users = require('../models/users').Users;
var USERS2 = require('../models/users2');
var UserInfo = require('../models/userInfo');
var nodemailer = require("nodemailer");
var sgTransport = require('nodemailer-sendgrid-transport');
USERS2.hasMany(UserInfo, {foreignKey: 'userId'});
UserInfo.belongsTo(USERS2, {foreignKey: 'userId'});
var userOptions = {
    include: [{
        model: UserInfo
    }]
};
module.exports = function(passport) {

    //used to serialize the user for the session, essentially this gets the users id and with it, creates a session for user.
    passport.serializeUser(function(user, done) {
        done(null, user.insertId || user.id || user.facebook_id);
    });

    //The information in that session based on what we retrieve via ID.
    passport.deserializeUser(function(id, done) {
         USERS2.findById(id, userOptions).then(function(user){
            done(null, user);
        }).catch(function(err){
            done(null, false);
        });
    });
 
    //middleware for our local register
    passport.use('local-register', new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
    }, function(req, email, password, done) {
        process.nextTick(function() {
            //See if email is taken. Create user else...
            USERS2.findOrCreate({
                where: {
                    email: email
                },
                defaults: {
                    name: req.body.name,
                    email: email,
                    password: password
                }
            }).spread(function(user, created){
                if(created){
                    //we created a new user. so create their user Info too.
                    UserInfo.create({
                        userId: user.id
                    }).then(function(){
                        //Send Email here.
                        done(null, user);
                    }).catch(function(err){
                        done(null, false, req.flash('registerMessage', "A unknown error occured."));
                    });
                }else{
                    done(null, false, req.flash('registerMessage', "That E-mail is already taken."));
                }
            }).catch(function(err){
                    done(null, false, req.flash('registerMessage', "A unknown error occured."));
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
        clientID: process.env.FBCLIENTID,
        clientSecret  : process.env.FBCLIENTSECRET,
        callbackURL   : 'http://'+process.env.HOST+':'+process.env.PORT+'/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'name', 'email'], // get profile image ? add to UserInfo table ?
        passReqToCallback: true
    }, function(req, token, refreshToken, profile, done){
        process.nextTick(function(){
            if(!req.user){ //is user currenlt logged in ? no ? Then run code below.
                Users.getUserBy('facebookId', profile.id, function(err, user){
                    if(err) return done(err); //there was an error.
                    if(user[0]){
                        return done(null, user[0]); //user found, return that user.
                    }else{
                        //user does not exists based on FB id, check if email matches that of database and facebook.
                        Users.getUserBy('email', profile.emails[0].value, function(err, userViaEmail){
                            if(err) return done(err);
                            if(userViaEmail[0]){
                                //email matches, so update user that exists with facebook information.
                                var user = {};
                                user.id = userViaEmail[0].id;
                                //user.email = userViaEmail[0].email; do not update email
                                user.facebook_token = token;
                                user.facebook_id = parseInt(profile.id);
                                Users.updateUser('fb', user, function(err, res){
                                    if(err) throw err;
                                    return done(null, user);
                                });
                            }else{
                                //email does not match, so create a new user.
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
            if(!req.user){ //is user logged in ? 
            Users.getUserBy('googleId', profile.id, function(err, user){
                if(err) return done(err);
                    if(user[0]){
                        return done(null, user[0]); //user exists via google id, return user.
                    }else{
                        //user does not exists, but do they exists via email ?
                        Users.getUserBy('email', profile.emails[0].value, function(err, userViaEmail){
                            if(userViaEmail[0]){
                                //email matches, ! So that means that there is a user without a linked google account.
                                //link the account!
                                var user = {};
                                user.id = userViaEmail[0].id;
                                //user.email = userViaEmail[0].email; do not override email. TODO: Will this affect login ? 
                                user.google_token = token;
                                user.google_id = parseInt(profile.id);
                                Users.updateUser('google', user, function(err, res){
                                    if(err) throw err;
                                    return done(null, user);
                                });
                            }else{
                                 //no email account, AND no user exists...create new user based 
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
                    }
                });
            }else{
                var user = req.user;
                user.id = req.user.userId;
                user.email = profile.emails[0].value;
                user.google_token = token;
                user.google_id = parseInt(profile.id);
                Users.updateUser('google', user, function(err, res){
                    if(err) throw err;
                    return done(null, user);
                });
            }
        })
    }));


};