/********
 * This is our custom database queries for Users, pulls in data for users.
 * TODO: Assure we return proper information for users.
 *********/
var pool = require('../config').getPool();
var squel = require('squel');
var bcrypt = require('bcrypt-nodejs');

exports.Users = {
    /**
     * getAllusers will retrieve all of the users from the db. 
     * This method is available via the API. certain type of data will not be display.
     * @param callback is a function(err, results){ process data here }
     * @return , the results will return an array of objects.
     **/
    getAllUsers: function(callback) {
        var sql = squel.select().from("users")
            .field("users.id").field("users.name").field("profileinfo.profileImg").field("profileinfo.gamerTag")
            .left_join("profileinfo", null, "profileinfo.userId = users.id").toString();
        this._retrieveData(callback, sql);
    },

    /**
     * getUserById will retrieve one user from the db via the id specified.
     * This method is available via the API. certain type of data will not be display.
     * @param id, either int or string 
     * @return from the callback, res or results will return an object.
     **/
    getUserById: function(id, callback) {
        var sql = squel.select().from("users")
            .field("users.id").field("users.name").field("profileinfo.profileImg").field("profileinfo.gamerTag")
            .left_join("profileinfo", null, "profileinfo.userId = users.id").where("users.id = ?", id).toString();
        this._retrieveData(callback, sql);
    },

    /**
     * getUserByEmail will retrieve one user from the db via the email specified.
     * This method is not available via the API. Thus, we can retrieve all of the information from the users table.
     * @param email, string 
     * @return from the callback, res or results will return an object.
     **/
    getUserByEmail: function(email, callback) {
        var sql = squel.select().from("users")
            .where("users.email = ?", email).toString();
        this._retrieveData(callback, sql);
    },

    /**
     * getUserByToken will retrieve one user from the db via the token specified.
     * This method is not available via the API. Thus, we can retrieve all of the information from the users table.
     * @param token, string 
     * @return from the callback, res or results will return an object.
     **/
    getUserByToken: function(token, callback) {
        var sql = squel.select().from("users")
            .where("users.resetPasswordToken = ?", token).toString();
        this._retrieveData(callback, sql);
    },

    /**
     * getUserByToken will register one user to the db.
     * This method is not available via the API.
     * @param reqBody, object that contains data for registering the user. reqBody should contain a name, a hashed password, and a email. 
     * @return from the callback, res or results will return an object.
     **/
    registerUser: function(reqBody, callback) {
        var sql = squel.insert()
            .into('users')
            .set("name", reqBody.name).set("password", reqBody.password).set("email", reqBody.email).toString();
        this._retrieveData(callback, sql);
    },

    /**
     * insertUserInfo will insert data to the user information table via the ID specified.
     * This method is not available via the API.
     * @param id, of an existing user. int or string.
     * @return from the callback, res or results will return an object.
     **/
    insertUserInfo: function(id, callback) {
        var sql = squel.insert()
            .into('profileinfo')
            .set("userID", id).set("profileImg", "").set("gamerTag", "").toString();
        this._retrieveData(callback, sql);
    },

    /**
     * updateUserToken will update/insert token information to an existing user.
     * This method is not available via the API.
     * @param tokenInfo, an object that contains information needed for the token. this includes email, token, and exiparation date.
     * @return from the callback, res or results will return an object.
     **/
    updateUserToken: function(tokenInfo, callback) {
        var sql = squel.update()
            .table('users')
            .set("resetPasswordToken", tokenInfo.resetPasswordToken).set("resetPasswordExpires", tokenInfo.resetPasswordExpires)
            .where("users.email = ?", tokenInfo.email).toString();
        this._retrieveData(callback, sql);
    },

    /**
     * updateUserPassword will update the users password.
     * This method is not available via the API.
     * @param passwordInfo, an object that contains information needed for the token. this includes pass, token, id, and exiparation date.
     * @return from the callback, res or results will return an array of one object.
     **/
    updateUserPassword: function(passwordInfo, callback) {
        var sql = squel.update()
            .table('users')
            .set("password", passwordInfo.pass).set("resetPasswordToken", passwordInfo.resetPasswordToken).set("resetPasswordExpires", passwordInfo.resetPasswordExpires)
            .where("users.id = ?", passwordInfo.id).toString();
        this._retrieveData(callback, sql);
    },

    /**
     * generateHash generates a hash value of a string.
     * This method is not available via the API.
     * @param password, any type of string.
     * @return string, a hashed password.
     **/
    generateHash: function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    },

    /**
     * validPassword checks whether a password matches that in the database.
     * This method is not available via the API.
     * @param enteredPassword, the password entered by the user, string, not hashed.
     * @param dbPassword, the hashed password that is retrieved from the database.
     * @return string, a hashed password.
     **/
    validPassword: function(enteredPassword, dbPassword) {
        return bcrypt.compareSync(enteredPassword, dbPassword);
    },

    //Begin 'Private' methods. Private methods will only be used in this file, not elsewhere.

    /**
     * _retrieveData runs a sql query and retrieves the data from the database
     * This method is not available via the API nor should it be used elsewhere.
     * @param callback, a function(err, res){ do stuff here }
     * @param sql, a sql query.
     * @return from the callback, res or results will return an object or an object, depending on what the sql query was.
     **/
    _retrieveData: function(callback, sql) {
        pool.getConnection(function(err, connection) {
            if (err) {
                console.log(err);
                callback(true);
                return;
            }

            //Perform the query
            connection.query(sql, function(err, results) {
                //Release our connection
                connection.release();
                if (err) {
                    console.log(err);
                    callback(true);
                    return;
                }
                callback(false, results);
            });
        });
    }

};