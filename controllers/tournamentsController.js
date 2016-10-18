var middlewares = require("../middlewares");

module.exports = function(app) {

     app.get('/tournaments', function(req, res){
        res.render('tournaments');
    });

}