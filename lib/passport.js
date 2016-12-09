/**
 * Passport.js serves as our authentication tool.
 */
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var Users = require('../models/users');
var nodemailer = require("nodemailer");
var sgTransport = require('nodemailer-sendgrid-transport');
var Tools = require("../lib/helpers");
module.exports = function(passport) {
    /**
     * Used to serialize the user for the session, essentially this gets the users id and with it, creates a session for user.
     */
    passport.serializeUser(function(user, done) {
        done(null, user.insertId || user.id || user.facebook_id);
    });

    /**
     * The information in that session based on what we retrieve via ID.
     */
    passport.deserializeUser(function(id, done) {
         Users.findById(id).then(function(user){
            done(null, user);
        }).catch(function(err){
            logger.error("Problem occured when trying to desearilize user. Message:" + err.message);
            done(null, false);
        });
    });

    /**
     * Passport Middleware for our local register
     */
    passport.use('local-register', new LocalStrategy({
            usernameField: "email",
            passwordField: "password",
            passReqToCallback: true
        }, function(req, email, password, done) {
            process.nextTick(function() {
                //See if email is taken. Create user else...
                Users.findOrCreate({
                    where: {
                        email: email
                    },
                    defaults: {
                        name: req.body.name,
                        email: email,
                        password: Tools.generateHash(password),
                        userInfo: {gamerTag:"",profileImg:""} //be careful here.
                    }
                }).spread(function(user, created){
                    if(created){
                        //we created a new user.
                        //TODO: Send an email here.
                        logger.info("A user with the e-mail of "+email+" has registered!");
                        done(null, user);
                    }else{
                        done(null, false, req.flash('registerMessage', "That E-mail is already taken."));
                    }
                }).catch(function(err){
                    logger.error("Problems occured when trying to register user. Message:" + err.message);
                    done(null, false, req.flash('registerMessage', "A unknown error occured."));
                });
            });
    }));

    /**
     * Passport Middleware for our local register
     */
    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true 
        }, function(req, email, password, done) {
            Users.findOne({where:{
                email: email
            }}).then(function(user){
                if(!user){
                    return done(null, false, req.flash('loginMessage', 'No user exists.'));
                }else{
                    if(user.password){
                        //we have a password
                        if(!Tools.validPassword(password, user.password)){
                            logger.warn("User id "+user.id+" attempted to login but entered the wrong password. Mhmm?");
                            //TODO: Change error messages for flash.
                            return done(null, false, req.flash('loginMessage', 'Password no matches')); // create the loginMessage and save it to session as flashdata
                        }else{
                            return done(null, user);
                        }
                    }else if((user.password === null) && user.facebookToken){
                        done(null, false, req.flash('loginMessage', 'Wrong E-mail and/or Password'));
                    }else{
                        return done(null, false, req.flash('loginMessage', 'No Password')); //no password ?
                    }
                }
            }).catch(function(err){
                logger.error("Problems occured when trying to login a user. Message:" + err.message);
                return done(null, false, req.flash('loginMessage', 'Something went wrong.'));            
            });
    }));    
    //TODO: Facebook and Google+ Authentication.
};