/**
 * Our API Routes.
 */
var Users = require("../models/Users");
var Tournaments = require("../models/Tournaments");
var notFoundJSON = {
    Error: "404",
    Message: "Object was not found."
};
var userOptions = {
    attributes: {
        exclude: ['id', 'updateAt']
    }
};

module.exports = function(app){

    app.get('/api/users', function(req, res) {
        Users.findAll(userOptions).then(function(user){
            res.json(user);
        }).catch(function(err){
            res.status(500).send("Server Error");
        });
    });

    app.get('/api/users/:id', function(req, res) {
        Users.findById(req.params.id, userOptions).then(function(user){
            if(user == null || user == [] || user == "" || user == undefined || user == {} || (isNaN(req.params.id))) {
                res.json(notFoundJSON);
                return;
            }
            res.json(user);
        }).catch(function(err){
            res.status(500).send("Server Error");
        });
    });

    app.post('/api/users', function(req, res) {
        
    });

    app.get('/api/tournaments', function(req, res) {
        Tournaments.findAll().then(function(tournament){
            res.json(tournament);
        }).catch(function(err){
            res.status(500).send("Server Error");
        });
    });



}