/**
 * This is our database table setup for Users.
 */
var sequelize = require('../lib/db').getSequelize();
var Sequelize = require('sequelize');
var Users = sequelize.define('users', {
    name: {
        type: Sequelize.STRING(150),
        field: 'name',
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING(150),
        field: 'email',
        allowNull: false
    },
    password: {
        type: Sequelize.STRING(150),
        field: 'password',
        allowNull: false
    },
    resetPasswordToken: {
        type: Sequelize.STRING(200),
        field: 'reset_password_token',
        defaultValue: null,
    },
    resetPasswordExpires: {
        type: Sequelize.DATE,
        field: 'reset_password_expires',
        defaultValue: null
    },
    facebookToken: {
        type: Sequelize.STRING(255),
        field: 'facebook_token',
        defaultValue: null
    },
    facebookId: {
        type: Sequelize.BIGINT(),
        field: 'facebook_id',
        defaultValue: null
    },
    googleToken: {
        type: Sequelize.STRING(255),
        field: 'google_token',
        defaultValue: null
    },
    googleId: {
        type: Sequelize.STRING(255),
        field: 'google_id',
        defaultValue: null
    },
    userInfo: {
        type: Sequelize.JSON(),
        field: 'user_info',
        defaultValue: null
    }
});
/**
 * Always add a test user.
 */
Users.sync({force: true}).then(function(){
    return Users.create({
        name: "Daniel Reguero",
        email: "daniel.reguero@hotmail.com",
        password: "password",
        userInfo: {
            gamerTag: "DEEJAY",
            profileImg: "https://google/com"
        },
        createdAt: new Date(),
        updateAt: new Date()
    });
}).catch(Sequelize.UniqueConstraintError, function(err){
    //TODO: Find out what this is ???
    logger.error("There was a error with sequelize when attempting to"+
    " generate the model and seed the database. Message:" + err.message);
});

module.exports = Users;