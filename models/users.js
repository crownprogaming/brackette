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
     * @return the results will return an array of objects.
     **/
    getAllUsers: function(callback) {
        var sql = squel.select().from("users")
            .field("users.id").field("users.name").field("profileinfo.profileImg").field("profileinfo.gamerTag")
            .left_join("profileinfo", null, "profileinfo.userId = users.id").toString();
        this._retrieveData(callback, sql);
    },

    /**
     * getUserBy will one user and of it their data by the field and value specified. If you wish to retrieve by id, field should equal 'id'
     * The next parameter, value, should be the value of the field specified. So if type is id, field should be '1'
     * If no field is specified, an error will be thrown.
     * @param {string} field the field type you want to retrieve the user by.
     * @param {field} string value. 
     * @return from the callback, res or results will return an object.
     **/

    getUserBy: function(field, value, callback){
        var sql = "";
        console.log("Using getUserBy");
        console.log(field);
        switch(field){
            case 'id':
                sql = squel.select().from("users")
                .left_join("profileinfo", null, "profileinfo.userId = users.id")
                .where("users.id = ?", value).toString();
                //id is the only left join.
                break;
            case 'email': 
                sql = squel.select().from("users")
                .where("users.email = ?", value).toString();
                break;
            case 'facebookId':
                sql = squel.select().from("users")
                .where("users.facebook_id = ?", value).toString();
                break;
            case 'googleId':
                sql = squel.select().from("users")
                .where("users.google_id = ?", value).toString();
                break;
            case 'resetToken':
                sql = squel.select().from("users")
                .where("users.resetPasswordToken = ?", value).toString();
                break;
            default: 
                throw new Error("FIELD MUST BE SPECIFIED");

        }
        this._retrieveData(callback, sql);
    },

    /**
     * getUserById will retrieve one user from the db via the id specified.
     * This method is available via the API. Certain type of data will not be display.
     * @param id, either int or string
     * @param callback, your callback function
     * @return from the callback, res or results will return an object.
     **/
    getUserById: function(id, callback) {
        var sql = squel.select().from("users")
            .field("users.id").field("users.name").field("profileinfo.profileImg").field("profileinfo.gamerTag")
            .left_join("profileinfo", null, "profileinfo.userId = users.id").where("users.id = ?", id).toString();
        this._retrieveData(callback, sql);
    },

   
    registerUser: function(reqBody, callback) {
        var sql = squel.insert()
            .into('users')
            .set("name", reqBody.name).set("password", reqBody.password).set("email", reqBody.email).toString();
        this._retrieveData(callback, sql);
    },

    /**
     * registerFacebookUser will register one user to the db via Facebook.
     * This method is not available via the API.
     * @param reqBody, object that contains data for registering the user. reqBody should contain a name, a facebook token, facebook id, and a email.
     * @param callback, your callback function
     * @return from the callback, res or results will return an object.
     **/
    registerFacebookUser: function(reqBody, callback){
        var sql = squel.insert()
            .into('users')
            .set("name", reqBody.name).set("facebook_token", reqBody.token).set("email", reqBody.email).set("facebook_id", reqBody.facebookId).toString();
        this._retrieveData(callback, sql);
    },


    /**
     * registerFacebookUser will register one user to the db via Google.
     * This method is not available via the API.
     * @param reqBody, object that contains data for registering the user. reqBody should contain a name, a facebook token, facebook id, and a email.
     * @param callback, your callback function
     * @return from the callback, res or results will return an object.
     **/
    registerGoogleUser: function(reqBody, callback){
        var sql = squel.insert()
            .into('users')
            .set("name", reqBody.name).set("google_token", reqBody.token).set("email", reqBody.email).set("google_id", reqBody.googleId).toString();
        this._retrieveData(callback, sql);
    },

    /**
     * insertUserInfo will insert data to the user information table via the ID specified.
     * This method is not available via the API.
     * @param id, of an existing user. int or string.
     * @param callback, your callback function
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
     * @param callback, your callback function
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
     * @param callback, your callback function
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
     * Generates a hash value of a string.
     * This method is not available via the API.
     * @param {string} password; can be anything.
     * @return {string} a hashed password.
     **/
    generateHash: function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    },

    /**
     * Checks whether a password and hashed password matches.
     * This method is not available via the API.
     * @param {string} password the password string, not hashed.
     * @param {string} hashedPassword a hashed password
     * @return {boolean} true of false if passed matches or not.
     **/
    validPassword: function(password, hashedPassword) {
        return bcrypt.compareSync(password, hashedPassword);
    },

    //Begin 'Private' methods. Private methods will only be used in this file, not elsewhere.

    /**
     * _retrieveData runs a sql query and retrieves the data from the database
     * This method is not available via the API nor should it be used elsewhere.
     * @param callback, a function(err, res){ do stuff here }
     * @param sql, a sql query.
     * @return from the callback, res or results will return an object or an object, depending on what the sql query was.
     * @private
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