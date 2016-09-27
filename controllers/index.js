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
    app.get('/auth/facebook', middlewares.redirectIfLoggedIn, passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
    }));

    app.get('/auth/google', middlewares.redirectIfLoggedIn, passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // // locally --------------------------------
    // app.get('/connect/local', function(req, res) {
    //     res.render('connect-local', { message: req.flash('loginMessage') });
    // });
    // app.post('/connect/local', passport.authenticate('local-signup', {
    //     successRedirect : '/profile', // redirect to the secure profile section
    //     failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
    //     failureFlash : true // allow flash messages
    // }));

    // app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));
    // app.get('/connect/facebook/callback',
    //     passport.authorize('facebook', {
    //         successRedirect : '/profile',
    //         failureRedirect : '/'
    // }));


    app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
    }));


    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

};