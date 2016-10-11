var sequelize = require('../config').getSequelize();
var Sequelize = require('sequelize');
var Users = sequelize.define('users', {
    name: {
        type: Sequelize.STRING(150),
        field: 'name'
    },
    email: {
        type: Sequelize.STRING(150),
        field: 'email'
    },
    password: {
        type: Sequelize.STRING(150),
        field: 'password'
    },
    resetPasswordToken: {
        type: Sequelize.STRING(200),
        field: 'reset_password_token'
    },
    resetPasswordExpires: {
        type: Sequelize.DATE,
        field: 'reset_password_expires'
    },
    facebookToken: {
        type: Sequelize.STRING(255),
        field: 'facebook_token'
    },
    facebookId: {
        type: Sequelize.BIGINT(255),
        field: 'facebook_id'
    },
    googleToken: {
        type: Sequelize.STRING(255),
        field: 'google_token'
    },
    googleId: {
        type: Sequelize.STRING(255),
        field: 'google_id'
    },
});
Users.sync();
module.exports = Users;