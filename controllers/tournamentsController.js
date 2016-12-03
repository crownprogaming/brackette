var middlewares = require("../middlewares");

module.exports = function(app) {

     app.get('/tournaments/create',  middlewares.isLoggedIn, function(req, res){
        res.render('new-tournament');
    });

}