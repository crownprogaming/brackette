/**
 * Ouruser-registration routes. This will contain the routes for anything that has to do with user registration.
 * This includes facebook linking, password resetting, loggin, etc.
 */
middlewares = require("../lib/middlewares");

module.exports = function(app, passport) {

    app.get('/register', middlewares.redirectIfLoggedIn, function(req, res) {
        res.render('register', {
            message: req.flash('registerMessage')
        });
    });

    app.post('/register', passport.authenticate('local-register', {
        successRedirect: '/profile',
        failureRedirect: '/register',
        failureFlash: true
    }));

    app.get('/login', middlewares.redirectIfLoggedIn, function(req, res) {
        res.render('login', {
            message: req.flash('loginMessage'),
            successMessage: req.flash("info")
        });
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    }));

    app.get('/profile', middlewares.isLoggedIn, function(req, res) {
        res.render('profile', {
            user: req.user
        });
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    
}; 