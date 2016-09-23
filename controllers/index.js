/*********
 *  Our index/general Controllers. This will contain mainly static pages/light weight controllers, like the about, contact etc.
 *******/
 
//If our middleware is longer than 5 lines then use a middleware.
middlewares = require("../middlewares");

module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        res.render('index');
    });

    app.get('/pol', function(req, res){
        res.render('pol', {
            message: req.flash('registerMessage')
        });
    });

    app.get('/register', function(req, res) {
        res.render('register', {
            message: req.flash('registerMessage')
        });
    });

    app.post('/register', passport.authenticate('local-register', {
        successRedirect: '/profile',
        failureRedirect: '/register',
        failureFlash: true
    }));

    app.get('/login', function(req, res) {
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

    app.get('/password', function(req, res) {
        res.render('password', {
            message: req.flash('passwordMessage'),
            successMessage: req.flash("info")
        });
    });

    app.post('/password', middlewares.resetPassword);

    app.get('/reset/:token', middlewares.displayPasswordResetPage);

    app.post('/reset/:token', middlewares.setResetPassword);

    app.get('/profile', middlewares.isLoggedIn, function(req, res) {
        res.render('profile', {
            user: req.user
        });
    });
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
    }));

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

};