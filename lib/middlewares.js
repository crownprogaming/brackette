/**
 * Middlwares.js provides us with custom middleware tools.
 */
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var crypto = require('crypto');
var Users = require('../models/users');
var Tournaments = require("../models/tournaments");
var moment = require("moment");
var nodemailer = require("nodemailer");
var sgTransport = require('nodemailer-sendgrid-transport');

module.exports = {

    /**
     * Allow user to continue to certain site if they are logged in. Else kick them out.
     */
    isLoggedIn: function(req, res, next) {
        console.log("checking if logged in ->"+req.isAuthenticated());
        if (req.isAuthenticated()) return next();
        res.redirect('/register');
    },

    /**
     * Setup global variables for every view to use.
     * 
     * Every ejs file must know if we are logged in or not. This passes the variable of
     * is authenticated to every file. Setup more variables here too.
     */
    setLocals: function(req, res, next){
        res.locals.loggedIn = req.isAuthenticated();
        res.locals.user = req.user ? req.user : {}
        next();
    },

    /**
     * If user is logged in, redirect them elsewhere. 
     */
    redirectIfLoggedIn: function(req, res, next){
        console.log("Is user logged in?: -> "+req.isAuthenticated());
        if(req.isAuthenticated()){
            return res.redirect("/profile");
        }
        return next();
    },

    //TODO: Fix Facebook and Password reset code.

    //TODO: what happens if user disconnects accounts but has no password ? maybe we should setup a default password 
    //TODO: Update this method with sequelize.
    //if they register via facebook/google ? 
    disconnectFacebook: function(req, res, next){
        req.user.facebook_token = null;
        Users.updateUser('fb', req.user, function(err, succ){
            if(err) throw err;
            return res.redirect("/profile");
        });
    }, 

    //TODO: Update this method with sequelize.
    disconnectGoogle: function(req, res, next){
        req.user.google_token = null;
        Users.updateUser('google', req.user, function(err, succ){
            if(err) throw err;
            return res.redirect("/profile");
        });
    },

    //TODO: Fix this.
    updateProfileInfo: function(req, res, next){
        UserInfos.update(req.body,
            {
            where:{
                userId: req.user.id
            } 
        }).then(function(result){
            console.dir(result);
            console.log("User was updated! Yay");
            var response = {
                status: 200,
                success: 'Updated Successfully'
            }
            res.end(JSON.stringify(response));
        }).catch(function(err){
            console.log("Something went wrong when updating the users profile page.");
        })
    },

    /**
     * Authenticate and check if they have admin priveldge
     */
    isAdmin: function(req, res, next) {
        console.log("Checking admin priveldge...");
        return next();
    },

    //TODO: Update this method with sequelize.
    resetPassword: function(req, res, next) {
        async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                Users.getUserBy('email', req.body.email, function(err, user) {
                    if (!user[0]) {
                        req.flash('passwordMessage', "Could not find user.");
                        return res.redirect("/password");
                    }
                    Users.updateUserToken({
                        resetPasswordToken: token,
                        resetPasswordExpires: moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
                        email: user[0].email
                    }, function(err, user) {
                        if (err) {
                            req.flash('passwordMessage', "Something went wrong.");
                            return res.redirect("/password");
                        }
                    });
                    done(err, token, user[0]);
                });
            },
            function(token, user, done) {

                var options = {
                    auth: {
                        api_key: process.env.SENGRID_API
                    }
                };
                var smtpTransport = nodemailer.createTransport(sgTransport(options));
                var mailOptions = {
                    to: user.email,
                    from: 'passwordreset@demo.com',
                    subject: 'Node.js Reset Password',
                    text: "Someone requested to reset your password, here is the link to do so: " + 'http://' + req.headers.host + '/reset/' + token + '\n\n'
                };
                // smtpTransport.sendMail(mailOptions, function(err) {
                //     if (err) {
                //         console.dir(err);
                //         req.flash('passwordMessage', "Something went wrong, could not send email.");
                //         return res.redirect("/password");
                //     }
                //     req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                //     done(null, 'done');
                // });

            }
        ], function(err) {
            if (err) return next(err);
            res.redirect("/password");
        });
    },

    //TODO: Update this method with sequelize.
    displayPasswordResetPage: function(req, res, next) {
        Users.getUserBy('resetToken', req.params.token, function(err, results) {
            if (err) {
                res.redirect("/");
                return;
            }
            if (results === null || results == [] || results === "" || results === undefined) {
                res.redirect("/");
                return;
            }
            //Check if date has expired.
            res.render('reset', {
                token: req.params.token
            });
        });
    },

    //TODO: Update this method with sequelize.
    setResetPassword: function(req, res, next) {
        async.waterfall([
            function(done) {
                Users.getUserBy('resetToken', req.params.token, function(err, results) {
                    if (err || moment() > moment(results[0].resetPasswordExpires)) {
                        console.dir("Date has expired! Or maybe the token is wrong...");
                        req.flash('passwordMessage', 'Password reset token is invalid or has expired. Please send a new email.');
                        return res.redirect('/password');
                    }
                    var newData = {
                        id: results[0].id,
                        pass: Users.generateHash(req.body.password),
                        resetPasswordToken: null,
                        resetPasswordExpires: null
                    };
                    Users.updateUserPassword(newData, function(err, results) {
                        if (err) {
                            req.flash('passwordMessage', "Something went wrong!");
                            return res.redirect("/password");
                        }
                    });
                    done(err, results[0]);
                });
            },
            function(user, done) {
                var options = {
                    auth: {
                        api_key: process.env.SENGRID_API
                    }
                };
                var smtpTransport = nodemailer.createTransport(sgTransport(options));
                var mailOptions = {
                    to: user.email,
                    from: 'passwordreset@demo.com',
                    subject: 'Your password has been changed.',
                    text: 'Hello,\n\n' + 'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                    if (err) {
                        console.dir(err);
                        req.flash('passwordMessage', "Something went wrong, could not send email!");
                        return res.redirect("/password");
                    }
                    req.flash('info', 'Success! Your password has been changed.');
                    done(err);
                });
            }
        ], function(err) {
            if (err) return next(err);
            res.redirect('/login');
        });
    }


};