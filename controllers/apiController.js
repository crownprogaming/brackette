/*********
 *  Our API Controllers. 
 *******/
var Users = require('../models/users').Users;
var Users = require('../models/users2');
var UserInfo = require('../models/userInfo');
var Tournaments = require("../models/tournaments");
var notFoundJSON = {
    "Error": "404",
    "Message": "Object was not found."
};

var userOptions = {
    attributes:{
        exclude: ['id', 'updatedAt']
    },
    include: [{
        model: UserInfo
    }]
};

module.exports = function(app) {

    //Users - GET METHODS
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


    //Users - POST METHODS
    app.post('/api/users', function(req, res) {
       
    });

    //Tournaments - GET 
    app.get('/api/tournaments', function(req, res) {
        Tournaments.findAll().then(function(tournament){
            res.json(tournament);
        }).catch(function(err){
            res.status(500).send("Server Error");
        });
    });

};