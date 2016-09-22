/*********
 *  Our API Controllers. 
 *******/
var Users = require('../models/users').Users;
var notFoundJSON = {
    "Error": "404",
    "Message": "Object was not found."
};

module.exports = function(app) {

    //Users - GET METHODS
    app.get('/api/users', function(req, res) {
        Users.getAllUsers(function(err, results) {
            if (err) {
                res.status(500).send("Server Error");
                return;
            }
            res.json(results);
        });
    });

    app.get('/api/users/:id', function(req, res) {
        Users.getUserById(req.params.id, function(err, results) {
            if (err) {
                res.status(500).json({
                    "Error": "Something went wrong."
                });
                return;
            }
            if (results === null || results == [] || results === "" || results === undefined) {
                res.json(notFoundJSON);
                return;
            }
            res.json(results[0]);
        });
    });


    //Users - POST METHODS
    app.post('/api/users', function(req, res) {
        Users.registerUser(req.body, function(err, results) {
            if (err) {
                res.send(500, "Server Error");
                return;
            }
            if (results === null || results == [] || results === "" || results === undefined) {
                res.json(notFoundJSON);
                return;
            }
            console.log("New user was created!");
            res.json(results.insertId);
        });
    });

    //Tournaments - GET 
    app.get('/api/tournaments', function(req, res) {
        res.send("Here all the tournaments would be displayed.");
    });

};