/**
 * Our index/general routes. This will contain mainly static pages/light weight routes, like the about page, contact etc.
 */

module.exports = function(app) {

    app.get('/', function(req, res) {
        res.render('index');
    });

};