/*********
 *  Our API Controllers. 
 *******/
var Users = require('../models/users').Users;
var USERS2 = require('../models/users2');
var notFoundJSON = {
    "Error": "404",
    "Message": "Object was not found."
};

var userOptions = {
    attributes:{
        // exclude: ['id', 'updatedAt'] for now show all.
    }
};

module.exports = function(app) {

    //Users - GET METHODS
    app.get('/api/users', function(req, res) {

        USERS2.findAll(userOptions).then(function(user){
            res.json(user);
        }).catch(function(err){
            res.status(500).send("Server Error");
        });
    });

    app.get('/api/users/:id', function(req, res) {
        USERS2.findById(req.params.id, userOptions).then(function(user){
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
        res.send("Here all the tournaments would be displayed.");
    });

};