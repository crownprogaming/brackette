var sequelize = require('../config').getSequelize();
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
        type: Sequelize.BIGINT(255),
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
});
Users.sync();
module.exports = Users;